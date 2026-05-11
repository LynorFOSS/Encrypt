from workers.enrich.main import enrich_documents
from workers.ingest.main import collect_documents, run_ingest


def test_ingest_pipeline_produces_documents() -> None:
    documents = collect_documents()
    enriched = enrich_documents(documents)

    assert len(enriched) >= 5
    assert all(document.body for document in enriched)


def test_ingest_job_reports_counts() -> None:
    payload = run_ingest()
    assert payload["documents"] >= 5
