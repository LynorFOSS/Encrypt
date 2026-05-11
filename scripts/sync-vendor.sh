#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

mkdir -p vendor

check_repo() {
  local url="$1"
  git ls-remote --heads "$url" >/dev/null
}

maybe_clone() {
  local url="$1"
  local target="$2"
  local name="$3"

  if [[ -d "$target/.git" ]]; then
    echo "[vendor] $name already present at $target"
    return
  fi

  if [[ "${ENCRYPT_VENDOR_CLONE:-0}" == "1" ]]; then
    check_repo "$url"
    git clone "$url" "$target"
    return
  fi

  if [[ "${ENCRYPT_VENDOR_SUBMODULES:-0}" == "1" ]]; then
    check_repo "$url"
    git submodule add "$url" "$target"
    return
  fi

  echo "[vendor] $name is managed as an external dependency and is not vendored by default"
}

maybe_clone "https://github.com/tradingview/lightweight-charts.git" "vendor/lightweight-charts" "TradingView Lightweight Charts"

if [[ "${ENCRYPT_VERIFY_UPSTREAM:-1}" == "1" ]]; then
  check_repo "https://github.com/electron/electron.git"
  check_repo "https://github.com/ollama/ollama.git"
  check_repo "https://github.com/fastapi/fastapi.git"
  check_repo "https://github.com/qdrant/qdrant.git"
  check_repo "https://github.com/meilisearch/meilisearch.git"
  check_repo "https://github.com/microsoft/playwright.git"
fi

git submodule update --init --recursive
