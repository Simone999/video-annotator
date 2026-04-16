"""Manifest queries for annotation-foundation review bootstrap."""

from dataclasses import dataclass

from sqlalchemy import Select, select
from sqlalchemy.orm import Session

from app.db import FrameAnnotation, ObjectTrack, Video


@dataclass(frozen=True, slots=True)
class VideoManifestRecord:
    """Typed manifest summary for one persisted video."""

    video: Video
    objects: list[ObjectTrack]
    annotated_frames: list[int]
    keyframes: list[int]


def get_video_manifest(*, session: Session, video_id: str) -> VideoManifestRecord | None:
    """Return one video's manifest summary keyed by canonical frame indices."""
    video = session.get(Video, video_id)
    if video is None:
        return None

    objects = list(
        session.scalars(
            select(ObjectTrack).where(ObjectTrack.video_id == video_id).order_by(ObjectTrack.id),
        )
    )
    annotated_frames = _list_frame_indices(
        session=session,
        statement=select(FrameAnnotation.frame_idx)
        .where(FrameAnnotation.video_id == video_id)
        .distinct()
        .order_by(FrameAnnotation.frame_idx),
    )
    keyframes = _list_frame_indices(
        session=session,
        statement=select(FrameAnnotation.frame_idx)
        .where(
            FrameAnnotation.video_id == video_id,
            FrameAnnotation.is_keyframe.is_(True),
        )
        .distinct()
        .order_by(FrameAnnotation.frame_idx),
    )

    return VideoManifestRecord(
        video=video,
        objects=objects,
        annotated_frames=annotated_frames,
        keyframes=keyframes,
    )


def _list_frame_indices(*, session: Session, statement: Select[tuple[int]]) -> list[int]:
    """Materialize ordered frame-index queries into a plain integer list."""
    return list(session.scalars(statement))
