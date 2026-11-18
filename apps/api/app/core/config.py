from functools import lru_cache
from pathlib import Path
from typing import Literal

from pydantic import AnyHttpUrl, Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

# apps/api/.env, independientemente del directorio desde el que se arranque el proceso.
ENV_FILE = Path(__file__).resolve().parents[2] / ".env"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=ENV_FILE, extra="ignore")

    app_name: str = "v19 API"
    app_env: Literal["development", "test", "staging", "production"] = "development"
    version: str = "0.1.0"
    cors_origins: list[AnyHttpUrl] = [
        AnyHttpUrl("http://localhost:3000"),
        AnyHttpUrl("http://localhost:8081"),
    ]

    supabase_url: str = "http://127.0.0.1:54321"
    supabase_service_role_key: str = ""
    # Audiencia de los JWT de usuarios autenticados emitidos por Supabase Auth.
    supabase_jwt_audience: str = "authenticated"

    openai_api_key: str = ""
    openai_model: str = "gpt-4o-mini"

    shopify_store_domain: str = ""
    shopify_access_token: str = ""
    # Versión estable vigente; revisar cada trimestre (ADR 0004).
    shopify_api_version: str = Field(default="2026-10", pattern=r"^\d{4}-(01|04|07|10)$")

    @field_validator("supabase_url")
    @classmethod
    def _strip_trailing_slash(cls, value: str) -> str:
        return value.rstrip("/")

    @property
    def cors_origin_strings(self) -> list[str]:
        """Orígenes CORS sin la barra final que añade la validación de URL."""
        return [str(origin).rstrip("/") for origin in self.cors_origins]

    @property
    def supabase_issuer(self) -> str:
        return f"{self.supabase_url}/auth/v1"

    @property
    def supabase_jwks_url(self) -> str:
        return f"{self.supabase_issuer}/.well-known/jwks.json"


@lru_cache
def get_settings() -> Settings:
    return Settings()
