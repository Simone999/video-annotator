"""Tests for persisted milestone-02 object and annotation models."""

from pathlib import Path

from sqlalchemy import create_engine, inspect, select
from sqlalchemy.orm import Session

from app.db.base import Base
from app.db.models import FrameAnnotation, ObjectTrack, Video


def test_object_track_model_persists_stable_identity_fields(tmp_path: Path) -> None:
    """Create object-track table and persist one stable object identity."""
    database_path = tmp_path / "video-annotator.sqlite3"
    engine = create_engine(f"sqlite:///{database_path}")

    Base.metadata.create_all(engine)

    inspector = inspect(engine)
    columns = {column["name"]: column for column in inspector.get_columns("object_tracks")}
    foreign_keys = inspector.get_foreign_keys("object_tracks")

    assert set(columns) == {"id", "video_id", "label", "color", "status"}
    assert columns["id"]["nullable"] is False
    assert columns["video_id"]["nullable"] is False
    assert columns["label"]["nullable"] is False
    assert columns["color"]["nullable"] is True
    assert columns["status"]["nullable"] is False
    assert foreign_keys == [
        {
            "constrained_columns": ["video_id"],
            "name": None,
            "options": {},
            "referred_columns": ["id"],
            "referred_schema": None,
            "referred_table": "videos",
        }
    ]

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
        video_id="video-001",
        label="left",
        color="#00ff00",
        status="active",
    )

    with Session(engine) as session:
        session.add(video)
        session.flush()
        session.add(object_track)
        session.commit()
        loaded_object_track = session.scalar(select(ObjectTrack))

    assert loaded_object_track is not None
    assert loaded_object_track.id == 1
    assert loaded_object_track.video_id == "video-001"
    assert loaded_object_track.label == "left"
    assert loaded_object_track.color == "#00ff00"
    assert loaded_object_track.status == "active"


def test_frame_annotation_model_persists_one_manual_box_per_frame(tmp_path: Path) -> None:
    """Create frame-annotation table and persist one manual box row."""
    database_path = tmp_path / "video-annotator.sqlite3"
    engine = create_engine(f"sqlite:///{database_path}")

    Base.metadata.create_all(engine)

    inspector = inspect(engine)
    columns = {column["name"]: column for column in inspector.get_columns("frame_annotations")}
    foreign_keys = inspector.get_foreign_keys("frame_annotations")
    unique_constraints = inspector.get_unique_constraints("frame_annotations")

    assert set(columns) == {
        "id",
        "video_id",
        "frame_idx",
        "object_id",
        "is_keyframe",
        "source",
        "box_x",
        "box_y",
        "box_w",
        "box_h",
        "mask_path",
        "mask_rle",
    }
    assert columns["id"]["nullable"] is False
    assert columns["video_id"]["nullable"] is False
    assert columns["frame_idx"]["nullable"] is False
    assert columns["object_id"]["nullable"] is False
    assert columns["is_keyframe"]["nullable"] is False
    assert columns["source"]["nullable"] is False
    assert columns["box_x"]["nullable"] is False
    assert columns["box_y"]["nullable"] is False
    assert columns["box_w"]["nullable"] is False
    assert columns["box_h"]["nullable"] is False
    assert columns["mask_path"]["nullable"] is True
    assert columns["mask_rle"]["nullable"] is True
    assert foreign_keys == [
        {
            "constrained_columns": ["video_id"],
            "name": None,
            "options": {},
            "referred_columns": ["id"],
            "referred_schema": None,
            "referred_table": "videos",
        },
        {
            "constrained_columns": ["object_id"],
            "name": None,
            "options": {},
            "referred_columns": ["id"],
            "referred_schema": None,
            "referred_table": "object_tracks",
        },
    ]
    assert unique_constraints == [
        {
            "column_names": ["video_id", "frame_idx", "object_id"],
            "name": "uq_frame_annotations_video_frame_object",
        }
    ]

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
        video_id="video-001",
        label="left",
        color=None,
        status="active",
    )
    frame_annotation = FrameAnnotation(
        video_id="video-001",
        frame_idx=120,
        object_id=1,
        is_keyframe=True,
        source="manual",
        box_x=0.41,
        box_y=0.29,
        box_w=0.10,
        box_h=0.16,
        mask_path=None,
        mask_rle=None,
    )

    with Session(engine) as session:
        session.add(video)
        session.flush()
        session.add(object_track)
        session.flush()
        session.add(frame_annotation)
        session.commit()
        loaded_frame_annotation = session.scalar(select(FrameAnnotation))

    assert loaded_frame_annotation is not None
    assert loaded_frame_annotation.id == 1
    assert loaded_frame_annotation.video_id == "video-001"
    assert loaded_frame_annotation.frame_idx == 120
    assert loaded_frame_annotation.object_id == 1
    assert loaded_frame_annotation.is_keyframe is True
    assert loaded_frame_annotation.source == "manual"
    assert loaded_frame_annotation.box_x == 0.41
    assert loaded_frame_annotation.box_y == 0.29
    assert loaded_frame_annotation.box_w == 0.10
    assert loaded_frame_annotation.box_h == 0.16
    assert loaded_frame_annotation.mask_path is None
    assert loaded_frame_annotation.mask_rle is None
