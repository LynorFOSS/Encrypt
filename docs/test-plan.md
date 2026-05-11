# Test plan

## Frontend

- Vitest for reducer and store logic
- Renderer smoke tests for the shell layout and dashboard cards

## Backend

- Pytest for health, search, and AI contract tests
- Integration tests for worker normalization and indexing

## End-to-end

- Playwright for launch smoke tests and core keyboard flows

## Startup checks

- Desktop app boots with no renderer console errors
- Services respond to health checks
- Demo search returns finance entities
- Local AI responds through Ollama when available