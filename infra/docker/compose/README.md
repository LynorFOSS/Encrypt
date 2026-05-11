# Docker compose stack

This folder holds deployment notes for the local Encrypt stack.

The root `docker-compose.yml` orchestrates:

- Postgres for durable state
- Redis for queues and cache
- Meilisearch for full-text finance search
- Qdrant for vector retrieval
- Ollama for local TinyLlama inference
- The FastAPI API, search, and AI services
