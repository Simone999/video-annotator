"""Baseline seed helpers for explicit E2E bootstrap."""

from collections.abc import Sequence
from pathlib import Path

from app.core.config import VIDEO_SOURCE_DIR, get_masks_dir
from app.db import Video
from app.db.session import get_session_factory
from app.services.video_indexing import VideoInspector, index_videos
from app.services.video_metadata import extract_video_metadata


def seed_baseline(
    *,
    database_url: str | None = None,
    source_dir: Path = VIDEO_SOURCE_DIR,
    inspect_video: VideoInspector = extract_video_metadata,
) -> Sequence[Video]:
    """Create baseline E2E data by indexing local videos explicitly."""
    get_masks_dir().mkdir(parents=True, exist_ok=True)

    with get_session_factory(database_url=database_url)() as session:
        videos = index_videos(
            session=session,
            source_dir=source_dir,
            inspect_video=inspect_video,
        )
        if not videos:
            raise RuntimeError("No indexed videos available for E2E seeding")
        return videos
