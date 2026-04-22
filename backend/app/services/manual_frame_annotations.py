"""Service helpers for manual frame-annotation persistence."""

from uuid import uuid4

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db import FrameAnnotation, ObjectTrack, Video
from app.services.video_frames import FrameIndexOutOfRangeError

MANUAL_ANNOTATION_SOURCE = "manual"


class ManualFrameAnnotationVideoNotFoundError(Exception):
    """Raised when a manual annotation write targets an unknown video."""


class ManualFrameAnnotationObjectTrackNotFoundError(Exception):
    """Raised when a manual annotation write targets an unknown object track."""


class ManualFrameAnnotationNotFoundError(Exception):
    """Raised when a frame annotation delete targets a missing row."""


def upsert_manual_frame_annotation(
    *,
    session: Session,
    video_id: str,
    frame_idx: int,
    object_id: str,
    is_keyframe: bool,
    box_xywh_norm: list[float],
) -> FrameAnnotation:
    """Create or update one manual annotation for one canonical frame."""
    video = session.get(Video, video_id)
    if video is None:
        raise ManualFrameAnnotationVideoNotFoundError(video_id)

    if frame_idx < 0 or frame_idx >= video.frame_count:
        raise FrameIndexOutOfRangeError(frame_count=video.frame_count)

    object_track = session.get(ObjectTrack, object_id)
    if object_track is None or object_track.video_id != video_id:
        raise ManualFrameAnnotationObjectTrackNotFoundError(object_id)

    annotation = session.scalar(
        select(FrameAnnotation).where(
            FrameAnnotation.video_id == video_id,
            FrameAnnotation.frame_idx == frame_idx,
            FrameAnnotation.object_id == object_id,
        )
    )
    if annotation is None:
        annotation = FrameAnnotation(
            id=f"annotation-{uuid4().hex[:12]}",
            video_id=video_id,
            frame_idx=frame_idx,
            object_id=object_id,
            is_keyframe=is_keyframe,
            source=MANUAL_ANNOTATION_SOURCE,
            box_x=box_xywh_norm[0],
            box_y=box_xywh_norm[1],
            box_w=box_xywh_norm[2],
            box_h=box_xywh_norm[3],
            mask_path=None,
            mask_confidence=None,
            mask_rle=None,
        )
        session.add(annotation)
    else:
        annotation.is_keyframe = is_keyframe
        annotation.source = MANUAL_ANNOTATION_SOURCE
        annotation.box_x = box_xywh_norm[0]
        annotation.box_y = box_xywh_norm[1]
        annotation.box_w = box_xywh_norm[2]
        annotation.box_h = box_xywh_norm[3]
        annotation.mask_path = None
        annotation.mask_confidence = None
        annotation.mask_rle = None

    session.commit()
    session.refresh(annotation)
    return annotation


def delete_manual_frame_annotation(
    *,
    session: Session,
    video_id: str,
    frame_idx: int,
    object_id: str,
) -> None:
    """Delete one manual annotation for one canonical frame."""
    video = session.get(Video, video_id)
    if video is None:
        raise ManualFrameAnnotationVideoNotFoundError(video_id)

    if frame_idx < 0 or frame_idx >= video.frame_count:
        raise FrameIndexOutOfRangeError(frame_count=video.frame_count)

    annotation = session.scalar(
        select(FrameAnnotation).where(
            FrameAnnotation.video_id == video_id,
            FrameAnnotation.frame_idx == frame_idx,
            FrameAnnotation.object_id == object_id,
        )
    )
    if annotation is None:
        raise ManualFrameAnnotationNotFoundError(object_id)

    session.delete(annotation)
    session.commit()
