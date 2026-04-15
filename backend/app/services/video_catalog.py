"""Catalog queries for indexed videos, objects, and manifest state."""

from dataclasses import dataclass

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db import FrameAnnotation, ObjectTrack, Video


@dataclass(frozen=True, slots=True)
class VideoManifestData:
    """Manifest data assembled for one persisted video."""

    video: Video
    objects: list[ObjectTrack]
    annotated_frame_indices: list[int]
    keyframe_indices: list[int]


def list_indexed_videos(*, session: Session) -> list[Video]:
    """Return indexed videos ordered by canonical source path."""
    statement = select(Video).order_by(Video.source_path)
    return list(session.scalars(statement))


def get_indexed_video_by_id(*, session: Session, video_id: str) -> Video | None:
    """Return one indexed video by stable backend identifier."""
    return session.get(Video, video_id)


def get_video_manifest(*, session: Session, video_id: str) -> VideoManifestData | None:
    """Return persisted manifest data for one indexed video."""
    video = get_indexed_video_by_id(session=session, video_id=video_id)
    if video is None:
        return None

    object_statement = (
        select(ObjectTrack).where(ObjectTrack.video_id == video_id).order_by(ObjectTrack.id)
    )
    annotated_frames_statement = (
        select(FrameAnnotation.frame_idx)
        .where(FrameAnnotation.video_id == video_id)
        .distinct()
        .order_by(FrameAnnotation.frame_idx)
    )
    keyframes_statement = (
        select(FrameAnnotation.frame_idx)
        .where(
            FrameAnnotation.video_id == video_id,
            FrameAnnotation.is_keyframe.is_(True),
        )
        .distinct()
        .order_by(FrameAnnotation.frame_idx)
    )

    return VideoManifestData(
        video=video,
        objects=list(session.scalars(object_statement)),
        annotated_frame_indices=list(session.scalars(annotated_frames_statement)),
        keyframe_indices=list(session.scalars(keyframes_statement)),
    )


def create_object_track(
    *,
    session: Session,
    video_id: str,
    label: str,
) -> ObjectTrack | None:
    """Create one persisted object track for an indexed video."""
    if get_indexed_video_by_id(session=session, video_id=video_id) is None:
        return None

    object_track = ObjectTrack(
        video_id=video_id,
        label=label,
        color=None,
        status="active",
    )
    session.add(object_track)
    session.commit()
    session.refresh(object_track)
    return object_track
