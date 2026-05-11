#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if [[ ! -f .env && -f .env.example ]]; then
  cp .env.example .env
fi

git submodule update --init --recursive
./scripts/sync-vendor.sh

npm install
npx playwright install chromium
python -m pip install --upgrade pip
python -m pip install -r requirements.txt

docker compose up -d postgres redis meilisearch qdrant ollama api search ai
docker compose exec -T ollama ollama pull tinyllama || true
