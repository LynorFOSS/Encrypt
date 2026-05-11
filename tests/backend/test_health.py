from fastapi.testclient import TestClient

from apps.api.main import app


def test_api_health_returns_ok() -> None:
    client = TestClient(app)
    response = client.get("/health")
    assert response.status_code == 200
    payload = response.json()
    assert payload["ok"] is True
    assert payload["data"]["service"] == "api"
