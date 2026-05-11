# Encrypt

Encrypt is a local-first, finance-first desktop browser and organized as a monorepo.

## What is included

- Electron desktop shell with tabs, split view, workspace state, bookmarks, and a compact research dashboard
- FastAPI services for research persistence, search, and local AI orchestration
- Ingestion and indexing workers for market, filing, and news data
- Local-only Ollama integration for TinyLlama-backed summarization and Q&A
- Docker Compose stack for Postgres, Redis, Meilisearch, Qdrant, and Ollama

## Quick start

1. Copy `.env.example` to `.env`.
2. Run `scripts/bootstrap.ps1` on Windows or `scripts/bootstrap.sh` on Unix-like systems.
3. Start the desktop shell with `npm run dev` from this directory.
4. Start the local services with `docker compose up`.

## Repository layout

- `apps/desktop`: Electron shell and renderer
- `apps/api`: workspace and research persistence API
- `apps/search`: finance search API
- `apps/ai`: Ollama-backed local AI API
- `packages/ui`: shared React UI primitives
- `packages/shared`: shared TypeScript schemas and demo data
- `packages/config`: shared config files
- `workers/ingest`, `workers/enrich`, `workers/index`: data pipelines
- `infra/docker/compose`: compose fragments and service notes
- `vendor`: third-party manifest and optional vendored sources

## Notes

This repository intentionally avoids cloud AI and telemetry. All external services are expected to run locally or be proxied by the local stack.