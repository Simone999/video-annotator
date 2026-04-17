"""Service helpers for persisted object-track lifecycle."""

from uuid import uuid4

from sqlalchemy.orm import Session

from app.db import ObjectTrack, Video

DEFAULT_OBJECT_COLOR = "#00ffaa"
DEFAULT_OBJECT_STATUS = "active"


def create_object_track(*, session: Session, video_id: str, label: str) -> ObjectTrack | None:
    """Create one stable object track for an indexed video."""
    video = session.get(Video, video_id)
    if video is None:
        return None

    object_track = ObjectTrack(
        id=f"object-{uuid4().hex[:12]}",
        video_id=video_id,
        label=label,
        color=DEFAULT_OBJECT_COLOR,
        status=DEFAULT_OBJECT_STATUS,
    )
    session.add(object_track)
    session.commit()
    session.refresh(object_track)
    return object_track
