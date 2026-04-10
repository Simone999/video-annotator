"""API router package for the backend."""

from fastapi import APIRouter

from app.schemas import HealthResponse

from .videos import router as videos_router

router = APIRouter()


@router.get("/health", response_model=HealthResponse)
def get_health() -> HealthResponse:
    """Return a minimal backend health signal.

    Returns:
        Successful health response for local smoke validation.
    """
    return HealthResponse(status="ok")


router.include_router(videos_router)
