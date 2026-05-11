from __future__ import annotations

from collections.abc import Sequence
import os
from typing import Any

import httpx
from qdrant_client import QdrantClient
from qdrant_client.http import models as qdrant_models

from packages.shared.python.encrypt_shared import demo_source_documents, vectorize_text
from packages.shared.python.encrypt_shared.models import SourceDocument


class Settings:
    meili_url = os.getenv("MEILI_URL", "http://localhost:7700")
    meili_master_key = os.getenv("MEILI_MASTER_KEY", "encrypt-dev-key")
    qdrant_url = os.getenv("QDRANT_URL", "http://localhost:6333")
    collection_name = os.getenv("QDRANT_COLLECTION", "encrypt_sources")


def _headers() -> dict[str, str]:
    return {"Authorization": f"Bearer {Settings.meili_master_key}"} if Settings.meili_master_key else {}


def index_documents(documents: Sequence[SourceDocument]) -> bool:
    documents = list(documents)
    if not documents:
        return True

    try:
        with httpx.Client(timeout=10.0) as client:
            client.put(f"{Settings.meili_url}/indexes/finance", headers=_headers(), json={"uid": "finance", "primaryKey": "id"})
            client.post(f"{Settings.meili_url}/indexes/finance/documents", headers=_headers(), json=[document.model_dump(by_alias=True) for document in documents])
    except Exception:
        pass

    try:
        client = QdrantClient(url=Settings.qdrant_url)
        existing_collections = {collection.name for collection in client.get_collections().collections}
        if Settings.collection_name not in existing_collections:
            client.create_collection(
                collection_name=Settings.collection_name,
                vectors_config=qdrant_models.VectorParams(size=32, distance=qdrant_models.Distance.COSINE),
            )
        points = [
            qdrant_models.PointStruct(
                id=document.id,
                vector=vectorize_text(f"{document.title}\n{document.body}"),
                payload=document.model_dump(by_alias=True),
            )
            for document in documents
        ]
        client.upsert(collection_name=Settings.collection_name, points=points)
        return True
    except Exception:
        return False


def run_index() -> bool:
    return index_documents(demo_source_documents)


if __name__ == "__main__":
    print({"indexed": run_index()})
