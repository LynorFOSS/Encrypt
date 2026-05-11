from __future__ import annotations

from packages.shared.python.encrypt_shared.models import SourceDocument


def enrich_document(document: SourceDocument) -> SourceDocument:
    body = document.body.strip()
    if document.symbols:
        body = f"{body} {' '.join(f'[{symbol}]' for symbol in document.symbols)}"
    return document.model_copy(update={"body": body})


def enrich_documents(documents: list[SourceDocument]) -> list[SourceDocument]:
    return [enrich_document(document) for document in documents]
