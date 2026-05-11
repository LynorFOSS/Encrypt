# API

All internal services use JSON envelopes shaped like:

```json
{ "ok": true, "data": {}, "error": null }
```

## Endpoints

- `GET /health`
- `GET /search?q=`
- `GET /search/filters`
- `GET /stocks/{ticker}`
- `GET /crypto/{symbol}`
- `GET /news`
- `GET /filings/{accession}`
- `GET /transcripts/{id}`
- `GET /watchlists`
- `POST /watchlists`
- `GET /research/workspaces`
- `POST /research/workspaces`
- `POST /ai/chat`
- `POST /ai/summarize`
- `POST /ai/explain`
- `POST /ai/compare`
- `POST /ingest/run`
- `GET /sources/{id}`

## Response discipline

- Validation errors return explicit field-level detail
- Missing sources return 404 envelopes rather than empty success responses
- Search and AI services should degrade cleanly when optional upstream services are unavailable