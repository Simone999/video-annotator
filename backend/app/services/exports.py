"""Deterministic native export manifest builders."""

from typing import TypedDict

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db import FrameAnnotation, ObjectTrack, Video


class ExportVideoNotFoundError(Exception):
    """Raised when an export build targets an unknown video."""


class NativeExportFramePayload(TypedDict, total=False):
    """JSON-ready annotation payload for one object on one frame."""

    is_keyframe: bool
    source: str
    box_xywh_norm: list[float]
    mask_path: str


class NativeExportObjectPayload(TypedDict):
    """JSON-ready object payload for one exported video."""

    id: str
    label: str
    frames: dict[str, NativeExportFramePayload]


class NativeExportVideoPayload(TypedDict):
    """JSON-ready video payload for native export."""

    video_id: str
    filepath: str
    fps: float
    frame_count: int
    objects: list[NativeExportObjectPayload]


class NativeExportPayload(TypedDict):
    """Top-level JSON-ready native export payload."""

    version: int
    videos: list[NativeExportVideoPayload]


def build_native_json_export_payload(*, session: Session, video_id: str) -> NativeExportPayload:
    """Build deterministic native export JSON payload for one persisted video."""
    video = session.get(Video, video_id)
    if video is None:
        raise ExportVideoNotFoundError(video_id)

    objects = list(
        session.scalars(
            select(ObjectTrack)
            .where(ObjectTrack.video_id == video_id)
            .order_by(ObjectTrack.id.asc()),
        )
    )
    annotations = list(
        session.scalars(
            select(FrameAnnotation)
            .where(FrameAnnotation.video_id == video_id)
            .order_by(FrameAnnotation.object_id.asc(), FrameAnnotation.frame_idx.asc()),
        )
    )

    frames_by_object_id: dict[str, dict[str, NativeExportFramePayload]] = {
        object_track.id: {} for object_track in objects
    }
    for annotation in annotations:
        frames_by_object_id.setdefault(annotation.object_id, {})[str(annotation.frame_idx)] = (
            _annotation_payload(annotation=annotation)
        )

    return {
        "version": 1,
        "videos": [
            {
                "video_id": video.id,
                "filepath": video.source_path,
                "fps": video.fps,
                "frame_count": video.frame_count,
                "objects": [
                    {
                        "id": object_track.id,
                        "label": object_track.label,
                        "frames": frames_by_object_id.get(object_track.id, {}),
                    }
                    for object_track in objects
                ],
            }
        ],
    }


def _annotation_payload(*, annotation: FrameAnnotation) -> NativeExportFramePayload:
    """Serialize one persisted annotation row into export JSON shape."""
    payload: NativeExportFramePayload = {
        "is_keyframe": annotation.is_keyframe,
        "source": annotation.source,
    }
    box_xywh_norm = _annotation_box_xywh_norm(annotation=annotation)
    if box_xywh_norm is not None:
        payload["box_xywh_norm"] = box_xywh_norm
    if annotation.mask_path is not None:
        payload["mask_path"] = annotation.mask_path
    return payload


def _annotation_box_xywh_norm(*, annotation: FrameAnnotation) -> list[float] | None:
    """Return persisted normalized box only when all box fields exist."""
    if (
        annotation.box_x is None
        or annotation.box_y is None
        or annotation.box_w is None
        or annotation.box_h is None
    ):
        return None

    return [
        annotation.box_x,
        annotation.box_y,
        annotation.box_w,
        annotation.box_h,
    ]
