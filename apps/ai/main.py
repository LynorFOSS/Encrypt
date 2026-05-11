from __future__ import annotations

from collections.abc import AsyncIterator, Sequence
from datetime import datetime, timezone
import json
from typing import Any

import httpx
from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from pydantic import Field
from pydantic_settings import BaseSettings

from packages.shared.python.encrypt_shared import demo_search_results
from packages.shared.python.encrypt_shared.models import AIResponse, SearchResult, SourceDocument


class Settings(BaseSettings):
    ollama_url: str = Field(default="http://localhost:11434", alias="OLLAMA_URL")
    model: str = Field(default="tinyllama", alias="OLLAMA_MODEL")
    search_url: str = Field(default="http://localhost:8001", alias="SEARCH_URL")
    timeout_seconds: float = 8.0


settings = Settings()
app = FastAPI(title="Encrypt AI", version="0.1.0")


class AiRequest(BaseModel):
    query: str
    context: list[str] = Field(default_factory=list)
    source_ids: list[str] = Field(default_factory=list, alias="sourceIds")
    stream: bool = False


class ExplainRequest(BaseModel):
    title: str
    url: str
    excerpt: str = ""
    stream: bool = False


class CompareRequest(BaseModel):
    left: str
    right: str
    context: list[str] = Field(default_factory=list)
    stream: bool = False


def envelope(data: Any = None, *, error: str | None = None, ok: bool = True) -> dict[str, Any]:
    return {"ok": ok, "data": data, "error": error}


def retrieve_sources(query: str) -> list[SearchResult]:
    try:
        with httpx.Client(timeout=settings.timeout_seconds) as client:
            response = client.get(f"{settings.search_url}/search", params={"q": query, "limit": 5})
            response.raise_for_status()
            payload = response.json().get("data", [])
            return [SearchResult.model_validate(item) for item in payload]
    except Exception:
        return [SearchResult.model_validate(item) for item in demo_search_results]


def build_prompt(kind: str, query: str, sources: Sequence[SearchResult], extra_context: Sequence[str] = ()) -> str:
    citations = "\n".join(f"- {source.title} | {source.sourceUrl}" for source in sources)
    context = "\n".join(f"- {item}" for item in extra_context)
    return (
        f"You are Encrypt, a finance-first research assistant.\n"
        f"Task: {kind}\n"
        f"Question: {query}\n"
        f"Context:\n{context or '- none'}\n"
        f"Use only the provided sources when possible. Cite sources explicitly.\n"
        f"Sources:\n{citations or '- none'}\n"
        f"Answer in concise bullet points and note uncertainty."
    )


def local_fallback(kind: str, query: str, sources: Sequence[SearchResult], extra_context: Sequence[str] = ()) -> AIResponse:
    citations = [source.sourceUrl for source in sources]
    summary_lines = [f"{kind.title()} for: {query}"]
    if extra_context:
        summary_lines.append(f"Context: {'; '.join(extra_context)}")
    if sources:
        summary_lines.append("Sources:")
        summary_lines.extend([f"- {source.title}: {source.summary}" for source in sources])
    summary_lines.append("This answer was generated locally as a fallback when Ollama was unavailable.")
    return AIResponse(id=f"ai-{int(datetime.now(timezone.utc).timestamp())}", model="fallback-local", answer="\n".join(summary_lines), citations=citations, streaming=False)


async def stream_ollama(prompt: str) -> AsyncIterator[str]:
    payload = {"model": settings.model, "stream": True, "messages": [{"role": "system", "content": "You are a finance research assistant."}, {"role": "user", "content": prompt}]}
    try:
        async with httpx.AsyncClient(timeout=None) as client:
            async with client.stream("POST", f"{settings.ollama_url}/api/chat", json=payload) as response:
                response.raise_for_status()
                async for line in response.aiter_lines():
                    if not line.strip():
                        continue
                    item = json.loads(line)
                    delta = item.get("message", {}).get("content", "")
                    if delta:
                        yield delta
                    if item.get("done"):
                        break
    except Exception:
        yield ""


async def answer_request(kind: str, query: str, extra_context: Sequence[str] = (), stream: bool = False) -> AIResponse | StreamingResponse:
    sources = retrieve_sources(query)
    prompt = build_prompt(kind, query, sources, extra_context)
    if stream:
        async def event_stream() -> AsyncIterator[bytes]:
            emitted = False
            try:
                async for chunk in stream_ollama(prompt):
                    emitted = True
                    yield f"data: {chunk}\n\n".encode("utf-8")
                if not emitted:
                    fallback = local_fallback(kind, query, sources, extra_context)
                    yield f"data: {fallback.answer}\n\n".encode("utf-8")
            except Exception:
                fallback = local_fallback(kind, query, sources, extra_context)
                yield f"data: {fallback.answer}\n\n".encode("utf-8")

        return StreamingResponse(event_stream(), media_type="text/event-stream")

    try:
        async with httpx.AsyncClient(timeout=settings.timeout_seconds) as client:
            response = await client.post(
                f"{settings.ollama_url}/api/chat",
                json={
                    "model": settings.model,
                    "stream": False,
                    "messages": [
                        {"role": "system", "content": "You are a finance-first research assistant."},
                        {"role": "user", "content": prompt},
                    ],
                },
            )
            response.raise_for_status()
            content = response.json().get("message", {}).get("content") or response.json().get("response", "")
            answer = AIResponse(
                id=f"ai-{int(datetime.now(timezone.utc).timestamp())}",
                model=settings.model,
                answer=content,
                citations=[source.sourceUrl for source in sources],
                streaming=False,
            )
            return answer
    except Exception:
        return local_fallback(kind, query, sources, extra_context)


@app.get("/health")
def health() -> dict[str, Any]:
    return envelope({"service": "ai", "model": settings.model, "ollama": settings.ollama_url})


@app.post("/ai/chat")
async def chat(payload: AiRequest) -> Any:
    return await answer_request("chat", payload.query, payload.context, payload.stream)


@app.post("/ai/summarize")
async def summarize(payload: AiRequest) -> Any:
    return await answer_request("summarize", payload.query, payload.context, payload.stream)


@app.post("/ai/explain")
async def explain(payload: ExplainRequest) -> Any:
    context = [f"Title: {payload.title}", f"URL: {payload.url}", f"Excerpt: {payload.excerpt}".strip()]
    return await answer_request("explain", payload.title, context, payload.stream)


@app.post("/ai/compare")
async def compare(payload: CompareRequest) -> Any:
    query = f"Compare {payload.left} vs {payload.right}"
    return await answer_request("compare", query, payload.context, payload.stream)
