"""Unit tests for derived review-summary helper branches."""

from datetime import datetime

import pytest

from app.db import ExportRecord, FrameAnnotation, Job
from app.services.review_summaries import (
    _annotation_box_xyxy_px,
    _derive_review_state,
    _progress_percent,
    _validate_frame_idx,
    _VideoAnnotationStats,
)
from app.services.video_frames import FrameIndexOutOfRangeError


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
