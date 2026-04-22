"""SAM2 adapter and persisted session lifecycle helpers."""

from collections.abc import Iterator, Sequence
from dataclasses import dataclass
from datetime import datetime
from functools import cache
from pathlib import Path
from threading import Thread
from uuid import uuid4

from sqlalchemy import select
from sqlalchemy.orm import Session, sessionmaker

from app.db import Job, Sam2Session, Video
from app.db.session import get_session_factory

from .frame_annotations import (
    StoredFrameAnnotation,
    upsert_sam2_frame_annotation,
    upsert_sam2_propagated_frame_annotation,
)
from .video_catalog import get_indexed_video_by_id
from .video_frames import FrameIndexOutOfRangeError


class Sam2VideoNotFoundError(Exception):
    """Raised when SAM2 route targets an unknown indexed video."""


class Sam2VideoSourceNotAvailableError(Exception):
    """Raised when indexed video metadata points at a missing local file."""


class Sam2SessionNotFoundError(Exception):
    """Raised when requested session metadata is missing for the video."""


class JobNotFoundError(Exception):
    """Raised when background job metadata does not exist."""


class InvalidPropagationRangeError(Exception):
    """Raised when propagation range does not fit requested direction."""


@dataclass(slots=True)
class Sam2SessionResult:
    """Persisted SAM2 session lifecycle payload."""

    session_id: str
    reused: bool


@dataclass(slots=True)
class Sam2PromptResult:
    """In-memory SAM2 prompt result for one same-frame mask."""

    mask_png_bytes: bytes
    mask_confidence: float | None = None


@dataclass(slots=True)
class Sam2PropagationMaskResult:
    """One propagated object mask for one frame."""

    object_id: str
    mask_png_bytes: bytes
    mask_confidence: float | None = None


@dataclass(slots=True)
class Sam2PropagationFrameResult:
    """One propagated frame payload returned by the SAM2 adapter."""

    frame_idx: int
    object_results: Sequence[Sam2PropagationMaskResult]


@dataclass(slots=True)
class Sam2PropagationJobResult:
    """Create-job response payload for SAM2 propagation."""

    job_id: str
    status: str
    progress_current: int
    progress_total: int


@dataclass(slots=True)
class JobStatusResult:
    """Persisted job status payload for API reads."""

    job_id: str
    type: str
    status: str
    progress_current: int
    progress_total: int
    result_json: dict[str, object] | None
    error_message: str | None


@dataclass(slots=True)
class JobCancelResult:
    """Cancel-request response payload for one background job."""

    job_id: str
    status: str


class Sam2Service:
    """Isolated in-memory SAM2 adapter placeholder."""

    def __init__(self) -> None:
        """Initialize empty runtime-session registry."""
        self._open_session_ids: set[str] = set()

    def has_session(self, *, session_id: str) -> bool:
        """Return whether runtime state exists for one persisted session id.

        Args:
            session_id: Persisted session identifier.
        """
        return session_id in self._open_session_ids

    def create_session(self, *, session_id: str, video_path: Path) -> None:
        """Create runtime state for one persisted session id.

        Args:
            session_id: Persisted session identifier.
            video_path: Indexed local source path owned by the backend.
        """
        if not video_path.is_file():
            raise FileNotFoundError(video_path)

        self._open_session_ids.add(session_id)

    def close_session(self, *, session_id: str) -> None:
        """Drop runtime state for one persisted session id.

        Args:
            session_id: Persisted session identifier.
        """
        self._open_session_ids.discard(session_id)

    def prompt_box(
        self,
        *,
        session_id: str,
        frame_idx: int,
        object_id: str,
        box_xyxy_px: Sequence[int],
    ) -> Sam2PromptResult:
        """Run one same-frame prompt-box operation for persisted session id."""
        del session_id, frame_idx, object_id, box_xyxy_px
        raise NotImplementedError

    def propagate(
        self,
        *,
        session_id: str,
        start_frame_idx: int,
        end_frame_idx: int | None,
        direction: str,
        object_ids: Sequence[str],
    ) -> Iterator[Sam2PropagationFrameResult]:
        """Run propagation for one persisted session id."""
        del session_id, start_frame_idx, end_frame_idx, direction, object_ids
        raise NotImplementedError


@cache
def get_sam2_service() -> Sam2Service:
    """Return shared local SAM2 adapter instance."""
    return Sam2Service()


def create_or_reuse_sam2_session(
    *,
    session: Session,
    video_id: str,
    sam2_service: Sam2Service,
) -> Sam2SessionResult:
    """Create or reuse one open SAM2 session for an indexed video.

    Args:
        session: Open database session.
        video_id: Indexed video identifier.
        sam2_service: Isolated SAM2 adapter implementation.

    Raises:
        Sam2VideoNotFoundError: If indexed video metadata does not exist.
        Sam2VideoSourceNotAvailableError: If local source file is missing.
    """
    video_path = _get_local_video_path(session=session, video_id=video_id)

    existing_session = session.scalar(
        select(Sam2Session)
        .where(Sam2Session.video_id == video_id, Sam2Session.closed_at.is_(None))
        .order_by(Sam2Session.created_at.desc())
    )
    now = datetime.now()
    if existing_session is not None:
        if not sam2_service.has_session(session_id=existing_session.id):
            sam2_service.create_session(session_id=existing_session.id, video_path=video_path)

        existing_session.last_used_at = now
        session.commit()
        return Sam2SessionResult(session_id=existing_session.id, reused=True)

    session_id = f"sam2-session-{uuid4().hex}"
    sam2_service.create_session(session_id=session_id, video_path=video_path)
    persisted_session = Sam2Session(
        id=session_id,
        video_id=video_id,
        status="open",
        created_at=now,
        last_used_at=now,
        closed_at=None,
    )
    session.add(persisted_session)
    session.commit()
    return Sam2SessionResult(session_id=session_id, reused=False)


def close_sam2_session(
    *,
    session: Session,
    video_id: str,
    session_id: str,
    sam2_service: Sam2Service,
) -> None:
    """Close one persisted SAM2 session for an indexed video.

    Args:
        session: Open database session.
        video_id: Indexed video identifier.
        session_id: Persisted SAM2 session identifier.
        sam2_service: Isolated SAM2 adapter implementation.

    Raises:
        Sam2SessionNotFoundError: If session does not belong to the video.
    """
    persisted_session = _get_open_sam2_session(
        session=session,
        video_id=video_id,
        session_id=session_id,
        allow_closed=True,
    )

    if persisted_session.closed_at is None:
        sam2_service.close_session(session_id=session_id)
        persisted_session.status = "closed"
        persisted_session.last_used_at = datetime.now()
        persisted_session.closed_at = persisted_session.last_used_at
        session.commit()


def prompt_sam2_box(
    *,
    session: Session,
    video_id: str,
    session_id: str,
    frame_idx: int,
    object_id: str,
    box_xyxy_px: Sequence[int],
    sam2_service: Sam2Service,
) -> StoredFrameAnnotation:
    """Run same-frame SAM2 prompt-box and persist resulting annotation metadata.

    Args:
        session: Open database session.
        video_id: Indexed video identifier.
        session_id: Persisted SAM2 session identifier.
        frame_idx: Canonical zero-based frame index.
        object_id: Logical object identifier.
        box_xyxy_px: Pixel box coordinates on backend-decoded frame image.
        sam2_service: Isolated SAM2 adapter implementation.

    Raises:
        Sam2VideoNotFoundError: If indexed video metadata does not exist.
        Sam2SessionNotFoundError: If session does not belong to requested video or is closed.
        FrameIndexOutOfRangeError: If frame index does not fit indexed metadata.
    """
    video = _get_video_or_raise(session=session, video_id=video_id)

    if frame_idx < 0 or frame_idx >= video.frame_count:
        raise FrameIndexOutOfRangeError(frame_count=video.frame_count)

    _get_open_sam2_session(session=session, video_id=video_id, session_id=session_id)

    resolved_box_xyxy_px = (
        box_xyxy_px[0],
        box_xyxy_px[1],
        box_xyxy_px[2],
        box_xyxy_px[3],
    )
    prompt_result = sam2_service.prompt_box(
        session_id=session_id,
        frame_idx=frame_idx,
        object_id=object_id,
        box_xyxy_px=resolved_box_xyxy_px,
    )

    stored_annotation = upsert_sam2_frame_annotation(
        session=session,
        video_id=video_id,
        frame_idx=frame_idx,
        object_id=object_id,
        video_width=video.width,
        video_height=video.height,
        box_xyxy_px=resolved_box_xyxy_px,
        mask_png_bytes=prompt_result.mask_png_bytes,
        mask_confidence=prompt_result.mask_confidence,
        commit=False,
    )
    persisted_session = _get_open_sam2_session(
        session=session,
        video_id=video_id,
        session_id=session_id,
    )
    persisted_session.last_used_at = datetime.now()
    session.commit()
    return stored_annotation


def start_sam2_propagation_job(
    *,
    session: Session,
    video_id: str,
    session_id: str,
    start_frame_idx: int,
    end_frame_idx: int | None,
    direction: str,
    object_ids: Sequence[str],
    sam2_service: Sam2Service,
    session_factory: sessionmaker[Session] | None = None,
) -> Sam2PropagationJobResult:
    """Create and launch one background propagation job."""
    video = _get_video_or_raise(session=session, video_id=video_id)
    _validate_frame_idx(frame_idx=start_frame_idx, frame_count=video.frame_count)
    if end_frame_idx is not None:
        _validate_frame_idx(frame_idx=end_frame_idx, frame_count=video.frame_count)

    persisted_session = _get_open_sam2_session(
        session=session,
        video_id=video_id,
        session_id=session_id,
    )
    target_frame_indices = _resolve_target_frame_indices(
        frame_count=video.frame_count,
        start_frame_idx=start_frame_idx,
        end_frame_idx=end_frame_idx,
        direction=direction,
    )
    now = datetime.now()
    job_id = f"job-{uuid4().hex}"
    persisted_job = Job(
        id=job_id,
        type="sam2_propagation",
        video_id=video_id,
        object_id=object_ids[0] if len(object_ids) == 1 else None,
        session_id=session_id,
        status="queued",
        progress_current=0,
        progress_total=len(target_frame_indices),
        payload_json={
            "start_frame_idx": start_frame_idx,
            "end_frame_idx": end_frame_idx,
            "direction": direction,
            "object_ids": list(object_ids),
            "target_frame_indices": target_frame_indices,
        },
        result_json=None,
        error_message=None,
        cancel_requested_at=None,
        started_at=None,
        completed_at=None,
    )
    persisted_session.last_used_at = now
    session.add(persisted_job)
    session.commit()

    if not target_frame_indices:
        persisted_job.status = "completed"
        persisted_job.started_at = now
        persisted_job.completed_at = now
        persisted_job.result_json = _build_job_result_json(
            object_ids=object_ids,
            persisted_frame_indices=[],
        )
        session.commit()
        return Sam2PropagationJobResult(
            job_id=job_id,
            status=persisted_job.status,
            progress_current=persisted_job.progress_current,
            progress_total=persisted_job.progress_total,
        )

    resolved_session_factory = session_factory or get_session_factory()
    worker = Thread(
        target=_run_sam2_propagation_job,
        kwargs={
            "job_id": job_id,
            "video_id": video_id,
            "session_id": session_id,
            "start_frame_idx": start_frame_idx,
            "end_frame_idx": end_frame_idx,
            "direction": direction,
            "object_ids": tuple(object_ids),
            "target_frame_indices": tuple(target_frame_indices),
            "sam2_service": sam2_service,
            "session_factory": resolved_session_factory,
        },
        daemon=True,
    )
    worker.start()
    return Sam2PropagationJobResult(
        job_id=job_id,
        status="queued",
        progress_current=0,
        progress_total=len(target_frame_indices),
    )


def get_job_status(*, session: Session, job_id: str) -> JobStatusResult:
    """Return one persisted job payload by id."""
    persisted_job = session.get(Job, job_id)
    if persisted_job is None:
        raise JobNotFoundError(job_id)

    return JobStatusResult(
        job_id=persisted_job.id,
        type=persisted_job.type,
        status=persisted_job.status,
        progress_current=persisted_job.progress_current,
        progress_total=persisted_job.progress_total,
        result_json=persisted_job.result_json,
        error_message=persisted_job.error_message,
    )


def request_job_cancellation(*, session: Session, job_id: str) -> JobCancelResult:
    """Request cancellation for one persisted background job."""
    persisted_job = session.get(Job, job_id)
    if persisted_job is None:
        raise JobNotFoundError(job_id)

    if persisted_job.status in {"queued", "running"} and persisted_job.cancel_requested_at is None:
        persisted_job.cancel_requested_at = datetime.now()
        session.commit()

    if persisted_job.status in {"queued", "running"}:
        return JobCancelResult(job_id=job_id, status="cancelling")

    return JobCancelResult(job_id=job_id, status=persisted_job.status)


def _run_sam2_propagation_job(
    *,
    job_id: str,
    video_id: str,
    session_id: str,
    start_frame_idx: int,
    end_frame_idx: int | None,
    direction: str,
    object_ids: Sequence[str],
    target_frame_indices: Sequence[int],
    sam2_service: Sam2Service,
    session_factory: sessionmaker[Session],
) -> None:
    """Run one propagation job in a background thread with fresh DB sessions."""
    persisted_frame_indices: list[int] = []
    target_frame_index_set = set(target_frame_indices)

    try:
        with session_factory() as session:
            persisted_job = _get_job_or_raise(session=session, job_id=job_id)
            persisted_job.status = "running"
            persisted_job.started_at = datetime.now()
            session.commit()

        propagation_iterator = sam2_service.propagate(
            session_id=session_id,
            start_frame_idx=start_frame_idx,
            end_frame_idx=end_frame_idx,
            direction=direction,
            object_ids=tuple(object_ids),
        )

        while True:
            if _job_cancel_requested(session_factory=session_factory, job_id=job_id):
                _finish_job(
                    session_factory=session_factory,
                    job_id=job_id,
                    status="cancelled",
                    persisted_frame_indices=persisted_frame_indices,
                    object_ids=object_ids,
                )
                return

            try:
                frame_result = next(propagation_iterator)
            except StopIteration:
                _finish_job(
                    session_factory=session_factory,
                    job_id=job_id,
                    status="completed",
                    persisted_frame_indices=persisted_frame_indices,
                    object_ids=object_ids,
                )
                return

            if _job_cancel_requested(session_factory=session_factory, job_id=job_id):
                _finish_job(
                    session_factory=session_factory,
                    job_id=job_id,
                    status="cancelled",
                    persisted_frame_indices=persisted_frame_indices,
                    object_ids=object_ids,
                )
                return

            if frame_result.frame_idx not in target_frame_index_set:
                continue

            with session_factory() as session:
                for object_result in frame_result.object_results:
                    if object_result.object_id not in object_ids:
                        continue

                    upsert_sam2_propagated_frame_annotation(
                        session=session,
                        video_id=video_id,
                        frame_idx=frame_result.frame_idx,
                        object_id=object_result.object_id,
                        mask_png_bytes=object_result.mask_png_bytes,
                        mask_confidence=object_result.mask_confidence,
                        commit=False,
                    )

                if frame_result.frame_idx not in persisted_frame_indices:
                    persisted_frame_indices.append(frame_result.frame_idx)

                persisted_job = _get_job_or_raise(session=session, job_id=job_id)
                persisted_job.progress_current = len(persisted_frame_indices)
                persisted_job.result_json = _build_job_result_json(
                    object_ids=object_ids,
                    persisted_frame_indices=persisted_frame_indices,
                )
                session.commit()
    except Exception as error:
        with session_factory() as session:
            persisted_job = _get_job_or_raise(session=session, job_id=job_id)
            persisted_job.status = "failed"
            persisted_job.error_message = str(error)
            persisted_job.result_json = _build_job_result_json(
                object_ids=object_ids,
                persisted_frame_indices=persisted_frame_indices,
            )
            persisted_job.completed_at = datetime.now()
            session.commit()


def _finish_job(
    *,
    session_factory: sessionmaker[Session],
    job_id: str,
    status: str,
    persisted_frame_indices: Sequence[int],
    object_ids: Sequence[str],
) -> None:
    """Persist one terminal job state."""
    with session_factory() as session:
        persisted_job = _get_job_or_raise(session=session, job_id=job_id)
        persisted_job.status = status
        persisted_job.progress_current = len(persisted_frame_indices)
        persisted_job.result_json = _build_job_result_json(
            object_ids=object_ids,
            persisted_frame_indices=persisted_frame_indices,
        )
        persisted_job.completed_at = datetime.now()
        session.commit()


def _job_cancel_requested(*, session_factory: sessionmaker[Session], job_id: str) -> bool:
    """Return whether cancellation has been requested for one job id."""
    with session_factory() as session:
        persisted_job = _get_job_or_raise(session=session, job_id=job_id)
        return persisted_job.cancel_requested_at is not None


def _get_video_or_raise(*, session: Session, video_id: str) -> Video:
    """Return indexed video metadata or raise the service-level not-found error."""
    video = get_indexed_video_by_id(session=session, video_id=video_id)
    if video is None:
        raise Sam2VideoNotFoundError(video_id)

    return video


def _get_local_video_path(*, session: Session, video_id: str) -> Path:
    """Return the local source path for one indexed video or raise."""
    video = _get_video_or_raise(session=session, video_id=video_id)
    video_path = Path(video.source_path)
    if not video_path.is_file():
        raise Sam2VideoSourceNotAvailableError(video.source_path)

    return video_path


def _get_open_sam2_session(
    *,
    session: Session,
    video_id: str,
    session_id: str,
    allow_closed: bool = False,
) -> Sam2Session:
    """Return one persisted session scoped to the requested video."""
    conditions = [Sam2Session.id == session_id, Sam2Session.video_id == video_id]
    if not allow_closed:
        conditions.append(Sam2Session.closed_at.is_(None))

    persisted_session = session.scalar(select(Sam2Session).where(*conditions))
    if persisted_session is None:
        raise Sam2SessionNotFoundError(session_id)

    return persisted_session


def _get_job_or_raise(*, session: Session, job_id: str) -> Job:
    """Return one persisted job row or raise."""
    persisted_job = session.get(Job, job_id)
    if persisted_job is None:
        raise JobNotFoundError(job_id)

    return persisted_job


def _validate_frame_idx(*, frame_idx: int, frame_count: int) -> None:
    """Raise if a frame index falls outside persisted video bounds."""
    if frame_idx < 0 or frame_idx >= frame_count:
        raise FrameIndexOutOfRangeError(frame_count=frame_count)


def _resolve_target_frame_indices(
    *,
    frame_count: int,
    start_frame_idx: int,
    end_frame_idx: int | None,
    direction: str,
) -> list[int]:
    """Resolve deterministic target frames for propagation progress."""
    if direction == "forward":
        last_frame_idx = end_frame_idx if end_frame_idx is not None else frame_count - 1
        if last_frame_idx < start_frame_idx:
            raise InvalidPropagationRangeError(
                "Forward propagation end frame must be greater than or equal to start frame"
            )

        return list(range(start_frame_idx + 1, last_frame_idx + 1))

    if direction == "backward":
        first_frame_idx = end_frame_idx if end_frame_idx is not None else 0
        if first_frame_idx > start_frame_idx:
            raise InvalidPropagationRangeError(
                "Backward propagation end frame must be less than or equal to start frame"
            )

        return list(range(start_frame_idx - 1, first_frame_idx - 1, -1))

    if direction == "both":
        if end_frame_idx is None:
            backward_limit = 0
            forward_limit = frame_count - 1
        elif end_frame_idx >= start_frame_idx:
            backward_limit = 0
            forward_limit = end_frame_idx
        else:
            backward_limit = end_frame_idx
            forward_limit = frame_count - 1

        return [
            *range(start_frame_idx + 1, forward_limit + 1),
            *range(start_frame_idx - 1, backward_limit - 1, -1),
        ]

    raise InvalidPropagationRangeError(f"Unsupported propagation direction: {direction}")


def _build_job_result_json(
    *,
    object_ids: Sequence[str],
    persisted_frame_indices: Sequence[int],
) -> dict[str, object]:
    """Build deterministic result metadata for propagation jobs."""
    return {
        "object_ids": list(object_ids),
        "persisted_frame_count": len(persisted_frame_indices),
        "persisted_frame_indices": list(persisted_frame_indices),
    }
