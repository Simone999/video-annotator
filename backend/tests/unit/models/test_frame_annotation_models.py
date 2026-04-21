"""Tests for persisted frame-annotation metadata models."""

from datetime import datetime
from pathlib import Path

from sqlalchemy import create_engine, inspect
from sqlalchemy.orm import Session

from app.db import models
from app.db.base import Base


def test_frame_annotation_model_persists_video_frame_mask_metadata(tmp_path: Path) -> None:
    """Create frame-annotation table and persist one SAM2-backed mask row."""
    database_path = tmp_path / "video-annotator.sqlite3"
    engine = create_engine(f"sqlite:///{database_path}")

    Base.metadata.create_all(engine)

    frame_annotation_model = getattr(models, "FrameAnnotation", None)
    assert frame_annotation_model is not None

    inspector = inspect(engine)
    columns = {column["name"]: column for column in inspector.get_columns("frame_annotations")}

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
        "created_at",
        "updated_at",
    }
    assert columns["id"]["nullable"] is False
    assert columns["video_id"]["nullable"] is False
    assert columns["frame_idx"]["nullable"] is False
    assert columns["object_id"]["nullable"] is False
    assert columns["is_keyframe"]["nullable"] is False
    assert columns["source"]["nullable"] is False
    assert columns["box_x"]["nullable"] is True
    assert columns["box_y"]["nullable"] is True
    assert columns["box_w"]["nullable"] is True
    assert columns["box_h"]["nullable"] is True
    assert columns["mask_path"]["nullable"] is True
    assert columns["mask_rle"]["nullable"] is True
    assert columns["created_at"]["nullable"] is False
    assert columns["updated_at"]["nullable"] is False

    annotation = frame_annotation_model(
        id="annotation-001",
        video_id="video-001",
        frame_idx=12,
        object_id="object-7",
        is_keyframe=True,
        source="sam2",
        box_x=0.05,
        box_y=0.2,
        box_w=0.25,
        box_h=0.5,
        mask_path="masks/video-001/object-7/frame_000012.png",
        mask_rle=None,
        created_at=datetime(2026, 4, 16, 9, 0, 0),
        updated_at=datetime(2026, 4, 16, 9, 0, 0),
    )

    with Session(engine) as session:
        session.add(annotation)
        session.commit()
        loaded_annotation = session.get(frame_annotation_model, "annotation-001")

    assert loaded_annotation is not None
    assert loaded_annotation.video_id == "video-001"
    assert loaded_annotation.frame_idx == 12
    assert loaded_annotation.object_id == "object-7"
    assert loaded_annotation.is_keyframe is True
    assert loaded_annotation.source == "sam2"
    assert loaded_annotation.box_x == 0.05
    assert loaded_annotation.box_y == 0.2
    assert loaded_annotation.box_w == 0.25
    assert loaded_annotation.box_h == 0.5
    assert loaded_annotation.mask_path == "masks/video-001/object-7/frame_000012.png"
    assert loaded_annotation.mask_rle is None
    assert loaded_annotation.created_at == datetime(2026, 4, 16, 9, 0, 0)
    assert loaded_annotation.updated_at == datetime(2026, 4, 16, 9, 0, 0)
