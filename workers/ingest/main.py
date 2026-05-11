from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from packages.shared.python.encrypt_shared import demo_filings, demo_headlines, demo_source_documents, demo_transcripts
from packages.shared.python.encrypt_shared.models import SourceDocument


def collect_documents() -> list[SourceDocument]:
    documents = [*demo_source_documents]
    for filing in demo_filings:
        documents.append(
            SourceDocument(
                id=f"src-{filing.accession}",
                sourceType="filing",
                title=filing.title,
                body=" ".join(filing.highlights),
                symbols=[filing.ticker],
                url=filing.url,
                publishedAt=filing.published_at,
                externalId=filing.accession,
            )
        )
    for transcript in demo_transcripts:
        documents.append(
            SourceDocument(
                id=f"src-{transcript.id}",
                sourceType="transcript",
                title=transcript.title,
                body=" ".join(transcript.snippets),
                symbols=[transcript.ticker],
                url=transcript.url,
                publishedAt=transcript.published_at,
                externalId=transcript.id,
            )
        )
    for article in demo_headlines:
        documents.append(
            SourceDocument(
                id=f"src-{article.id}",
                sourceType="news",
                title=article.title,
                body=article.summary,
                symbols=article.symbols,
                url=article.url,
                publishedAt=article.published_at,
                externalId=article.id,
            )
        )
    return documents


def run_ingest() -> dict[str, Any]:
    documents = collect_documents()
    return {"documents": len(documents), "generatedAt": datetime.now(timezone.utc).isoformat()}


if __name__ == "__main__":
    print(run_ingest())
