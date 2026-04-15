"""SAM2 adapter and persisted session lifecycle helpers."""

from dataclasses import dataclass
from datetime import datetime
from functools import cache
from pathlib import Path
from uuid import uuid4

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db import Sam2Session

from .video_catalog import get_indexed_video_by_id


class Sam2VideoNotFoundError(Exception):
    """Raised when SAM2 route targets an unknown indexed video."""


class Sam2VideoSourceNotAvailableError(Exception):
    """Raised when indexed video metadata points at a missing local file."""


class Sam2SessionNotFoundError(Exception):
    """Raised when requested session metadata is missing for the video."""


@dataclass(slots=True)
class Sam2SessionResult:
    """Persisted SAM2 session lifecycle payload."""

    session_id: str
    reused: bool


class Sam2Service:
    """Isolated in-memory SAM2 adapter placeholder."""

    def __init__(self) -> None:
        """Initialize empty runtime-session registry."""
        self._open_session_ids: set[str] = set()

    def has_session(self, *, session_id: str) -> bool:
        """Return whether runtime state exists for one persisted session id.

        Args:
            session_id: Persisted session identifier.
        """
        return session_id in self._open_session_ids

    def create_session(self, *, session_id: str, video_path: Path) -> None:
        """Create runtime state for one persisted session id.

        Args:
            session_id: Persisted session identifier.
            video_path: Indexed local source path owned by the backend.
        """
        if not video_path.is_file():
            raise FileNotFoundError(video_path)

        self._open_session_ids.add(session_id)

    def close_session(self, *, session_id: str) -> None:
        """Drop runtime state for one persisted session id.

        Args:
            session_id: Persisted session identifier.
        """
        self._open_session_ids.discard(session_id)

    def prompt_box(self) -> None:
        """Reserved same-frame prompt operation for later milestone work."""
        raise NotImplementedError

    def propagate(self) -> None:
        """Reserved propagation operation for later milestone work."""
        raise NotImplementedError


@cache
def get_sam2_service() -> Sam2Service:
    """Return shared local SAM2 adapter instance."""
    return Sam2Service()


def create_or_reuse_sam2_session(
    *,
    session: Session,
    video_id: str,
    sam2_service: Sam2Service,
) -> Sam2SessionResult:
    """Create or reuse one open SAM2 session for an indexed video.

    Args:
        session: Open database session.
        video_id: Indexed video identifier.
        sam2_service: Isolated SAM2 adapter implementation.

    Raises:
        Sam2VideoNotFoundError: If indexed video metadata does not exist.
        Sam2VideoSourceNotAvailableError: If local source file is missing.
    """
    video = get_indexed_video_by_id(session=session, video_id=video_id)
    if video is None:
        raise Sam2VideoNotFoundError(video_id)

    video_path = Path(video.source_path)
    if not video_path.is_file():
        raise Sam2VideoSourceNotAvailableError(video.source_path)

    existing_session = session.scalar(
        select(Sam2Session)
        .where(Sam2Session.video_id == video_id, Sam2Session.closed_at.is_(None))
        .order_by(Sam2Session.created_at.desc())
    )
    now = datetime.now()
    if existing_session is not None:
        if not sam2_service.has_session(session_id=existing_session.id):
            sam2_service.create_session(session_id=existing_session.id, video_path=video_path)

        existing_session.last_used_at = now
        session.commit()
        return Sam2SessionResult(session_id=existing_session.id, reused=True)

    session_id = f"sam2-session-{uuid4().hex}"
    sam2_service.create_session(session_id=session_id, video_path=video_path)
    persisted_session = Sam2Session(
        id=session_id,
        video_id=video_id,
        status="open",
        created_at=now,
        last_used_at=now,
        closed_at=None,
    )
    session.add(persisted_session)
    session.commit()
    return Sam2SessionResult(session_id=session_id, reused=False)


def close_sam2_session(
    *,
    session: Session,
    video_id: str,
    session_id: str,
    sam2_service: Sam2Service,
) -> None:
    """Close one persisted SAM2 session for an indexed video.

    Args:
        session: Open database session.
        video_id: Indexed video identifier.
        session_id: Persisted SAM2 session identifier.
        sam2_service: Isolated SAM2 adapter implementation.

    Raises:
        Sam2SessionNotFoundError: If session does not belong to the video.
    """
    persisted_session = session.scalar(
        select(Sam2Session).where(Sam2Session.id == session_id, Sam2Session.video_id == video_id)
    )
    if persisted_session is None:
        raise Sam2SessionNotFoundError(session_id)

    if persisted_session.closed_at is None:
        sam2_service.close_session(session_id=session_id)
        persisted_session.status = "closed"
        persisted_session.last_used_at = datetime.now()
        persisted_session.closed_at = persisted_session.last_used_at
        session.commit()
