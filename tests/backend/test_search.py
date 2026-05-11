from apps.search.main import filters, local_search


def test_search_returns_finance_entities() -> None:
    results = local_search("NVDA earnings")
    assert results
    assert any("NVDA" in result.symbols for result in results)


def test_search_filters_include_source_buckets() -> None:
    payload = filters()
    assert payload["ok"] is True
    assert "news" in payload["data"]["sources"]
