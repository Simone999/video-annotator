"""Derived review-summary read models for library and inspector contracts."""

from dataclasses import dataclass
from typing import Literal

from sqlalchemy import and_, case, distinct, func, select
from sqlalchemy.orm import Session

from app.db import FrameAnnotation, Job, ObjectTrack, Video
from app.services.video_catalog import get_indexed_video_by_id, list_indexed_videos
from app.services.video_frames import FrameIndexOutOfRangeError

type ReviewState = Literal["not_started", "started", "in_progress", "ready", "exported"]

MANUAL_REVIEW_SOURCES = frozenset({"manual", "sam2_edited"})
ACTIVE_PROPAGATION_JOB_STATUSES = frozenset({"queued", "running"})
IMPORTED_ANNOTATION_SOURCE = "imported"
SAM2_ANNOTATION_SOURCE = "sam2"
CORRECTED_SAM2_ANNOTATION_SOURCE = "sam2_edited"
SAM2_PROPAGATION_JOB_TYPE = "sam2_propagation"


class ObjectTrackSummaryNotFoundError(Exception):
    """Raised when an object summary request targets the wrong video or object."""


class InvalidReviewSummaryRangeError(Exception):
    """Raised when one selected-object summary range is malformed."""


@dataclass(frozen=True, slots=True)
class VideoReviewSummaryRecord:
    """Derived library-card facts for one indexed video."""

    object_count: int
    annotated_frame_count: int
    imported_frame_count: int
    keyframe_count: int
    manual_frame_count: int
    propagated_frame_count: int
    last_annotated_frame_idx: int | None
    last_reviewed_frame_idx: int | None


@dataclass(frozen=True, slots=True)
class VideoWithReviewSummaryRecord:
    """Indexed video metadata plus backend-derived review summary fields."""

    video: Video
    review_state: ReviewState
    propagation_progress_percent: int | None
    review_summary: VideoReviewSummaryRecord


@dataclass(frozen=True, slots=True)
class TrackSummaryRecord:
    """Selected-range counters for one object summary."""

    frames: int
    propagated: int
    corrected: int


@dataclass(frozen=True, slots=True)
class SelectedObjectSummaryRecord:
    """Frame-scoped and range-scoped summary for one selected object."""

    video_id: str
    object_id: str
    label: str
    bbox_xyxy_px: tuple[int, int, int, int] | None
    mask_confidence: float | None
    track_summary: TrackSummaryRecord


@dataclass(frozen=True, slots=True)
class _VideoAnnotationStats:
    """Grouped annotation aggregates used to build review summaries."""

    object_count: int = 0
    annotated_frame_count: int = 0
    imported_frame_count: int = 0
    keyframe_count: int = 0
    manual_frame_count: int = 0
    propagated_frame_count: int = 0
    review_output_frame_count: int = 0
    last_annotated_frame_idx: int | None = None
    last_reviewed_frame_idx: int | None = None


def list_indexed_videos_with_review_summary(
    *,
    session: Session,
) -> list[VideoWithReviewSummaryRecord]:
    """Return indexed videos with derived library summary facts."""
    videos = list_indexed_videos(session=session)
    return _build_video_review_records(session=session, videos=videos)


def get_indexed_video_with_review_summary(
    *,
    session: Session,
    video_id: str,
) -> VideoWithReviewSummaryRecord | None:
    """Return one indexed video with derived library summary facts."""
    video = get_indexed_video_by_id(session=session, video_id=video_id)
    if video is None:
        return None

    return _build_video_review_records(session=session, videos=[video])[0]


def get_selected_object_summary(
    *,
    session: Session,
    video_id: str,
    object_id: str,
    frame_idx: int,
    start_frame_idx: int,
    end_frame_idx: int,
) -> SelectedObjectSummaryRecord | None:
    """Return one selected-object summary from persisted review facts."""
    video = get_indexed_video_by_id(session=session, video_id=video_id)
    if video is None:
        return None

    _validate_frame_idx(frame_idx=frame_idx, frame_count=video.frame_count)
    _validate_frame_idx(frame_idx=start_frame_idx, frame_count=video.frame_count)
    _validate_frame_idx(frame_idx=end_frame_idx, frame_count=video.frame_count)
    if start_frame_idx > end_frame_idx:
        raise InvalidReviewSummaryRangeError(
            "Range start frame must be less than or equal to range end frame"
        )

    object_track = session.scalar(
        select(ObjectTrack).where(
            ObjectTrack.id == object_id,
            ObjectTrack.video_id == video_id,
        )
    )
    if object_track is None:
        raise ObjectTrackSummaryNotFoundError(object_id)

    current_frame_annotation = session.scalar(
        select(FrameAnnotation).where(
            FrameAnnotation.video_id == video_id,
            FrameAnnotation.object_id == object_id,
            FrameAnnotation.frame_idx == frame_idx,
        )
    )
    propagated_count = session.scalar(
        select(func.count(distinct(FrameAnnotation.frame_idx))).where(
            FrameAnnotation.video_id == video_id,
            FrameAnnotation.object_id == object_id,
            FrameAnnotation.frame_idx >= start_frame_idx,
            FrameAnnotation.frame_idx <= end_frame_idx,
            FrameAnnotation.source == SAM2_ANNOTATION_SOURCE,
            FrameAnnotation.is_keyframe.is_(False),
        )
    )
    corrected_count = session.scalar(
        select(func.count(distinct(FrameAnnotation.frame_idx))).where(
            FrameAnnotation.video_id == video_id,
            FrameAnnotation.object_id == object_id,
            FrameAnnotation.frame_idx >= start_frame_idx,
            FrameAnnotation.frame_idx <= end_frame_idx,
            FrameAnnotation.source == CORRECTED_SAM2_ANNOTATION_SOURCE,
            FrameAnnotation.is_keyframe.is_(False),
        )
    )

    return SelectedObjectSummaryRecord(
        video_id=video_id,
        object_id=object_id,
        label=object_track.label,
        bbox_xyxy_px=(
            None
            if current_frame_annotation is None
            else _annotation_box_xyxy_px(
                annotation=current_frame_annotation,
                video_width=video.width,
                video_height=video.height,
            )
        ),
        mask_confidence=_annotation_mask_confidence(annotation=current_frame_annotation),
        track_summary=TrackSummaryRecord(
            frames=(end_frame_idx - start_frame_idx) + 1,
            propagated=propagated_count or 0,
            corrected=corrected_count or 0,
        ),
    )


def _build_video_review_records(
    *,
    session: Session,
    videos: list[Video],
) -> list[VideoWithReviewSummaryRecord]:
    """Assemble derived review summary facts for a batch of indexed videos."""
    if not videos:
        return []

    video_ids = [video.id for video in videos]
    annotation_stats_by_video_id = _video_annotation_stats_by_video_id(
        session=session,
        video_ids=video_ids,
    )
    active_jobs_by_video_id = _active_jobs_by_video_id(session=session, video_ids=video_ids)

    records: list[VideoWithReviewSummaryRecord] = []
    for video in videos:
        annotation_stats = annotation_stats_by_video_id.get(video.id, _VideoAnnotationStats())
        active_job = active_jobs_by_video_id.get(video.id)
        review_state, propagation_progress_percent = _derive_review_state(
            annotation_stats=annotation_stats,
            active_job=active_job,
        )
        records.append(
            VideoWithReviewSummaryRecord(
                video=video,
                review_state=review_state,
                propagation_progress_percent=propagation_progress_percent,
                review_summary=VideoReviewSummaryRecord(
                    object_count=annotation_stats.object_count,
                    annotated_frame_count=annotation_stats.annotated_frame_count,
                    imported_frame_count=annotation_stats.imported_frame_count,
                    keyframe_count=annotation_stats.keyframe_count,
                    manual_frame_count=annotation_stats.manual_frame_count,
                    propagated_frame_count=annotation_stats.propagated_frame_count,
                    last_annotated_frame_idx=annotation_stats.last_annotated_frame_idx,
                    last_reviewed_frame_idx=annotation_stats.last_reviewed_frame_idx,
                ),
            )
        )

    return records


def _annotation_mask_confidence(*, annotation: FrameAnnotation | None) -> float | None:
    """Return summary confidence only for untouched SAM2 rows."""
    if annotation is None or annotation.source != SAM2_ANNOTATION_SOURCE:
        return None

    return annotation.mask_confidence


def _video_annotation_stats_by_video_id(
    *,
    session: Session,
    video_ids: list[str],
) -> dict[str, _VideoAnnotationStats]:
    """Return grouped object and annotation aggregates for each video id."""
    if not video_ids:
        return {}

    object_count_rows = session.execute(
        select(
            ObjectTrack.video_id,
            func.count(ObjectTrack.id),
        )
        .where(ObjectTrack.video_id.in_(video_ids))
        .group_by(ObjectTrack.video_id)
    )
    object_counts_by_video_id: dict[str, int] = {}
    for video_id, object_count in object_count_rows:
        object_counts_by_video_id[video_id] = object_count
    annotation_stats_by_video_id = {
        video_id: _VideoAnnotationStats(
            object_count=object_counts_by_video_id.get(video_id, 0),
            annotated_frame_count=annotated_frame_count,
            imported_frame_count=imported_frame_count,
            keyframe_count=keyframe_count,
            manual_frame_count=manual_frame_count,
            propagated_frame_count=propagated_frame_count,
            review_output_frame_count=review_output_frame_count,
            last_annotated_frame_idx=last_annotated_frame_idx,
            last_reviewed_frame_idx=last_reviewed_frame_idx,
        )
        for (
            video_id,
            annotated_frame_count,
            imported_frame_count,
            keyframe_count,
            manual_frame_count,
            propagated_frame_count,
            review_output_frame_count,
            last_annotated_frame_idx,
            last_reviewed_frame_idx,
        ) in session.execute(
            select(
                FrameAnnotation.video_id,
                func.count(distinct(FrameAnnotation.frame_idx)),
                func.count(
                    distinct(
                        case(
                            (
                                FrameAnnotation.source == IMPORTED_ANNOTATION_SOURCE,
                                FrameAnnotation.frame_idx,
                            ),
                            else_=None,
                        )
                    )
                ),
                func.count(
                    distinct(
                        case(
                            (FrameAnnotation.is_keyframe.is_(True), FrameAnnotation.frame_idx),
                            else_=None,
                        )
                    )
                ),
                func.count(
                    distinct(
                        case(
                            (
                                FrameAnnotation.source.in_(tuple(MANUAL_REVIEW_SOURCES)),
                                FrameAnnotation.frame_idx,
                            ),
                            else_=None,
                        )
                    )
                ),
                func.count(
                    distinct(
                        case(
                            (
                                and_(
                                    FrameAnnotation.source == SAM2_ANNOTATION_SOURCE,
                                    FrameAnnotation.is_keyframe.is_(False),
                                ),
                                FrameAnnotation.frame_idx,
                            ),
                            else_=None,
                        )
                    )
                ),
                func.count(
                    distinct(
                        case(
                            (
                                FrameAnnotation.source != IMPORTED_ANNOTATION_SOURCE,
                                FrameAnnotation.frame_idx,
                            ),
                            else_=None,
                        )
                    )
                ),
                func.max(FrameAnnotation.frame_idx),
                func.max(
                    case(
                        (
                            FrameAnnotation.source.in_(tuple(MANUAL_REVIEW_SOURCES)),
                            FrameAnnotation.frame_idx,
                        ),
                        else_=None,
                    )
                ),
            )
            .where(FrameAnnotation.video_id.in_(video_ids))
            .group_by(FrameAnnotation.video_id)
        )
    }

    for video_id, object_count in object_counts_by_video_id.items():
        if video_id not in annotation_stats_by_video_id:
            annotation_stats_by_video_id[video_id] = _VideoAnnotationStats(
                object_count=object_count
            )

    return annotation_stats_by_video_id


def _active_jobs_by_video_id(*, session: Session, video_ids: list[str]) -> dict[str, Job]:
    """Return at most one active propagation job per video id."""
    if not video_ids:
        return {}

    jobs = session.scalars(
        select(Job)
        .where(
            Job.video_id.in_(video_ids),
            Job.type == SAM2_PROPAGATION_JOB_TYPE,
            Job.status.in_(tuple(ACTIVE_PROPAGATION_JOB_STATUSES)),
        )
        .order_by(Job.video_id.asc(), Job.started_at.desc(), Job.id.desc())
    ).all()

    active_jobs_by_video_id: dict[str, Job] = {}
    for job in jobs:
        active_jobs_by_video_id.setdefault(job.video_id, job)

    return active_jobs_by_video_id


def _derive_review_state(
    *,
    annotation_stats: _VideoAnnotationStats,
    active_job: Job | None,
) -> tuple[ReviewState, int | None]:
    """Map persisted annotation and job facts into one honest review state."""
    if active_job is not None:
        return ("in_progress", _progress_percent(active_job=active_job))

    if annotation_stats.review_output_frame_count > 0:
        return ("ready", None)

    if annotation_stats.imported_frame_count > 0:
        return ("started", None)

    return ("not_started", None)


def _progress_percent(*, active_job: Job) -> int:
    """Convert active propagation counters into a library-safe integer percent."""
    if active_job.progress_total <= 0:
        return 0

    return min(
        100,
        max(0, int((active_job.progress_current * 100) / active_job.progress_total)),
    )


def _annotation_box_xyxy_px(
    *,
    annotation: FrameAnnotation,
    video_width: int,
    video_height: int,
) -> tuple[int, int, int, int] | None:
    """Convert one normalized persisted box into display pixel coordinates."""
    if (
        annotation.box_x is None
        or annotation.box_y is None
        or annotation.box_w is None
        or annotation.box_h is None
    ):
        return None

    return (
        round(annotation.box_x * video_width),
        round(annotation.box_y * video_height),
        round((annotation.box_x + annotation.box_w) * video_width),
        round((annotation.box_y + annotation.box_h) * video_height),
    )


def _validate_frame_idx(*, frame_idx: int, frame_count: int) -> None:
    """Raise the shared range error when one frame index is invalid."""
    if frame_idx < 0 or frame_idx >= frame_count:
        raise FrameIndexOutOfRangeError(frame_count=frame_count)
