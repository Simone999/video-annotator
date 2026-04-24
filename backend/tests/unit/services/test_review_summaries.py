"""Unit tests for derived review-summary helper branches."""

from datetime import datetime
from pathlib import Path

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from app.db import ExportRecord, FrameAnnotation, Job, ObjectTrack, Video
from app.db.base import Base
from app.services.review_summaries import (
    _active_jobs_by_video_id,
    _annotation_box_xyxy_px,
    _derive_review_state,
    _latest_export_records_by_video_id,
    _progress_percent,
    _validate_frame_idx,
    _VideoAnnotationStats,
    get_indexed_video_with_review_summary,
    list_indexed_videos_with_review_summary,
)
from app.services.video_frames import FrameIndexOutOfRangeError


def _open_session(database_path: Path) -> Session:
    engine = create_engine(f"sqlite:///{database_path}")
    Base.metadata.create_all(engine)
    return Session(engine, expire_on_commit=False)


def test_derive_review_state_covers_all_user_facing_states() -> None:
    """Map summary facts into in-progress, ready, started, and not-started states."""
    active_job = Job(
        id="job-1",
        type="sam2_propagation",
        video_id="video-1",
        object_id=None,
        session_id="sam2-session-1",
        status="running",
        progress_current=2,
        progress_total=4,
        payload_json={},
        result_json=None,
        error_message=None,
        cancel_requested_at=None,
        started_at=datetime(2026, 4, 22, 0, 0, 0),
        completed_at=None,
    )

    assert _derive_review_state(
        annotation_stats=_VideoAnnotationStats(),
        active_job=active_job,
        latest_export_record=None,
    ) == ("in_progress", 50)
    assert _derive_review_state(
        annotation_stats=_VideoAnnotationStats(review_output_frame_count=1),
        active_job=None,
        latest_export_record=None,
    ) == ("ready", None)
    assert _derive_review_state(
        annotation_stats=_VideoAnnotationStats(
            review_output_frame_count=1,
            latest_review_output_updated_at=datetime(2026, 4, 24, 9, 0, 0),
        ),
        active_job=None,
        latest_export_record=ExportRecord(
            id="export-1",
            video_id="video-1",
            review_output_updated_at=datetime(2026, 4, 24, 9, 0, 0),
            created_at=datetime(2026, 4, 24, 9, 5, 0),
        ),
    ) == ("exported", None)
    assert _derive_review_state(
        annotation_stats=_VideoAnnotationStats(
            review_output_frame_count=1,
            latest_review_output_updated_at=datetime(2026, 4, 24, 9, 10, 0),
        ),
        active_job=None,
        latest_export_record=ExportRecord(
            id="export-2",
            video_id="video-1",
            review_output_updated_at=datetime(2026, 4, 24, 9, 0, 0),
            created_at=datetime(2026, 4, 24, 9, 5, 0),
        ),
    ) == ("ready", None)
    assert _derive_review_state(
        annotation_stats=_VideoAnnotationStats(imported_frame_count=1),
        active_job=None,
        latest_export_record=None,
    ) == ("started", None)
    assert _derive_review_state(
        annotation_stats=_VideoAnnotationStats(),
        active_job=None,
        latest_export_record=None,
    ) == ("not_started", None)


def test_derive_review_state_keeps_active_propagation_stronger_than_exported() -> None:
    """Return in-progress while propagation job is active even with fresh export snapshot."""
    active_job = Job(
        id="job-1",
        type="sam2_propagation",
        video_id="video-1",
        object_id=None,
        session_id="sam2-session-1",
        status="queued",
        progress_current=1,
        progress_total=4,
        payload_json={},
        result_json=None,
        error_message=None,
        cancel_requested_at=None,
        started_at=datetime(2026, 4, 24, 9, 6, 0),
        completed_at=None,
    )

    assert _derive_review_state(
        annotation_stats=_VideoAnnotationStats(
            review_output_frame_count=1,
            latest_review_output_updated_at=datetime(2026, 4, 24, 9, 0, 0),
        ),
        active_job=active_job,
        latest_export_record=ExportRecord(
            id="export-1",
            video_id="video-1",
            review_output_updated_at=datetime(2026, 4, 24, 9, 0, 0),
            created_at=datetime(2026, 4, 24, 9, 5, 0),
        ),
    ) == ("in_progress", 25)


def test_progress_percent_clamps_zero_and_one_hundred() -> None:
    """Clamp library progress percent to safe integer bounds."""
    zero_total_job = Job(
        id="job-1",
        type="sam2_propagation",
        video_id="video-1",
        object_id=None,
        session_id="sam2-session-1",
        status="running",
        progress_current=5,
        progress_total=0,
        payload_json={},
        result_json=None,
        error_message=None,
        cancel_requested_at=None,
        started_at=None,
        completed_at=None,
    )
    overflowing_job = Job(
        id="job-2",
        type="sam2_propagation",
        video_id="video-1",
        object_id=None,
        session_id="sam2-session-1",
        status="running",
        progress_current=8,
        progress_total=4,
        payload_json={},
        result_json=None,
        error_message=None,
        cancel_requested_at=None,
        started_at=None,
        completed_at=None,
    )

    assert _progress_percent(active_job=zero_total_job) == 0
    assert _progress_percent(active_job=overflowing_job) == 100


def test_annotation_box_xyxy_px_handles_missing_and_present_boxes() -> None:
    """Return None for missing box fields and rounded pixels for present boxes."""
    missing_box_annotation = FrameAnnotation(
        id="annotation-1",
        video_id="video-1",
        frame_idx=7,
        object_id="object-1",
        is_keyframe=False,
        source="sam2",
        box_x=None,
        box_y=None,
        box_w=None,
        box_h=None,
        mask_path=None,
        mask_rle=None,
    )
    present_box_annotation = FrameAnnotation(
        id="annotation-2",
        video_id="video-1",
        frame_idx=7,
        object_id="object-1",
        is_keyframe=True,
        source="manual",
        box_x=0.125,
        box_y=0.25,
        box_w=0.5,
        box_h=0.25,
        mask_path=None,
        mask_rle=None,
    )

    assert (
        _annotation_box_xyxy_px(
            annotation=missing_box_annotation,
            video_width=400,
            video_height=200,
        )
        is None
    )
    assert _annotation_box_xyxy_px(
        annotation=present_box_annotation,
        video_width=400,
        video_height=200,
    ) == (50, 50, 250, 100)


def test_validate_frame_idx_rejects_out_of_range_values() -> None:
    """Raise shared frame-range error when summary requests use invalid indexes."""
    with pytest.raises(FrameIndexOutOfRangeError, match="between 0 and 23"):
        _validate_frame_idx(frame_idx=24, frame_count=24)


def test_list_indexed_videos_with_review_summary_returns_empty_list_when_catalog_empty(
    tmp_path: Path,
) -> None:
    """Return no review records when catalog has no indexed videos."""
    with _open_session(tmp_path / "review-summary-empty.sqlite3") as session:
        assert list_indexed_videos_with_review_summary(session=session) == []


def test_get_indexed_video_with_review_summary_returns_none_for_missing_video(
    tmp_path: Path,
) -> None:
    """Return None instead of fabricating summary data for unknown videos."""
    with _open_session(tmp_path / "review-summary-missing.sqlite3") as session:
        assert (
            get_indexed_video_with_review_summary(
                session=session,
                video_id="missing-video",
            )
            is None
        )


def test_list_indexed_videos_with_review_summary_keeps_object_count_without_annotations(
    tmp_path: Path,
) -> None:
    """Preserve object count even when a video has tracks but no annotation rows yet."""
    with _open_session(tmp_path / "review-summary-objects.sqlite3") as session:
        session.add(
            Video(
                id="video-1",
                source_path="/tmp/video-1.mp4",
                display_name="video-1.mp4",
                frame_count=24,
                fps=24.0,
                width=1920,
                height=1080,
                duration_seconds=1.0,
            )
        )
        session.add(
            ObjectTrack(
                id="object-1",
                video_id="video-1",
                label="runner",
                color="#22aaee",
                status="active",
            )
        )
        session.commit()

        [record] = list_indexed_videos_with_review_summary(session=session)

    assert record.review_state == "not_started"
    assert record.review_summary.object_count == 1
    assert record.review_summary.annotated_frame_count == 0


def test_review_summary_helpers_return_latest_job_and_export_per_video(
    tmp_path: Path,
) -> None:
    """Collapse duplicate active jobs or export records to newest row per video."""
    with _open_session(tmp_path / "review-summary-latest.sqlite3") as session:
        session.add_all(
            [
                Video(
                    id="video-1",
                    source_path="/tmp/video-1.mp4",
                    display_name="video-1.mp4",
                    frame_count=24,
                    fps=24.0,
                    width=1920,
                    height=1080,
                    duration_seconds=1.0,
                ),
                Video(
                    id="video-2",
                    source_path="/tmp/video-2.mp4",
                    display_name="video-2.mp4",
                    frame_count=24,
                    fps=24.0,
                    width=1920,
                    height=1080,
                    duration_seconds=1.0,
                ),
                Job(
                    id="job-older",
                    type="sam2_propagation",
                    video_id="video-1",
                    object_id=None,
                    session_id="sam2-session-1",
                    status="running",
                    progress_current=1,
                    progress_total=4,
                    payload_json={},
                    result_json=None,
                    error_message=None,
                    cancel_requested_at=None,
                    started_at=datetime(2026, 4, 24, 9, 0, 0),
                    completed_at=None,
                ),
                Job(
                    id="job-latest",
                    type="sam2_propagation",
                    video_id="video-1",
                    object_id=None,
                    session_id="sam2-session-2",
                    status="queued",
                    progress_current=0,
                    progress_total=4,
                    payload_json={},
                    result_json=None,
                    error_message=None,
                    cancel_requested_at=None,
                    started_at=datetime(2026, 4, 24, 9, 1, 0),
                    completed_at=None,
                ),
                ExportRecord(
                    id="export-older",
                    video_id="video-2",
                    review_output_updated_at=datetime(2026, 4, 24, 9, 0, 0),
                    created_at=datetime(2026, 4, 24, 9, 1, 0),
                ),
                ExportRecord(
                    id="export-latest",
                    video_id="video-2",
                    review_output_updated_at=datetime(2026, 4, 24, 9, 2, 0),
                    created_at=datetime(2026, 4, 24, 9, 3, 0),
                ),
            ]
        )
        session.commit()

        assert _active_jobs_by_video_id(session=session, video_ids=[]) == {}
        assert _latest_export_records_by_video_id(session=session, video_ids=[]) == {}

        active_jobs = _active_jobs_by_video_id(
            session=session,
            video_ids=["video-1", "video-2"],
        )
        export_records = _latest_export_records_by_video_id(
            session=session,
            video_ids=["video-1", "video-2"],
        )

    assert set(active_jobs) == {"video-1"}
    assert active_jobs["video-1"].id == "job-latest"
    assert set(export_records) == {"video-2"}
    assert export_records["video-2"].id == "export-latest"
