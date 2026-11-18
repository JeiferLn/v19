from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_name: str = "v19 API"
    app_env: str = "development"
    version: str = "0.1.0"
    cors_origins: list[str] = ["http://localhost:3000", "http://localhost:8081"]

    supabase_url: str = ""
    supabase_service_role_key: str = ""

    openai_api_key: str = ""
    openai_model: str = "gpt-4o-mini"

    shopify_store_domain: str = ""
    shopify_access_token: str = ""
    shopify_api_version: str = "2025-01"


@lru_cache
def get_settings() -> Settings:
    return Settings()
