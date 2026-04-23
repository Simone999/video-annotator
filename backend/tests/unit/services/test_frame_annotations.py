"""Unit tests for SAM2 frame-annotation persistence helpers."""

from pathlib import Path

import pytest
from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session

from app.db import FrameAnnotation, ObjectTrack, Video
from app.db.base import Base
from app.services.frame_annotations import (
    FrameAnnotationNotFoundError,
    _resolve_mask_path,
    _safe_path_segment,
    get_frame_annotation_mask_path,
    list_frame_annotations,
    normalize_box_xyxy_to_xywh,
    upsert_sam2_frame_annotation,
    upsert_sam2_propagated_frame_annotation,
    upsert_sam2_refined_frame_annotation,
)


def _open_session(database_path: Path) -> Session:
    engine = create_engine(f"sqlite:///{database_path}")
    Base.metadata.create_all(engine)
    return Session(engine, expire_on_commit=False)


def _seed_video_and_object(session: Session) -> None:
    session.add(
        Video(
            id="video-1",
            source_path="/tmp/video-1.mp4",
            display_name="video-1.mp4",
            frame_count=24,
            fps=24.0,
            width=400,
            height=200,
            duration_seconds=1.0,
        )
    )
    session.add(
        ObjectTrack(
            id="object-1",
            video_id="video-1",
            label="left hand",
            color="#00ffaa",
            status="active",
        )
    )
    session.commit()


def test_upsert_sam2_frame_annotation_creates_and_updates_one_row(tmp_path: Path) -> None:
    """Create then update one prompt-box annotation without duplicating rows."""
    masks_dir = tmp_path / "masks"
    with _open_session(tmp_path / "sam2-frame.sqlite3") as session:
        _seed_video_and_object(session)

        created = upsert_sam2_frame_annotation(
            session=session,
            video_id="video-1",
            frame_idx=7,
            object_id="object-1",
            video_width=400,
            video_height=200,
            box_xyxy_px=(40, 20, 200, 100),
            mask_png_bytes=b"mask-one",
            mask_confidence=0.91,
            masks_dir=masks_dir,
        )
        updated = upsert_sam2_frame_annotation(
            session=session,
            video_id="video-1",
            frame_idx=7,
            object_id="object-1",
            video_width=400,
            video_height=200,
            box_xyxy_px=(80, 40, 240, 120),
            mask_png_bytes=b"mask-two",
            mask_confidence=0.63,
            masks_dir=masks_dir,
            commit=False,
        )
        persisted_rows = session.scalars(select(FrameAnnotation)).all()
        session.commit()

    assert created.box_xywh_norm == (0.1, 0.1, 0.4, 0.4)
    assert created.mask_confidence == 0.91
    assert updated.box_xywh_norm == (0.2, 0.2, 0.4, 0.4)
    assert updated.mask_confidence == 0.63
    assert len(persisted_rows) == 1
    assert persisted_rows[0].mask_path == "masks/video-1/object-1/frame_000007.png"
    assert persisted_rows[0].mask_confidence == 0.63
    assert (masks_dir / "video-1" / "object-1" / "frame_000007.png").read_bytes() == b"mask-two"


def test_upsert_sam2_propagated_frame_annotation_clears_box_coordinates(tmp_path: Path) -> None:
    """Create then update one propagated annotation with empty box payload."""
    masks_dir = tmp_path / "masks"
    with _open_session(tmp_path / "sam2-propagated.sqlite3") as session:
        _seed_video_and_object(session)

        created = upsert_sam2_propagated_frame_annotation(
            session=session,
            video_id="video-1",
            frame_idx=8,
            object_id="object-1",
            mask_png_bytes=b"propagation-one",
            mask_confidence=0.78,
            masks_dir=masks_dir,
        )
        updated = upsert_sam2_propagated_frame_annotation(
            session=session,
            video_id="video-1",
            frame_idx=8,
            object_id="object-1",
            mask_png_bytes=b"propagation-two",
            mask_confidence=0.61,
            masks_dir=masks_dir,
            commit=False,
        )
        listed_annotations = list_frame_annotations(
            session=session,
            video_id="video-1",
            frame_idx=8,
        )
        persisted_rows = session.scalars(select(FrameAnnotation)).all()
        session.commit()

    assert created.box_xywh_norm == (0.0, 0.0, 0.0, 0.0)
    assert created.mask_confidence == 0.78
    assert updated.mask_path == "masks/video-1/object-1/frame_000008.png"
    assert updated.mask_confidence == 0.61
    assert len(persisted_rows) == 1
    assert listed_annotations[0].box_xywh_norm is None
    assert listed_annotations[0].mask_path == "masks/video-1/object-1/frame_000008.png"
    assert listed_annotations[0].mask_confidence == 0.61


def test_upsert_sam2_refined_frame_annotation_preserves_existing_row_shape(
    tmp_path: Path,
) -> None:
    """Refine writes corrected metadata without inventing new box or keyframe truth."""
    masks_dir = tmp_path / "masks"
    with _open_session(tmp_path / "sam2-refined.sqlite3") as session:
        _seed_video_and_object(session)
        upsert_sam2_propagated_frame_annotation(
            session=session,
            video_id="video-1",
            frame_idx=8,
            object_id="object-1",
            mask_png_bytes=b"propagation-one",
            mask_confidence=0.78,
            masks_dir=masks_dir,
        )

        refined = upsert_sam2_refined_frame_annotation(
            session=session,
            video_id="video-1",
            frame_idx=8,
            object_id="object-1",
            mask_png_bytes=b"refined-mask",
            masks_dir=masks_dir,
            commit=False,
        )
        listed_annotations = list_frame_annotations(
            session=session,
            video_id="video-1",
            frame_idx=8,
        )
        persisted_rows = session.scalars(select(FrameAnnotation)).all()
        session.commit()

    assert refined.source == "sam2_edited"
    assert refined.mask_confidence is None
    assert len(persisted_rows) == 1
    assert persisted_rows[0].source == "sam2_edited"
    assert persisted_rows[0].is_keyframe is False
    assert persisted_rows[0].box_x is None
    assert persisted_rows[0].mask_confidence is None
    assert listed_annotations[0].source == "sam2_edited"
    assert listed_annotations[0].box_xywh_norm is None
    assert listed_annotations[0].mask_confidence is None
    assert (masks_dir / "video-1" / "object-1" / "frame_000008.png").read_bytes() == b"refined-mask"


def test_get_frame_annotation_mask_path_rejects_missing_annotation_and_resolves_saved_mask(
    tmp_path: Path,
) -> None:
    """Resolve stored mask paths and reject missing annotation rows."""
    masks_dir = tmp_path / "masks"
    with _open_session(tmp_path / "mask-path.sqlite3") as session:
        _seed_video_and_object(session)

        with pytest.raises(FrameAnnotationNotFoundError):
            get_frame_annotation_mask_path(
                session=session,
                video_id="video-1",
                frame_idx=7,
                object_id="object-1",
                masks_dir=masks_dir,
            )

        upsert_sam2_frame_annotation(
            session=session,
            video_id="video-1",
            frame_idx=7,
            object_id="object-1",
            video_width=400,
            video_height=200,
            box_xyxy_px=(40, 20, 200, 100),
            mask_png_bytes=b"mask-one",
            masks_dir=masks_dir,
        )

        resolved_path = get_frame_annotation_mask_path(
            session=session,
            video_id="video-1",
            frame_idx=7,
            object_id="object-1",
            masks_dir=masks_dir,
        )

    assert resolved_path == masks_dir / "video-1" / "object-1" / "frame_000007.png"


@pytest.mark.parametrize(
    ("box_xyxy_px", "message"),
    [
        ((0, 0, 0, 10), "positive in-frame area"),
        ((0, 0, 401, 10), "indexed frame bounds"),
    ],
)
def test_normalize_box_xyxy_to_xywh_rejects_invalid_shapes_and_bounds(
    box_xyxy_px: tuple[int, int, int, int],
    message: str,
) -> None:
    """Reject invalid prompt-box coordinates before normalization."""
    with pytest.raises(Exception, match=message):
        normalize_box_xyxy_to_xywh(
            box_xyxy_px=box_xyxy_px,
            video_width=400,
            video_height=200,
        )


def test_safe_path_segment_and_resolve_mask_path_guard_against_bad_paths(
    tmp_path: Path,
) -> None:
    """Fallback empty path segments and reject traversal or missing masks."""
    masks_dir = tmp_path / "masks"
    masks_dir.mkdir()

    assert _safe_path_segment("!!!") == "object"
    assert _safe_path_segment("left hand") == "left_hand"

    with pytest.raises(FrameAnnotationNotFoundError):
        _resolve_mask_path(relative_mask_path=Path("../escape.png"), masks_dir=masks_dir)

    with pytest.raises(FrameAnnotationNotFoundError):
        _resolve_mask_path(
            relative_mask_path=Path("masks/video-1/object-1/frame_000009.png"),
            masks_dir=masks_dir,
        )
