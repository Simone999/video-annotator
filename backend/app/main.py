"""FastAPI application entrypoint for the backend."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api import router as api_router

LOCAL_FRONTEND_ORIGIN_REGEX = r"^https?://(127\.0\.0\.1|localhost)(?::\d+)?$"


def create_app() -> FastAPI:
    """Create the FastAPI application instance.

    Returns:
        FastAPI application configured with the backend API router.
    """
    app = FastAPI(title="Video Annotator Backend")
    app.add_middleware(
        CORSMiddleware,
        allow_origin_regex=LOCAL_FRONTEND_ORIGIN_REGEX,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.include_router(api_router, prefix="/api")
    return app


app = create_app()
