"""Unit tests for SAM2 helper branches."""

from datetime import datetime
from pathlib import Path

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from app.db import Job, Sam2Session, Video
from app.db.base import Base
from app.services.sam2 import (
    InvalidPropagationRangeError,
    JobNotFoundError,
    Sam2Service,
    _resolve_target_frame_indices,
    _validate_frame_idx,
    get_job_status,
    request_job_cancellation,
    start_sam2_propagation_job,
)
from app.services.video_frames import FrameIndexOutOfRangeError


def _open_session(database_path: Path) -> Session:
    engine = create_engine(f"sqlite:///{database_path}")
    Base.metadata.create_all(engine)
    return Session(engine, expire_on_commit=False)


def _seed_video(session: Session, *, frame_count: int = 12) -> None:
    session.add(
        Video(
            id="video-1",
            source_path="/tmp/video-1.mp4",
            display_name="video-1.mp4",
            frame_count=frame_count,
            fps=24.0,
            width=400,
            height=200,
            duration_seconds=1.0,
        )
    )
    session.commit()


def _seed_open_sam2_session(session: Session) -> None:
    now = datetime(2026, 4, 22, 0, 0, 0)
    session.add(
        Sam2Session(
            id="sam2-session-1",
            video_id="video-1",
            status="open",
            created_at=now,
            last_used_at=now,
            closed_at=None,
        )
    )
    session.commit()


def test_resolve_target_frame_indices_covers_forward_backward_and_both_modes() -> None:
    """Resolve deterministic target ranges for each supported propagation direction."""
    assert _resolve_target_frame_indices(
        frame_count=10,
        start_frame_idx=7,
        end_frame_idx=9,
        direction="forward",
    ) == [8, 9]
    assert _resolve_target_frame_indices(
        frame_count=10,
        start_frame_idx=7,
        end_frame_idx=5,
        direction="backward",
    ) == [6, 5]
    assert _resolve_target_frame_indices(
        frame_count=10,
        start_frame_idx=7,
        end_frame_idx=None,
        direction="both",
    ) == [8, 9, 6, 5, 4, 3, 2, 1, 0]
    assert _resolve_target_frame_indices(
        frame_count=10,
        start_frame_idx=7,
        end_frame_idx=5,
        direction="both",
    ) == [8, 9, 6, 5]


@pytest.mark.parametrize(
    ("direction", "end_frame_idx", "message"),
    [
        ("forward", 6, "greater than or equal"),
        ("backward", 8, "less than or equal"),
        ("sideways", None, "Unsupported propagation direction"),
    ],
)
def test_resolve_target_frame_indices_rejects_invalid_ranges_and_directions(
    direction: str,
    end_frame_idx: int | None,
    message: str,
) -> None:
    """Reject malformed propagation requests before runtime work starts."""
    with pytest.raises(InvalidPropagationRangeError, match=message):
        _resolve_target_frame_indices(
            frame_count=10,
            start_frame_idx=7,
            end_frame_idx=end_frame_idx,
            direction=direction,
        )


def test_validate_frame_idx_rejects_out_of_range_values() -> None:
    """Reject frame indexes outside canonical bounds."""
    with pytest.raises(FrameIndexOutOfRangeError, match="between 0 and 11"):
        _validate_frame_idx(frame_idx=12, frame_count=12)


def test_sam2_service_requires_real_file_and_tracks_open_sessions(tmp_path: Path) -> None:
    """Reject missing files and track runtime open-session ids."""
    service = Sam2Service()

    with pytest.raises(FileNotFoundError):
        service.create_session(session_id="sam2-session-1", video_path=tmp_path / "missing.mp4")

    video_path = tmp_path / "video.mp4"
    video_path.write_bytes(b"video")

    service.create_session(session_id="sam2-session-1", video_path=video_path)
    assert service.has_session(session_id="sam2-session-1") is True

    service.close_session(session_id="sam2-session-1")
    assert service.has_session(session_id="sam2-session-1") is False


def test_request_job_cancellation_marks_active_jobs_and_keeps_terminal_status(
    tmp_path: Path,
) -> None:
    """Return cancelling for active jobs and preserve terminal job state."""
    with _open_session(tmp_path / "job-cancel.sqlite3") as session:
        session.add(
            Job(
                id="job-active",
                type="sam2_propagation",
                video_id="video-1",
                object_id=None,
                session_id="sam2-session-1",
                status="queued",
                progress_current=0,
                progress_total=2,
                payload_json={},
                result_json=None,
                error_message=None,
                cancel_requested_at=None,
                started_at=None,
                completed_at=None,
            )
        )
        session.add(
            Job(
                id="job-done",
                type="sam2_propagation",
                video_id="video-1",
                object_id=None,
                session_id="sam2-session-1",
                status="completed",
                progress_current=2,
                progress_total=2,
                payload_json={},
                result_json={"persisted_frame_count": 2},
                error_message=None,
                cancel_requested_at=None,
                started_at=None,
                completed_at=datetime(2026, 4, 22, 0, 5, 0),
            )
        )
        session.commit()

        active_result = request_job_cancellation(session=session, job_id="job-active")
        terminal_result = request_job_cancellation(session=session, job_id="job-done")
        active_job = session.get(Job, "job-active")

    assert active_result.status == "cancelling"
    assert terminal_result.status == "completed"
    assert active_job is not None
    assert active_job.cancel_requested_at is not None


def test_request_job_cancellation_and_get_job_status_reject_missing_jobs(
    tmp_path: Path,
) -> None:
    """Reject lookups for unknown job ids."""
    with _open_session(tmp_path / "missing-job.sqlite3") as session:
        with pytest.raises(JobNotFoundError):
            request_job_cancellation(session=session, job_id="missing-job")

        with pytest.raises(JobNotFoundError):
            get_job_status(session=session, job_id="missing-job")


def test_start_sam2_propagation_job_completes_immediately_for_empty_target_range(
    tmp_path: Path,
) -> None:
    """Complete synchronously when resolved propagation target range is empty."""
    with _open_session(tmp_path / "empty-target.sqlite3") as session:
        _seed_video(session)
        _seed_open_sam2_session(session)

        result = start_sam2_propagation_job(
            session=session,
            video_id="video-1",
            session_id="sam2-session-1",
            start_frame_idx=7,
            end_frame_idx=7,
            direction="forward",
            object_ids=("object-1",),
            sam2_service=Sam2Service(),
        )
        job_status = get_job_status(session=session, job_id=result.job_id)

    assert result.status == "completed"
    assert result.progress_current == 0
    assert result.progress_total == 0
    assert job_status.status == "completed"
    assert job_status.result_json == {
        "object_ids": ["object-1"],
        "persisted_frame_count": 0,
        "persisted_frame_indices": [],
    }
