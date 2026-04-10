"""FastAPI application entrypoint for the backend."""

from fastapi import FastAPI

from .api import router as api_router


def create_app() -> FastAPI:
    """Create the FastAPI application instance.

    Returns:
        FastAPI application configured with the backend API router.
    """
    app = FastAPI(title="Video Annotator Backend")
    app.include_router(api_router, prefix="/api")
    return app


app = create_app()
