from __future__ import annotations

from collections.abc import Iterator
from datetime import datetime, timezone
import json
from typing import Any

from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from apps.api.db import AppStateRecord, SourceDocumentRecord, create_engine_and_session, init_database, settings
from packages.shared.python.encrypt_shared import demo_filings, demo_headlines, demo_shell_state, demo_source_documents, demo_tickers, demo_transcripts
from packages.shared.python.encrypt_shared.models import ShellState, SourceDocument, WatchlistItem, Workspace


app = FastAPI(title="Encrypt API", version="0.1.0")
engine, SessionLocal = create_engine_and_session()
init_database(engine)


class Envelope(BaseModel):
    ok: bool = True
    data: Any | None = None
    error: str | None = None


class WatchlistCreate(BaseModel):
    workspace_id: str = Field(alias="workspaceId")
    symbol: str
    label: str
    note: str | None = None


class WorkspaceCreate(BaseModel):
    name: str
    active_ticker: str | None = Field(default=None, alias="activeTicker")


class IngestResponse(BaseModel):
    documents: int
    indexed: bool


def envelope(data: Any = None, *, error: str | None = None, ok: bool = True) -> dict[str, Any]:
    return Envelope(ok=ok, data=data, error=error).model_dump(by_alias=True)


def load_shell_state(session) -> ShellState:
    record = session.get(AppStateRecord, "shell-state")
    if record is None:
        state = ShellState.model_validate(demo_shell_state)
        record = AppStateRecord(key="shell-state", payload=state.model_dump(mode="json", by_alias=True))
        session.add(record)
        session.commit()
        return state
    return ShellState.model_validate(record.payload)


def save_shell_state(session, state: ShellState) -> None:
    record = session.get(AppStateRecord, "shell-state")
    payload = state.model_dump(mode="json", by_alias=True)
    if record is None:
        session.add(AppStateRecord(key="shell-state", payload=payload))
    else:
        record.payload = payload
        record.updated_at = datetime.now(timezone.utc)
    session.commit()


def seed_source_documents(session) -> None:
    if session.query(SourceDocumentRecord).count() > 0:
        return
    for document in demo_source_documents:
        payload = document.model_dump(mode="json", by_alias=True)
        session.add(
            SourceDocumentRecord(
                id=payload["id"],
                source_type=payload["sourceType"],
                title=payload["title"],
                body=payload["body"],
                symbols=payload["symbols"],
                url=payload["url"],
                published_at=payload["publishedAt"],
                external_id=payload["externalId"],
            )
        )
    session.commit()


@app.on_event("startup")
def startup() -> None:
    with SessionLocal() as session:
        seed_source_documents(session)
        load_shell_state(session)


@app.get("/health")
def health() -> dict[str, Any]:
    with SessionLocal() as session:
        return envelope(
            {
                "service": "api",
                "database": "ok",
                "watchlists": len(load_shell_state(session).watchlist),
                "sources": session.query(SourceDocumentRecord).count(),
            }
        )


@app.get("/stocks/{ticker}")
def get_stock(ticker: str) -> dict[str, Any]:
    match = next((item for item in demo_tickers if item.symbol.lower() == ticker.lower()), None)
    if match is None:
        raise HTTPException(status_code=404, detail=envelope(error=f"Unknown ticker: {ticker}", ok=False))
    company = {
        "ticker": match.symbol,
        "legalName": match.company_name,
        "description": f"{match.company_name} coverage in the Encrypt research stack.",
        "sector": match.sector,
        "industry": match.sector,
        "country": "US",
    }
    return envelope({"ticker": match.model_dump(by_alias=True), "company": company, "bars": []})


@app.get("/crypto/{symbol}")
def get_crypto(symbol: str) -> dict[str, Any]:
    match = next((item for item in demo_tickers if item.symbol.lower() == symbol.lower()), None)
    if match is None:
        raise HTTPException(status_code=404, detail=envelope(error=f"Unknown asset: {symbol}", ok=False))
    return envelope({"asset": match.model_dump(by_alias=True), "bars": []})


@app.get("/news")
def get_news() -> dict[str, Any]:
    return envelope([article.model_dump(by_alias=True) for article in demo_headlines])


@app.get("/filings/{accession}")
def get_filing(accession: str) -> dict[str, Any]:
    filing = next((item for item in demo_filings if item.accession == accession), None)
    if filing is None:
        raise HTTPException(status_code=404, detail=envelope(error=f"Unknown filing: {accession}", ok=False))
    return envelope(filing.model_dump(by_alias=True))


@app.get("/transcripts/{transcript_id}")
def get_transcript(transcript_id: str) -> dict[str, Any]:
    transcript = next((item for item in demo_transcripts if item.id == transcript_id), None)
    if transcript is None:
        raise HTTPException(status_code=404, detail=envelope(error=f"Unknown transcript: {transcript_id}", ok=False))
    return envelope(transcript.model_dump(by_alias=True))


@app.get("/watchlists")
def get_watchlists() -> dict[str, Any]:
    with SessionLocal() as session:
      state = load_shell_state(session)
      return envelope([item.model_dump(by_alias=True) for item in state.watchlist])


@app.post("/watchlists")
def add_watchlist_item(payload: WatchlistCreate) -> dict[str, Any]:
    with SessionLocal() as session:
        state = load_shell_state(session)
        item = WatchlistItem(
            id=f"wl-{payload.symbol}-{int(datetime.now(timezone.utc).timestamp())}",
            workspaceId=payload.workspace_id,
            symbol=payload.symbol,
            label=payload.label,
            note=payload.note,
            createdAt=datetime.now(timezone.utc),
        )
        state.watchlist = [item, *[existing for existing in state.watchlist if existing.symbol != payload.symbol]]
        save_shell_state(session, state)
        return envelope(item.model_dump(by_alias=True))


@app.get("/research/workspaces")
def get_workspaces() -> dict[str, Any]:
    with SessionLocal() as session:
        return envelope([workspace.model_dump(by_alias=True) for workspace in load_shell_state(session).workspaces])


@app.post("/research/workspaces")
def create_workspace(payload: WorkspaceCreate) -> dict[str, Any]:
    with SessionLocal() as session:
        state = load_shell_state(session)
        workspace = Workspace(id=f"ws-{len(state.workspaces) + 1}", name=payload.name, activeTicker=payload.active_ticker)
        state.workspaces = [workspace, *state.workspaces]
        save_shell_state(session, state)
        return envelope(workspace.model_dump(by_alias=True))


@app.get("/sources/{source_id}")
def get_source(source_id: str) -> dict[str, Any]:
    with SessionLocal() as session:
        record = session.get(SourceDocumentRecord, source_id)
        if record is None:
            match = next((document for document in demo_source_documents if document.id == source_id or document.external_id == source_id), None)
            if match is None:
                raise HTTPException(status_code=404, detail=envelope(error=f"Unknown source: {source_id}", ok=False))
            return envelope(match.model_dump(by_alias=True))
        return envelope(
            SourceDocument(
                id=record.id,
                sourceType=record.source_type,
                title=record.title,
                body=record.body,
                symbols=record.symbols,
                url=record.url,
                publishedAt=record.published_at,
                externalId=record.external_id,
            ).model_dump(by_alias=True)
        )


@app.post("/ingest/run")
def run_ingest() -> dict[str, Any]:
    from workers.index.main import index_documents
    from workers.ingest.main import collect_documents

    documents = collect_documents()
    indexed = index_documents(documents)
    with SessionLocal() as session:
        for document in documents:
            existing = session.get(SourceDocumentRecord, document.id)
            if existing is None:
                payload = document.model_dump(mode="json", by_alias=True)
                session.add(
                    SourceDocumentRecord(
                        id=payload["id"],
                        source_type=payload["sourceType"],
                        title=payload["title"],
                        body=payload["body"],
                        symbols=payload["symbols"],
                        url=payload["url"],
                        published_at=payload["publishedAt"],
                        external_id=payload["externalId"],
                    )
                )
        session.commit()
    return envelope(IngestResponse(documents=len(documents), indexed=indexed).model_dump())
