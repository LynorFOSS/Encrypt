# Data flow

## Ingestion

Ingestion workers pull from public, legally accessible sources and normalize every record into stable identifiers.

## Indexing

Normalized documents are written to search and vector backends with source metadata, recency, symbols, and entity tags.

## Retrieval

The search API queries the text index first and optionally enriches results from the vector store.

## AI grounding

The AI API retrieves source documents, builds a compact prompt with citations, and streams the final answer from Ollama.