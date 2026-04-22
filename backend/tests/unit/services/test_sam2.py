"""Unit tests for SAM2 helper branches."""

from collections.abc import Iterator, Sequence
from datetime import datetime
from pathlib import Path

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.db import Job, Sam2Session, Video
from app.db.base import Base
from app.services.sam2 import (
    InvalidPropagationRangeError,
    JobNotFoundError,
    Sam2PromptResult,
    Sam2PropagationFrameResult,
    Sam2PropagationMaskResult,
    Sam2Service,
    Sam2SessionNotFoundError,
    Sam2SessionResult,
    Sam2VideoNotFoundError,
    Sam2VideoSourceNotAvailableError,
    _get_job_or_raise,
    _get_open_sam2_session,
    _resolve_target_frame_indices,
    _run_sam2_propagation_job,
    _validate_frame_idx,
    close_sam2_session,
    create_or_reuse_sam2_session,
    get_job_status,
    prompt_sam2_box,
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


def _seed_closed_sam2_session(session: Session) -> None:
    now = datetime(2026, 4, 22, 0, 0, 0)
    session.add(
        Sam2Session(
            id="sam2-session-1",
            video_id="video-1",
            status="closed",
            created_at=now,
            last_used_at=now,
            closed_at=now,
        )
    )
    session.commit()


def _create_job(
    *,
    job_id: str = "job-1",
    status: str = "queued",
    cancel_requested_at: datetime | None = None,
) -> Job:
    return Job(
        id=job_id,
        type="sam2_propagation",
        video_id="video-1",
        object_id="object-1",
        session_id="sam2-session-1",
        status=status,
        progress_current=0,
        progress_total=2,
        payload_json={},
        result_json=None,
        error_message=None,
        cancel_requested_at=cancel_requested_at,
        started_at=None,
        completed_at=None,
    )


class _FakeSam2Service(Sam2Service):
    def __init__(
        self,
        *,
        prompt_result: Sam2PromptResult | None = None,
        propagation_frames: Sequence[Sam2PropagationFrameResult] = (),
        propagate_error: Exception | None = None,
    ) -> None:
        super().__init__()
        self.prompt_result = prompt_result or Sam2PromptResult(mask_png_bytes=b"mask")
        self.propagation_frames = list(propagation_frames)
        self.propagate_error = propagate_error

    def prompt_box(
        self,
        *,
        session_id: str,
        frame_idx: int,
        object_id: str,
        box_xyxy_px: Sequence[int],
    ) -> Sam2PromptResult:
        del session_id, frame_idx, object_id, box_xyxy_px
        return self.prompt_result

    def propagate(
        self,
        *,
        session_id: str,
        start_frame_idx: int,
        end_frame_idx: int | None,
        direction: str,
        object_ids: Sequence[str],
    ) -> Iterator[Sam2PropagationFrameResult]:
        del session_id, start_frame_idx, end_frame_idx, direction, object_ids
        if self.propagate_error is not None:
            raise self.propagate_error
        return iter(self.propagation_frames)


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


def test_create_or_reuse_sam2_session_reuses_open_runtime_without_reopening(
    tmp_path: Path,
) -> None:
    """Reuse persisted session when runtime already owns it."""
    video_path = tmp_path / "video.mp4"
    video_path.write_bytes(b"video")

    with _open_session(tmp_path / "reuse-session.sqlite3") as session:
        session.add(
            Video(
                id="video-1",
                source_path=str(video_path),
                display_name="video.mp4",
                frame_count=12,
                fps=24.0,
                width=400,
                height=200,
                duration_seconds=1.0,
            )
        )
        _seed_open_sam2_session(session)

        sam2_service = Sam2Service()
        sam2_service.create_session(session_id="sam2-session-1", video_path=video_path)

        result = create_or_reuse_sam2_session(
            session=session,
            video_id="video-1",
            sam2_service=sam2_service,
        )

    assert result == Sam2SessionResult(session_id="sam2-session-1", reused=True)
    assert sam2_service.has_session(session_id="sam2-session-1") is True


def test_close_sam2_session_keeps_closed_sessions_unchanged(tmp_path: Path) -> None:
    """Skip runtime close when persisted session is already terminal."""
    with _open_session(tmp_path / "closed-session.sqlite3") as session:
        _seed_video(session)
        _seed_closed_sam2_session(session)
        sam2_service = Sam2Service()

        close_sam2_session(
            session=session,
            video_id="video-1",
            session_id="sam2-session-1",
            sam2_service=sam2_service,
        )

        persisted_session = session.get(Sam2Session, "sam2-session-1")

    assert persisted_session is not None
    assert persisted_session.status == "closed"
    assert sam2_service.has_session(session_id="sam2-session-1") is False


def test_prompt_sam2_box_rejects_out_of_range_frame_idx(tmp_path: Path) -> None:
    """Reject prompt requests outside persisted frame bounds."""
    with _open_session(tmp_path / "prompt-range.sqlite3") as session:
        _seed_video(session)
        _seed_open_sam2_session(session)

        with pytest.raises(FrameIndexOutOfRangeError, match="between 0 and 11"):
            prompt_sam2_box(
                session=session,
                video_id="video-1",
                session_id="sam2-session-1",
                frame_idx=12,
                object_id="object-1",
                box_xyxy_px=(10, 20, 30, 40),
                sam2_service=_FakeSam2Service(),
            )


def test_start_sam2_propagation_job_accepts_none_end_frame_and_both_forward_limit(
    tmp_path: Path,
) -> None:
    """Allow open-ended propagation requests and both-mode forward limits."""
    with _open_session(tmp_path / "open-ended-propagation.sqlite3") as session:
        _seed_video(session)
        _seed_open_sam2_session(session)
        session_factory = sessionmaker(session.get_bind(), expire_on_commit=False)

        result = start_sam2_propagation_job(
            session=session,
            video_id="video-1",
            session_id="sam2-session-1",
            start_frame_idx=7,
            end_frame_idx=None,
            direction="backward",
            object_ids=("object-1",),
            sam2_service=_FakeSam2Service(),
            session_factory=session_factory,
        )

    assert result.status == "queued"
    assert result.progress_total == 7
    assert _resolve_target_frame_indices(
        frame_count=12,
        start_frame_idx=7,
        end_frame_idx=9,
        direction="both",
    ) == [8, 9, 6, 5, 4, 3, 2, 1, 0]


def test_run_sam2_propagation_job_cancels_before_consuming_iterator(
    tmp_path: Path,
) -> None:
    """Mark queued job cancelled when cancellation is already requested."""
    with _open_session(tmp_path / "cancel-before-next.sqlite3") as session:
        session.add(_create_job(cancel_requested_at=datetime(2026, 4, 22, 0, 1, 0)))
        session.commit()
        session_factory = sessionmaker(session.get_bind(), expire_on_commit=False)

    _run_sam2_propagation_job(
        job_id="job-1",
        video_id="video-1",
        session_id="sam2-session-1",
        start_frame_idx=7,
        end_frame_idx=9,
        direction="forward",
        object_ids=("object-1",),
        target_frame_indices=(8, 9),
        sam2_service=_FakeSam2Service(
            propagation_frames=(
                Sam2PropagationFrameResult(
                    frame_idx=8,
                    object_results=(
                        Sam2PropagationMaskResult(
                            object_id="object-1",
                            mask_png_bytes=b"mask",
                        ),
                    ),
                ),
            ),
        ),
        session_factory=session_factory,
    )

    with session_factory() as session:
        job = session.get(Job, "job-1")

    assert job is not None
    assert job.status == "cancelled"
    assert job.progress_current == 0


def test_run_sam2_propagation_job_skips_non_target_frames_other_objects_and_duplicates(
    monkeypatch: pytest.MonkeyPatch,
    tmp_path: Path,
) -> None:
    """Persist only target frames for requested objects and count each frame once."""
    persisted_masks: list[tuple[int, str]] = []

    monkeypatch.setattr(
        "app.services.sam2.upsert_sam2_propagated_frame_annotation",
        lambda **kwargs: persisted_masks.append((kwargs["frame_idx"], kwargs["object_id"])),
    )

    with _open_session(tmp_path / "propagation-filters.sqlite3") as session:
        session.add(_create_job())
        session.commit()
        session_factory = sessionmaker(session.get_bind(), expire_on_commit=False)

    _run_sam2_propagation_job(
        job_id="job-1",
        video_id="video-1",
        session_id="sam2-session-1",
        start_frame_idx=7,
        end_frame_idx=9,
        direction="forward",
        object_ids=("object-1",),
        target_frame_indices=(8, 9),
        sam2_service=_FakeSam2Service(
            propagation_frames=(
                Sam2PropagationFrameResult(
                    frame_idx=10,
                    object_results=(
                        Sam2PropagationMaskResult(
                            object_id="object-1",
                            mask_png_bytes=b"skip-frame",
                        ),
                    ),
                ),
                Sam2PropagationFrameResult(
                    frame_idx=8,
                    object_results=(
                        Sam2PropagationMaskResult(
                            object_id="object-2",
                            mask_png_bytes=b"wrong-object",
                        ),
                        Sam2PropagationMaskResult(
                            object_id="object-1",
                            mask_png_bytes=b"persist-frame-8",
                        ),
                    ),
                ),
                Sam2PropagationFrameResult(
                    frame_idx=8,
                    object_results=(
                        Sam2PropagationMaskResult(
                            object_id="object-1",
                            mask_png_bytes=b"duplicate-frame-8",
                        ),
                    ),
                ),
            ),
        ),
        session_factory=session_factory,
    )

    with session_factory() as session:
        job = session.get(Job, "job-1")

    assert persisted_masks == [(8, "object-1"), (8, "object-1")]
    assert job is not None
    assert job.status == "completed"
    assert job.progress_current == 1
    assert job.result_json == {
        "object_ids": ["object-1"],
        "persisted_frame_count": 1,
        "persisted_frame_indices": [8],
    }


def test_run_sam2_propagation_job_marks_failed_when_runtime_raises(
    tmp_path: Path,
) -> None:
    """Persist failed job state when propagation iterator setup crashes."""
    with _open_session(tmp_path / "propagation-failed.sqlite3") as session:
        session.add(_create_job())
        session.commit()
        session_factory = sessionmaker(session.get_bind(), expire_on_commit=False)

    _run_sam2_propagation_job(
        job_id="job-1",
        video_id="video-1",
        session_id="sam2-session-1",
        start_frame_idx=7,
        end_frame_idx=9,
        direction="forward",
        object_ids=("object-1",),
        target_frame_indices=(8, 9),
        sam2_service=_FakeSam2Service(propagate_error=RuntimeError("propagate broke")),
        session_factory=session_factory,
    )

    with session_factory() as session:
        job = session.get(Job, "job-1")

    assert job is not None
    assert job.status == "failed"
    assert job.error_message == "propagate broke"


def test_create_or_reuse_sam2_session_rejects_missing_video_or_missing_source(
    tmp_path: Path,
) -> None:
    """Reject session creation when indexed video or local source is unavailable."""
    with _open_session(tmp_path / "missing-video-or-source.sqlite3") as session:
        with pytest.raises(Sam2VideoNotFoundError):
            create_or_reuse_sam2_session(
                session=session,
                video_id="missing-video",
                sam2_service=Sam2Service(),
            )

        _seed_video(session)

        with pytest.raises(Sam2VideoSourceNotAvailableError):
            create_or_reuse_sam2_session(
                session=session,
                video_id="video-1",
                sam2_service=Sam2Service(),
            )


def test_get_open_sam2_session_and_get_job_or_raise_reject_missing_rows(
    tmp_path: Path,
) -> None:
    """Reject missing persisted SAM2 session and missing job rows."""
    with _open_session(tmp_path / "missing-sam2-rows.sqlite3") as session:
        _seed_video(session)

        with pytest.raises(Sam2SessionNotFoundError):
            _get_open_sam2_session(
                session=session,
                video_id="video-1",
                session_id="missing-session",
            )

        with pytest.raises(JobNotFoundError):
            _get_job_or_raise(session=session, job_id="missing-job")
