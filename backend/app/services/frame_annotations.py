"""Frame-annotation CRUD services for milestone-02 box workflows."""

from collections.abc import Sequence
from dataclasses import dataclass

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db import FrameAnnotation, ObjectTrack
from app.schemas import FrameAnnotationPayload, VideoFrameAnnotationPayload
from app.services.video_catalog import get_indexed_video_by_id
from app.services.video_frames import FrameIndexOutOfRangeError, IndexedVideoNotFoundError


class ObjectTrackNotFoundError(Exception):
    """Raised when a requested object does not belong to the selected video."""


@dataclass(frozen=True, slots=True)
class VideoAnnotationsData:
    """All persisted annotations for one indexed video."""

    video_id: str
    annotations: list[VideoFrameAnnotationPayload]


@dataclass(frozen=True, slots=True)
class FrameAnnotationsData:
    """All persisted annotations for one indexed frame."""

    video_id: str
    frame_idx: int
    annotations: list[FrameAnnotationPayload]


def list_video_annotations(*, session: Session, video_id: str) -> VideoAnnotationsData:
    """Return all persisted annotations for one indexed video."""
    _validate_video(session=session, video_id=video_id)
    statement = (
        select(FrameAnnotation)
        .where(FrameAnnotation.video_id == video_id)
        .order_by(FrameAnnotation.frame_idx, FrameAnnotation.object_id)
    )
    rows = list(session.scalars(statement))
    return VideoAnnotationsData(
        video_id=video_id,
        annotations=[_build_video_frame_annotation_payload(row) for row in rows],
    )


def get_frame_annotations(
    *,
    session: Session,
    video_id: str,
    frame_idx: int,
) -> FrameAnnotationsData:
    """Return all persisted annotations for one canonical frame."""
    _validate_frame_index(session=session, video_id=video_id, frame_idx=frame_idx)
    statement = (
        select(FrameAnnotation)
        .where(
            FrameAnnotation.video_id == video_id,
            FrameAnnotation.frame_idx == frame_idx,
        )
        .order_by(FrameAnnotation.object_id)
    )
    rows = list(session.scalars(statement))
    return FrameAnnotationsData(
        video_id=video_id,
        frame_idx=frame_idx,
        annotations=[_build_frame_annotation_payload(row) for row in rows],
    )


def upsert_frame_annotations(
    *,
    session: Session,
    video_id: str,
    frame_idx: int,
    annotations: Sequence[FrameAnnotationPayload],
) -> FrameAnnotationsData:
    """Create or update one or more annotations on one canonical frame."""
    _validate_frame_index(session=session, video_id=video_id, frame_idx=frame_idx)

    for annotation in annotations:
        _validate_object_track(
            session=session,
            video_id=video_id,
            object_id=annotation.object_id,
        )
        existing_annotation = session.scalar(
            select(FrameAnnotation).where(
                FrameAnnotation.video_id == video_id,
                FrameAnnotation.frame_idx == frame_idx,
                FrameAnnotation.object_id == annotation.object_id,
            )
        )
        if existing_annotation is None:
            existing_annotation = FrameAnnotation(
                video_id=video_id,
                frame_idx=frame_idx,
                object_id=annotation.object_id,
                is_keyframe=annotation.is_keyframe,
                source=annotation.source,
                box_x=annotation.box_xywh_norm[0],
                box_y=annotation.box_xywh_norm[1],
                box_w=annotation.box_xywh_norm[2],
                box_h=annotation.box_xywh_norm[3],
                mask_path=None,
                mask_rle=None,
            )
            session.add(existing_annotation)
            continue

        existing_annotation.is_keyframe = annotation.is_keyframe
        existing_annotation.source = annotation.source
        existing_annotation.box_x = annotation.box_xywh_norm[0]
        existing_annotation.box_y = annotation.box_xywh_norm[1]
        existing_annotation.box_w = annotation.box_xywh_norm[2]
        existing_annotation.box_h = annotation.box_xywh_norm[3]

    session.commit()
    return get_frame_annotations(session=session, video_id=video_id, frame_idx=frame_idx)


def delete_frame_annotation(
    *,
    session: Session,
    video_id: str,
    frame_idx: int,
    object_id: int,
) -> bool:
    """Delete one object's annotation on one canonical frame."""
    _validate_frame_index(session=session, video_id=video_id, frame_idx=frame_idx)
    annotation = session.scalar(
        select(FrameAnnotation).where(
            FrameAnnotation.video_id == video_id,
            FrameAnnotation.frame_idx == frame_idx,
            FrameAnnotation.object_id == object_id,
        )
    )
    if annotation is None:
        return False

    session.delete(annotation)
    session.commit()
    return True


def _validate_video(*, session: Session, video_id: str) -> None:
    """Ensure the selected indexed video exists."""
    if get_indexed_video_by_id(session=session, video_id=video_id) is None:
        raise IndexedVideoNotFoundError(video_id)


def _validate_frame_index(*, session: Session, video_id: str, frame_idx: int) -> None:
    """Ensure canonical frame index belongs to selected indexed video."""
    video = get_indexed_video_by_id(session=session, video_id=video_id)
    if video is None:
        raise IndexedVideoNotFoundError(video_id)

    if frame_idx < 0 or frame_idx >= video.frame_count:
        raise FrameIndexOutOfRangeError(frame_count=video.frame_count)


def _validate_object_track(*, session: Session, video_id: str, object_id: int) -> None:
    """Ensure the requested object belongs to the selected video."""
    object_track = session.get(ObjectTrack, object_id)
    if object_track is None or object_track.video_id != video_id:
        raise ObjectTrackNotFoundError(object_id)


def _build_frame_annotation_payload(row: FrameAnnotation) -> FrameAnnotationPayload:
    """Convert one ORM row into frame-scoped API payload."""
    return FrameAnnotationPayload(
        object_id=row.object_id,
        is_keyframe=row.is_keyframe,
        source=row.source,
        box_xywh_norm=[row.box_x, row.box_y, row.box_w, row.box_h],
    )


def _build_video_frame_annotation_payload(row: FrameAnnotation) -> VideoFrameAnnotationPayload:
    """Convert one ORM row into video-scoped API payload."""
    return VideoFrameAnnotationPayload(
        frame_idx=row.frame_idx,
        object_id=row.object_id,
        is_keyframe=row.is_keyframe,
        source=row.source,
        box_xywh_norm=[row.box_x, row.box_y, row.box_w, row.box_h],
    )
