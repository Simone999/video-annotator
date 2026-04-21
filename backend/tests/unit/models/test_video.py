"""Tests for the persisted video metadata model."""

from pathlib import Path

from sqlalchemy import create_engine, inspect
from sqlalchemy.orm import Session

from app.db.base import Base
from app.db.models import Video


def test_video_model_persists_milestone_01_metadata(tmp_path: Path) -> None:
    """Create the video table and persist milestone-01 metadata."""
    database_path = tmp_path / "video-annotator.sqlite3"
    engine = create_engine(f"sqlite:///{database_path}")

    Base.metadata.create_all(engine)

    inspector = inspect(engine)
    columns = {column["name"]: column for column in inspector.get_columns("videos")}

    assert set(columns) == {
        "id",
        "source_path",
        "display_name",
        "frame_count",
        "fps",
        "width",
        "height",
        "duration_seconds",
    }
    assert columns["id"]["nullable"] is False
    assert columns["source_path"]["nullable"] is False
    assert columns["display_name"]["nullable"] is False
    assert columns["frame_count"]["nullable"] is False
    assert columns["fps"]["nullable"] is False
    assert columns["width"]["nullable"] is False
    assert columns["height"]["nullable"] is False
    assert columns["duration_seconds"]["nullable"] is True

    video = Video(
        id="video-001",
        source_path="/tmp/example.mp4",
        display_name="Example Video",
        frame_count=240,
        fps=24.0,
        width=1920,
        height=1080,
        duration_seconds=10.0,
    )

    with Session(engine) as session:
        session.add(video)
        session.commit()
        loaded_video = session.get(Video, "video-001")

    assert loaded_video is not None
    assert loaded_video.id == "video-001"
    assert loaded_video.source_path == "/tmp/example.mp4"
    assert loaded_video.display_name == "Example Video"
    assert loaded_video.frame_count == 240
    assert loaded_video.fps == 24.0
    assert loaded_video.width == 1920
    assert loaded_video.height == 1080
    assert loaded_video.duration_seconds == 10.0
