from apps.api.main import app as api_app
from apps.search.main import local_search
from workers.ingest.main import collect_documents


def main() -> int:
    assert api_app.title == "Encrypt API"
    assert local_search("BTC whale activity")
    assert len(collect_documents()) >= 5
    print("startup smoke ok")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
