from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health() -> None:
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json()["status"] == "ok"


def test_products_demo() -> None:
    res = client.get("/api/v1/products")
    assert res.status_code == 200
    body = res.json()
    assert body[0]["id"] == "demo-1"
    assert "imageUrl" in body[0]  # camelCase, compatible con @v19/types
