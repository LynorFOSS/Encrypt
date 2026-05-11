from __future__ import annotations

from collections.abc import Sequence
from datetime import datetime, timezone
from typing import Any

import httpx
from fastapi import FastAPI, Query
from pydantic import Field
from pydantic_settings import BaseSettings

from packages.shared.python.encrypt_shared import demo_search_results, demo_source_documents
from packages.shared.python.encrypt_shared.models import SearchResult, SourceDocument


class Settings(BaseSettings):
    meili_url: str = Field(default="http://localhost:7700", alias="MEILI_URL")
    meili_master_key: str = Field(default="encrypt-dev-key", alias="MEILI_MASTER_KEY")
    index_name: str = Field(default="finance", alias="MEILI_INDEX")
    timeout_seconds: float = 4.0


settings = Settings()
app = FastAPI(title="Encrypt Search", version="0.1.0")


def envelope(data: Any = None, *, error: str | None = None, ok: bool = True) -> dict[str, Any]:
    return {"ok": ok, "data": data, "error": error}


def _headers() -> dict[str, str]:
    return {"Authorization": f"Bearer {settings.meili_master_key}"} if settings.meili_master_key else {}


def _documents() -> list[SourceDocument]:
    return [*demo_source_documents]


def _result_from_source(document: SourceDocument, score: float) -> SearchResult:
    return SearchResult(
        id=document.id,
        title=document.title,
        summary=document.body[:220],
        sourceType=document.source_type if document.source_type in {"news", "filing", "transcript", "company", "asset"} else "news",
        symbols=document.symbols,
        publishedAt=document.published_at,
        sourceUrl=document.url,
        score=score,
        facets={"source": document.source_type, "recency": "24h"},
    )


def local_search(query: str, source: str | None = None, limit: int = 10) -> list[SearchResult]:
    query_terms = {term.lower() for term in query.split() if term}
    results: list[SearchResult] = []
    for document in _documents():
        if source and document.source_type != source:
            continue
        haystack = f"{document.title} {document.body} {' '.join(document.symbols)}".lower()
        score = sum(1.0 for term in query_terms if term in haystack)
        if score > 0 or not query_terms:
            results.append(_result_from_source(document, score + (0.1 if document.symbols else 0.0)))
    if results:
        results.sort(key=lambda result: (result.score, result.published_at), reverse=True)
        return results[:limit]
    return demo_search_results[:limit]


def search_meilisearch(query: str, source: str | None = None, recency: str | None = None, limit: int = 10) -> list[SearchResult] | None:
    payload: dict[str, Any] = {"q": query, "limit": limit}
    if source:
        payload["filter"] = f'source = "{source}"'
    if recency:
        payload["filter"] = f'{payload.get("filter", "")}{" AND " if payload.get("filter") else ""}recency = "{recency}"'
    try:
        with httpx.Client(timeout=settings.timeout_seconds) as client:
            response = client.post(
                f"{settings.meili_url}/indexes/{settings.index_name}/search",
                headers=_headers(),
                json=payload,
            )
            response.raise_for_status()
            data = response.json().get("hits", [])
            results: list[SearchResult] = []
            for item in data:
                results.append(
                    SearchResult(
                        id=str(item["id"]),
                        title=item["title"],
                        summary=item.get("summary", ""),
                        sourceType=item.get("sourceType", "news"),
                        symbols=item.get("symbols", []),
                        publishedAt=item.get("publishedAt", datetime.now(timezone.utc)),
                        sourceUrl=item.get("sourceUrl", ""),
                        score=float(item.get("_rankingScore", 0.0)),
                        facets=item.get("facets", {}),
                    )
                )
            return results
    except Exception:
        return None


@app.on_event("startup")
def seed_index() -> None:
    documents = [document.model_dump(by_alias=True) for document in _documents()]
    try:
                with httpx.Client(timeout=settings.timeout_seconds) as client:
                        client.put(f"{settings.meili_url}/indexes/{settings.index_name}", headers=_headers(), json={"uid": settings.index_name, "primaryKey": "id"})
                        client.post(f"{settings.meili_url}/indexes/{settings.index_name}/documents", headers=_headers(), json=documents)
    except Exception:
                return


@app.get("/health")
def health() -> dict[str, Any]:
    return envelope({"service": "search", "meilisearch": settings.meili_url})


@app.get("/search")
def search(q: str = Query(default=""), source: str | None = None, recency: str | None = None, limit: int = 10) -> dict[str, Any]:
    meili_results = search_meilisearch(q, source=source, recency=recency, limit=limit)
    results = meili_results if meili_results is not None else local_search(q, source=source, limit=limit)
    payload = [result.model_dump(by_alias=True) if hasattr(result, "model_dump") else result for result in results]
    return envelope(payload)


@app.get("/search/filters")
def filters() -> dict[str, Any]:
    results = demo_search_results
    return envelope(
        {
            "sources": sorted({item.facets["source"] for item in results}),
            "recency": sorted({item.facets["recency"] for item in results}),
            "symbols": sorted({symbol for item in results for symbol in item.symbols}),
        }
    )
