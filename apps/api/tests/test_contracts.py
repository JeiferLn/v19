"""Contrato API ↔ clientes: las respuestas reales deben cumplir los esquemas zod de @v19/validators.

Los JSON Schema se generan desde zod con `pnpm --filter @v19/validators gen:schemas` y se versionan
en packages/validators/schemas/. Si zod y Pydantic divergen, este test falla.
"""

import json
from pathlib import Path
from typing import Any

import pytest
from fastapi.testclient import TestClient
from jsonschema import Draft202012Validator

from app.main import app

SCHEMAS_DIR = Path(__file__).resolve().parents[3] / "packages" / "validators" / "schemas"

client = TestClient(app)


def load_schema(name: str) -> dict[str, Any]:
    schema: dict[str, Any] = json.loads((SCHEMAS_DIR / f"{name}.json").read_text("utf-8"))
    return schema


def assert_valid(schema_name: str, instance: Any) -> None:
    validator = Draft202012Validator(
        load_schema(schema_name), format_checker=Draft202012Validator.FORMAT_CHECKER
    )
    errors = [f"{list(e.absolute_path)}: {e.message}" for e in validator.iter_errors(instance)]
    assert not errors, f"La respuesta no cumple {schema_name}.json:\n" + "\n".join(errors)


def test_health_matches_zod_schema() -> None:
    assert_valid("health", client.get("/health").json())


def test_products_match_zod_schema() -> None:
    body = client.get("/api/v1/products").json()
    assert isinstance(body, list) and body
    for product in body:
        assert_valid("product", product)


@pytest.mark.parametrize(
    "bad",
    [
        {"title": ""},
        {"price": -1},
        {"currency": "EURO"},
        {"imageUrl": "no-es-url"},
    ],
)
def test_schema_rejects_what_zod_rejects(bad: dict[str, Any]) -> None:
    product = {
        "id": "x",
        "title": "t",
        "description": None,
        "price": 1,
        "currency": "EUR",
        "imageUrl": None,
        **bad,
    }
    validator = Draft202012Validator(
        load_schema("product"), format_checker=Draft202012Validator.FORMAT_CHECKER
    )
    assert not validator.is_valid(product)
