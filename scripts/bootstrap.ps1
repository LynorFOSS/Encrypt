param()

$ErrorActionPreference = "Stop"
$RootDir = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
Set-Location $RootDir

if (-not (Test-Path ".env") -and (Test-Path ".env.example")) {
  Copy-Item ".env.example" ".env"
}

git submodule update --init --recursive
& (Join-Path $PSScriptRoot "sync-vendor.sh")

npm install
npx playwright install chromium
$Python = (Get-Command python).Source
& $Python -m pip install --upgrade pip
& $Python -m pip install -r requirements.txt

docker compose up -d postgres redis meilisearch qdrant ollama api search ai
docker compose exec -T ollama ollama pull tinyllama
