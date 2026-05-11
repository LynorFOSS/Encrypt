# Architecture

Encrypt is split into a desktop shell, local backend services, and data workers.

## Core flow

1. The Electron shell owns windowing, tabs, workspaces, and browser session isolation.
2. The renderer talks to local services through typed fetch helpers exposed by the preload bridge.
3. The API service persists research workspaces, watchlists, bookmarks, and notes.
4. The search service indexes normalized documents and answers finance queries.
5. The AI service retrieves source documents, calls Ollama locally, and streams grounded responses back to the UI.
6. Workers ingest source data, normalize it into shared schemas, and publish it to search and vector stores.

## Design goals

- Local by default
- Boringly correct APIs
- Clear boundaries between UI, domain models, and infrastructure
- Small, observable services with explicit health checks

## Storage

- Postgres for durable application state
- Redis for transient jobs, caches, and coordination
- Meilisearch for text search
- Qdrant for vector retrieval