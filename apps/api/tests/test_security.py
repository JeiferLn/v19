"""Tests de `get_current_user` sin red: el JWKS se sustituye por una clave EC generada aquí."""

import time
from collections.abc import Iterator
from typing import Any

import jwt
import pytest
from cryptography.hazmat.primitives.asymmetric import ec
from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.core.config import Settings, get_settings
from app.core.security import AuthenticatedUser, CurrentUser, get_jwks_client

SETTINGS = Settings(supabase_url="http://supabase.test")
PRIVATE_KEY = ec.generate_private_key(ec.SECP256R1())
OTHER_KEY = ec.generate_private_key(ec.SECP256R1())


class FakeJWKSClient:
    """Imita `PyJWKClient.get_signing_key_from_jwt` devolviendo siempre nuestra clave pública."""

    def get_signing_key_from_jwt(self, token: str) -> jwt.PyJWK:
        return jwt.PyJWK.from_dict(
            {
                **jwt.algorithms.ECAlgorithm.to_jwk(PRIVATE_KEY.public_key(), as_dict=True),
                "alg": "ES256",
                "kid": "test",
            }
        )


def make_token(key: Any = PRIVATE_KEY, **overrides: Any) -> str:
    now = int(time.time())
    claims: dict[str, Any] = {
        "sub": "user-123",
        "email": "user@example.com",
        "role": "authenticated",
        "aud": SETTINGS.supabase_jwt_audience,
        "iss": SETTINGS.supabase_issuer,
        "iat": now,
        "exp": now + 300,
        **overrides,
    }
    return jwt.encode(claims, key, algorithm="ES256", headers={"kid": "test"})


@pytest.fixture
def client() -> Iterator[TestClient]:
    # App mínima solo para tests: la API real todavía no expone endpoints autenticados.
    app = FastAPI()

    @app.get("/me")
    def me(user: CurrentUser) -> AuthenticatedUser:
        return user

    app.dependency_overrides[get_settings] = lambda: SETTINGS
    app.dependency_overrides[get_jwks_client] = FakeJWKSClient
    yield TestClient(app)


def auth(token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"}


def test_valid_token_returns_user(client: TestClient) -> None:
    res = client.get("/me", headers=auth(make_token()))
    assert res.status_code == 200
    assert res.json() == {"id": "user-123", "email": "user@example.com", "role": "authenticated"}


def test_missing_token_is_401(client: TestClient) -> None:
    res = client.get("/me")
    assert res.status_code == 401
    assert res.headers["www-authenticate"] == "Bearer"


@pytest.mark.parametrize(
    "token",
    [
        make_token(exp=int(time.time()) - 10),
        make_token(aud="anon"),
        make_token(iss="http://otro-emisor/auth/v1"),
        make_token(key=OTHER_KEY),
        "no-es-un-jwt",
    ],
    ids=["expirado", "audiencia", "emisor", "firma", "malformado"],
)
def test_invalid_tokens_are_401(client: TestClient, token: str) -> None:
    assert client.get("/me", headers=auth(token)).status_code == 401


def test_hs256_token_is_rejected(client: TestClient) -> None:
    # Evita ataques de confusión de algoritmo: solo se aceptan ES256/RS256.
    token = jwt.encode(
        {
            "sub": "x",
            "aud": SETTINGS.supabase_jwt_audience,
            "iss": SETTINGS.supabase_issuer,
            "exp": int(time.time()) + 60,
        },
        "secreto-compartido-de-al-menos-32-bytes!!",
        algorithm="HS256",
    )
    assert client.get("/me", headers=auth(token)).status_code == 401
