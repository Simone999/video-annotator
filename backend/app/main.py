"""FastAPI application entrypoint for the backend."""

from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI

from .api import router as api_router
from .core.config import VIDEO_SOURCE_DIR
from .db import initialize_database
from .db.session import get_session_factory
from .services.video_indexing import VideoInspector, index_videos
from .services.video_metadata import extract_video_metadata


def run_startup_video_indexing(
    *,
    source_dir: Path | None = None,
    inspect_video: VideoInspector | None = None,
) -> None:
    """Index configured local videos after database bootstrap.

    Args:
        source_dir: Override source directory for local video discovery.
        inspect_video: Override metadata inspector used during indexing.
    """
    resolved_source_dir = source_dir or VIDEO_SOURCE_DIR
    resolved_inspector = inspect_video or extract_video_metadata

    with get_session_factory()() as session:
        index_videos(
            session=session,
            source_dir=resolved_source_dir,
            inspect_video=resolved_inspector,
        )


@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncIterator[None]:
    """Initialize local backend state during application startup.

    Yields:
        Empty asynchronous iterator for FastAPI lifespan management.
    """
    initialize_database()
    run_startup_video_indexing()
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
