"""Tests for the persisted object-track model."""

from pathlib import Path

from sqlalchemy import create_engine, inspect
from sqlalchemy.orm import Session

from app.db.base import Base
from app.db.models import ObjectTrack, Video


def test_object_track_model_persists_stable_identity_per_video(tmp_path: Path) -> None:
    """Create the object-track table and persist stable per-video identity."""
    database_path = tmp_path / "video-annotator.sqlite3"
    engine = create_engine(f"sqlite:///{database_path}")

    Base.metadata.create_all(engine)

    inspector = inspect(engine)
    columns = {column["name"]: column for column in inspector.get_columns("object_tracks")}

    assert set(columns) == {"id", "video_id", "label", "color", "status"}
    assert columns["id"]["nullable"] is False
    assert columns["video_id"]["nullable"] is False
    assert columns["label"]["nullable"] is False
    assert columns["color"]["nullable"] is False
    assert columns["status"]["nullable"] is False

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
    object_track = ObjectTrack(
        id="object-001",
        video_id="video-001",
        label="left hand",
        color="#00ffaa",
        status="active",
    )

    with Session(engine) as session:
        session.add(video)
        session.add(object_track)
        session.commit()
        loaded_object_track = session.get(ObjectTrack, "object-001")

    assert loaded_object_track is not None
    assert loaded_object_track.id == "object-001"
    assert loaded_object_track.video_id == "video-001"
    assert loaded_object_track.label == "left hand"
    assert loaded_object_track.color == "#00ffaa"
    assert loaded_object_track.status == "active"
