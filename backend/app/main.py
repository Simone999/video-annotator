"""FastAPI application entrypoint for the backend."""

from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI

from .api import router as api_router
from .db import initialize_database


@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncIterator[None]:
    """Initialize local backend state during application startup.

    Yields:
        Empty asynchronous iterator for FastAPI lifespan management.
    """
    initialize_database()
    yield


def create_app() -> FastAPI:
    """Create the FastAPI application instance.

    Returns:
        FastAPI application configured with the backend API router.
    """
    app = FastAPI(title="Video Annotator Backend", lifespan=lifespan)
    app.include_router(api_router, prefix="/api")
    return app


app = create_app()
