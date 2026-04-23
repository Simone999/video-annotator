"""Deterministic native export manifest builders."""

import json
import shutil
from copy import deepcopy
from pathlib import Path
from typing import TypedDict

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import get_masks_dir
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


def write_native_export_artifacts(
    *,
    session: Session,
    video_id: str,
    export_dir: Path,
    masks_dir: Path | None = None,
    boxes_only: bool = False,
) -> NativeExportPayload:
    """Write deterministic export package for one persisted video."""
    payload = build_native_json_export_payload(
        session=session,
        video_id=video_id,
    )
    export_payload = _artifact_payload(
        payload=payload,
        boxes_only=boxes_only,
    )

    _reset_export_dir(export_dir=export_dir)
    (export_dir / "annotations.json").write_text(
        json.dumps(export_payload, indent=2) + "\n",
        encoding="utf-8",
    )

    if not boxes_only:
        for relative_mask_path in _iter_mask_paths(payload=export_payload):
            source_mask_path = _resolve_source_mask_path(
                relative_mask_path=Path(relative_mask_path),
                masks_dir=masks_dir,
            )
            destination_mask_path = export_dir / relative_mask_path
            destination_mask_path.parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(source_mask_path, destination_mask_path)

    return export_payload


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


def _artifact_payload(
    *,
    payload: NativeExportPayload,
    boxes_only: bool,
) -> NativeExportPayload:
    export_payload = deepcopy(payload)
    if not boxes_only:
        return export_payload

    for video in export_payload["videos"]:
        for exported_object in video["objects"]:
            for frame_payload in exported_object["frames"].values():
                frame_payload.pop("mask_path", None)

    return export_payload


def _iter_mask_paths(*, payload: NativeExportPayload) -> list[str]:
    return [
        frame_payload["mask_path"]
        for video in payload["videos"]
        for exported_object in video["objects"]
        for frame_payload in exported_object["frames"].values()
        if "mask_path" in frame_payload
    ]


def _reset_export_dir(*, export_dir: Path) -> None:
    export_dir.mkdir(parents=True, exist_ok=True)
    annotations_path = export_dir / "annotations.json"
    masks_export_dir = export_dir / "masks"
    if annotations_path.exists():
        annotations_path.unlink()
    if masks_export_dir.exists():
        shutil.rmtree(masks_export_dir)


def _resolve_source_mask_path(*, relative_mask_path: Path, masks_dir: Path | None) -> Path:
    resolved_masks_dir = (masks_dir or get_masks_dir()).resolve()
    source_mask_path = (resolved_masks_dir.parent / relative_mask_path).resolve()
    if not source_mask_path.is_relative_to(resolved_masks_dir):
        raise FileNotFoundError(relative_mask_path.as_posix())
    if not source_mask_path.exists():
        raise FileNotFoundError(relative_mask_path.as_posix())
    return source_mask_path


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
