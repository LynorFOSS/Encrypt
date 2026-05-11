# Third-party dependencies

Encrypt uses upstream projects as external dependencies rather than copying proprietary or unmaintained code into the tree.

## Policy

- Prefer git submodules for reusable source code when the license and size make that practical
- Prefer runtime services or package-manager dependencies for very large upstream projects
- Record source, license, commit or tag, and purpose before enabling any vendored code
- Stop and document the reason if a project is not suitable for vendoring

## Current stance

- Electron: runtime dependency only
- Ollama: runtime service only
- TinyLlama: model artifact only, fetched separately from the local model store
- Lightweight Charts: package dependency
- FastAPI: Python dependency
- Qdrant: Docker service
- Meilisearch: Docker service
- Playwright: package dependency

## Manifest

See `vendor/SOURCE_MANIFEST.json` for the active source manifest.