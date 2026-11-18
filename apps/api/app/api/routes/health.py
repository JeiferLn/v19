from fastapi import APIRouter

from app.core.config import get_settings
from app.schemas.health import HealthStatus

router = APIRouter(tags=["health"])


@router.get("/health", response_model=HealthStatus)
def health() -> HealthStatus:
    return HealthStatus(version=get_settings().version)
