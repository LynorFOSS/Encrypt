# Local setup

## Prerequisites

- Node.js 20+
- Python 3.11+
- Docker Desktop
- Git

## Commands

1. Copy `.env.example` to `.env` and adjust values if needed.
2. Run `scripts/bootstrap.ps1` on Windows or `scripts/bootstrap.sh` on Unix-like systems.
3. Launch services with `docker compose up`.
4. Run the desktop shell with `npm run dev`.

## Health checks

- `GET /health` on each API service
- `GET /search/filters` for search readiness
- `GET /sources/{id}` for source retrieval

## Demo data

The bootstrap flow seeds a compact market dataset so the dashboard, search, and AI flows work without external credentials.