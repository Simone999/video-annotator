"""Unit tests for manual frame-annotation persistence helpers."""

from pathlib import Path

import pytest
from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session

from app.db import FrameAnnotation, ObjectTrack, Video
from app.db.base import Base
from app.services.manual_frame_annotations import (
    ManualFrameAnnotationNotFoundError,
    ManualFrameAnnotationObjectTrackNotFoundError,
    ManualFrameAnnotationVideoNotFoundError,
    delete_manual_frame_annotation,
    upsert_manual_frame_annotation,
)
from app.services.video_frames import FrameIndexOutOfRangeError


def _open_session(database_path: Path) -> Session:
    engine = create_engine(f"sqlite:///{database_path}")
    Base.metadata.create_all(engine)
    return Session(engine, expire_on_commit=False)


def _seed_video(session: Session, *, video_id: str, frame_count: int = 24) -> None:
    session.add(
        Video(
            id=video_id,
            source_path=f"/tmp/{video_id}.mp4",
            display_name=f"{video_id}.mp4",
            frame_count=frame_count,
            fps=24.0,
            width=1920,
            height=1080,
            duration_seconds=1.0,
        )
    )
    session.commit()


def _seed_object(session: Session, *, video_id: str, object_id: str) -> None:
    session.add(
        ObjectTrack(
            id=object_id,
            video_id=video_id,
            label="left hand",
            color="#00ffaa",
            status="active",
        )
    )
    session.commit()


def test_upsert_manual_frame_annotation_creates_and_updates_one_row(tmp_path: Path) -> None:
    """Create then update one manual annotation without duplicating rows."""
    with _open_session(tmp_path / "manual-annotation.sqlite3") as session:
        _seed_video(session, video_id="video-1")
        _seed_object(session, video_id="video-1", object_id="object-1")

        created = upsert_manual_frame_annotation(
            session=session,
            video_id="video-1",
            frame_idx=7,
            object_id="object-1",
            is_keyframe=True,
            box_xywh_norm=[0.1, 0.2, 0.3, 0.4],
        )
        updated = upsert_manual_frame_annotation(
            session=session,
            video_id="video-1",
            frame_idx=7,
            object_id="object-1",
            is_keyframe=False,
            box_xywh_norm=[0.4, 0.3, 0.2, 0.1],
        )
        persisted_rows = session.scalars(select(FrameAnnotation)).all()

    assert created.source == "manual"
    assert updated.id == created.id
    assert len(persisted_rows) == 1
    assert persisted_rows[0].is_keyframe is False
    assert persisted_rows[0].box_x == 0.4
    assert persisted_rows[0].box_y == 0.3
    assert persisted_rows[0].box_w == 0.2
    assert persisted_rows[0].box_h == 0.1


def test_upsert_manual_frame_annotation_rejects_missing_video(tmp_path: Path) -> None:
    """Reject manual writes for unknown videos."""
    with (
        _open_session(tmp_path / "missing-video.sqlite3") as session,
        pytest.raises(ManualFrameAnnotationVideoNotFoundError),
    ):
        upsert_manual_frame_annotation(
            session=session,
            video_id="missing-video",
            frame_idx=0,
            object_id="object-1",
            is_keyframe=True,
            box_xywh_norm=[0.1, 0.2, 0.3, 0.4],
        )


def test_upsert_manual_frame_annotation_rejects_out_of_range_frame_idx(
    tmp_path: Path,
) -> None:
    """Reject manual writes outside canonical frame bounds."""
    with _open_session(tmp_path / "out-of-range.sqlite3") as session:
        _seed_video(session, video_id="video-1", frame_count=4)
        _seed_object(session, video_id="video-1", object_id="object-1")

        with pytest.raises(FrameIndexOutOfRangeError, match="between 0 and 3"):
            upsert_manual_frame_annotation(
                session=session,
                video_id="video-1",
                frame_idx=4,
                object_id="object-1",
                is_keyframe=True,
                box_xywh_norm=[0.1, 0.2, 0.3, 0.4],
            )


def test_upsert_manual_frame_annotation_rejects_missing_or_wrong_object_track(
    tmp_path: Path,
) -> None:
    """Reject manual writes when object track is missing or belongs to another video."""
    with _open_session(tmp_path / "wrong-object.sqlite3") as session:
        _seed_video(session, video_id="video-1")
        _seed_video(session, video_id="video-2")
        _seed_object(session, video_id="video-2", object_id="object-2")

        with pytest.raises(ManualFrameAnnotationObjectTrackNotFoundError):
            upsert_manual_frame_annotation(
                session=session,
                video_id="video-1",
                frame_idx=1,
                object_id="missing-object",
                is_keyframe=True,
                box_xywh_norm=[0.1, 0.2, 0.3, 0.4],
            )

        with pytest.raises(ManualFrameAnnotationObjectTrackNotFoundError):
            upsert_manual_frame_annotation(
                session=session,
                video_id="video-1",
                frame_idx=1,
                object_id="object-2",
                is_keyframe=True,
                box_xywh_norm=[0.1, 0.2, 0.3, 0.4],
            )


def test_delete_manual_frame_annotation_rejects_missing_row_and_deletes_existing_row(
    tmp_path: Path,
) -> None:
    """Delete persisted manual annotations and reject missing rows."""
    with _open_session(tmp_path / "delete-manual.sqlite3") as session:
        _seed_video(session, video_id="video-1")
        _seed_object(session, video_id="video-1", object_id="object-1")
        upsert_manual_frame_annotation(
            session=session,
            video_id="video-1",
            frame_idx=2,
            object_id="object-1",
            is_keyframe=True,
            box_xywh_norm=[0.1, 0.2, 0.3, 0.4],
        )

        delete_manual_frame_annotation(
            session=session,
            video_id="video-1",
            frame_idx=2,
            object_id="object-1",
        )
        persisted_rows = session.scalars(select(FrameAnnotation)).all()

        with pytest.raises(ManualFrameAnnotationNotFoundError):
            delete_manual_frame_annotation(
                session=session,
                video_id="video-1",
                frame_idx=2,
                object_id="object-1",
            )

    assert persisted_rows == []
