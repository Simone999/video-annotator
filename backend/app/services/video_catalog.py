"""Catalog queries for indexed milestone-01 videos."""

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db import Video


def list_indexed_videos(*, session: Session) -> list[Video]:
    """Return indexed videos ordered by canonical source path."""
    statement = select(Video).order_by(Video.source_path)
    return list(session.scalars(statement))


def get_indexed_video_by_id(*, session: Session, video_id: str) -> Video | None:
    """Return one indexed video by stable backend identifier."""
    return session.get(Video, video_id)
