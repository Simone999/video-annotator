"""Unit tests for object-track persistence helpers."""

from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from app.db import Video
from app.db.base import Base
from app.services.object_tracks import create_object_track


def _open_session(database_path: Path) -> Session:
    engine = create_engine(f"sqlite:///{database_path}")
    Base.metadata.create_all(engine)
    return Session(engine, expire_on_commit=False)


def _seed_video(session: Session, *, video_id: str) -> None:
    session.add(
        Video(
            id=video_id,
            source_path=f"/tmp/{video_id}.mp4",
            display_name=f"{video_id}.mp4",
            frame_count=24,
            fps=24.0,
            width=1920,
            height=1080,
            duration_seconds=1.0,
        )
    )
    session.commit()


def test_create_object_track_persists_requested_color(tmp_path: Path) -> None:
    """Persist caller-provided color instead of overwriting with backend default."""
    with _open_session(tmp_path / "create-object-track.sqlite3") as session:
        _seed_video(session, video_id="video-1")

        created = create_object_track(
            session=session,
            video_id="video-1",
            label="left hand",
            color="#112233",
        )

    assert created is not None
    assert created.label == "left hand"
    assert created.color == "#112233"


def test_create_object_track_returns_none_for_missing_video(tmp_path: Path) -> None:
    """Reject object creation when indexed video does not exist."""
    with _open_session(tmp_path / "missing-video.sqlite3") as session:
        created = create_object_track(
            session=session,
            video_id="missing-video",
            label="left hand",
            color="#112233",
        )

    assert created is None
