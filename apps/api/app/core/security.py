"""Autenticación de peticiones con el JWT de Supabase Auth.

Los clientes (web/mobile) envían `Authorization: Bearer <access_token>`. El token se verifica con
las claves públicas (JWKS) del proyecto de Supabase: firma, expiración, audiencia y emisor.
La API nunca emite tokens ni guarda contraseñas: eso es responsabilidad de Supabase (regla R2).
"""

from functools import lru_cache
from typing import Annotated, Any

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel

from app.core.config import Settings, get_settings

ALLOWED_ALGORITHMS = ["ES256", "RS256"]

bearer_scheme = HTTPBearer(auto_error=False)


class AuthenticatedUser(BaseModel):
    id: str
    email: str | None = None
    role: str


@lru_cache
def _jwks_client(jwks_url: str) -> jwt.PyJWKClient:
    # Cachea las claves en memoria; PyJWKClient vuelve a pedirlas si llega un `kid` desconocido.
    return jwt.PyJWKClient(jwks_url, cache_keys=True, lifespan=600, timeout=5)


def get_jwks_client(settings: Annotated[Settings, Depends(get_settings)]) -> jwt.PyJWKClient:
    return _jwks_client(settings.supabase_jwks_url)


def _unauthorized(detail: str) -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail=detail,
        headers={"WWW-Authenticate": "Bearer"},
    )


def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer_scheme)],
    jwks_client: Annotated[jwt.PyJWKClient, Depends(get_jwks_client)],
    settings: Annotated[Settings, Depends(get_settings)],
) -> AuthenticatedUser:
    """Dependencia FastAPI: devuelve el usuario autenticado o responde 401.

    Es síncrona a propósito: PyJWKClient hace la petición HTTP de forma bloqueante y FastAPI
    ejecuta las dependencias síncronas en un threadpool.
    """
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise _unauthorized("Falta el token de acceso")

    token = credentials.credentials
    try:
        signing_key = jwks_client.get_signing_key_from_jwt(token)
        claims: dict[str, Any] = jwt.decode(
            token,
            signing_key.key,
            algorithms=ALLOWED_ALGORITHMS,
            audience=settings.supabase_jwt_audience,
            issuer=settings.supabase_issuer,
            options={"require": ["exp", "sub", "aud", "iss"]},
        )
    except jwt.PyJWKClientError as exc:
        raise _unauthorized("No se pudo verificar el token") from exc
    except jwt.InvalidTokenError as exc:
        raise _unauthorized("Token inválido o expirado") from exc

    return AuthenticatedUser(
        id=str(claims["sub"]),
        email=claims.get("email"),
        role=str(claims.get("role", "authenticated")),
    )


CurrentUser = Annotated[AuthenticatedUser, Depends(get_current_user)]
