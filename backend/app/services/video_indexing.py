"""Video indexing service for backend-owned local review targets."""

from collections.abc import Callable
from hashlib import sha256
from pathlib import Path

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import VIDEO_SOURCE_DIR
from app.db import Video

from .video_metadata import VideoMetadata, extract_video_metadata

type VideoInspector = Callable[[Path], VideoMetadata]

SUPPORTED_VIDEO_SUFFIXES = frozenset(
    {
        ".avi",
        ".m4v",
        ".mkv",
        ".mov",
        ".mp4",
    }
)


def index_videos(
    *,
    session: Session,
    source_dir: Path = VIDEO_SOURCE_DIR,
    inspect_video: VideoInspector = extract_video_metadata,
) -> list[Video]:
    """Scan local video source and upsert indexed video metadata.

    Args:
        session: Open SQLAlchemy session used for persistence.
        source_dir: Configured local video source directory to scan.
        inspect_video: Metadata inspection function for each discovered video.

    Returns:
        Persisted indexed videos found during this scan, ordered by source path.
    """
    canonical_source_dir = source_dir.expanduser().resolve()
    if not canonical_source_dir.is_dir():
        return []

    indexed_video_ids: list[str] = []

    for video_path in _iter_supported_video_paths(canonical_source_dir):
        metadata = inspect_video(video_path)
        video = _upsert_video(
            session=session,
            source_dir=canonical_source_dir,
            video_path=video_path,
            metadata=metadata,
        )
        indexed_video_ids.append(video.id)

    if not indexed_video_ids:
        return []

    session.commit()

    statement = select(Video).where(Video.id.in_(indexed_video_ids)).order_by(Video.source_path)
    return list(session.scalars(statement))


def _iter_supported_video_paths(source_dir: Path) -> list[Path]:
    discovered_paths = [
        path.resolve()
        for path in source_dir.rglob("*")
        if path.is_file() and path.suffix.lower() in SUPPORTED_VIDEO_SUFFIXES
    ]
    return sorted(discovered_paths, key=lambda path: path.relative_to(source_dir).as_posix())


def _upsert_video(
    *,
    session: Session,
    source_dir: Path,
    video_path: Path,
    metadata: VideoMetadata,
) -> Video:
    video_id = _build_video_id(source_dir=source_dir, video_path=video_path)
    persisted_video = session.get(Video, video_id)

    if persisted_video is None:
        persisted_video = Video(id=video_id)
        session.add(persisted_video)

    persisted_video.source_path = str(video_path)
    persisted_video.display_name = video_path.name
    persisted_video.frame_count = metadata.frame_count
    persisted_video.fps = metadata.fps
    persisted_video.width = metadata.width
    persisted_video.height = metadata.height
    persisted_video.duration_seconds = metadata.duration_seconds
    return persisted_video


def _build_video_id(*, source_dir: Path, video_path: Path) -> str:
    relative_path = video_path.relative_to(source_dir).as_posix().encode("utf-8")
    digest = sha256(relative_path).hexdigest()[:16]
    return f"video-{digest}"
