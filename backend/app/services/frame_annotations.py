"""Persistence helpers for canonical frame-annotation metadata."""

import re
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from uuid import uuid4

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import get_masks_dir
from app.db import FrameAnnotation


class InvalidBoxCoordinatesError(Exception):
    """Raised when prompt-box coordinates do not define a valid in-frame box."""


@dataclass(slots=True)
class StoredFrameAnnotation:
    """Persisted annotation payload for API responses."""

    frame_idx: int
    object_id: str
    source: str
    box_xywh_norm: tuple[float, float, float, float]
    mask_path: str


def upsert_sam2_frame_annotation(
    *,
    session: Session,
    video_id: str,
    frame_idx: int,
    object_id: str,
    video_width: int,
    video_height: int,
    box_xyxy_px: tuple[int, int, int, int],
    mask_png_bytes: bytes,
    masks_dir: Path | None = None,
) -> StoredFrameAnnotation:
    """Persist one SAM2-produced same-frame annotation and backing mask file.

    Args:
        session: Open database session.
        video_id: Indexed video identifier.
        frame_idx: Canonical zero-based frame index.
        object_id: Logical object identifier.
        video_width: Indexed video width in pixels.
        video_height: Indexed video height in pixels.
        box_xyxy_px: Prompt box pixel coordinates `(x1, y1, x2, y2)`.
        mask_png_bytes: PNG bytes returned by SAM2 adapter.
        masks_dir: Optional mask-root override for tests.

    Raises:
        InvalidBoxCoordinatesError: If box does not fit within indexed frame bounds.
    """
    box_xywh_norm = normalize_box_xyxy_to_xywh(
        box_xyxy_px=box_xyxy_px,
        video_width=video_width,
        video_height=video_height,
    )
    resolved_masks_dir = masks_dir or get_masks_dir()
    relative_mask_path = (
        Path(resolved_masks_dir.name)
        / video_id
        / _safe_path_segment(object_id)
        / f"frame_{frame_idx:06d}.png"
    )
    absolute_mask_path = (
        resolved_masks_dir
        / video_id
        / _safe_path_segment(object_id)
        / (f"frame_{frame_idx:06d}.png")
    )
    absolute_mask_path.parent.mkdir(parents=True, exist_ok=True)
    absolute_mask_path.write_bytes(mask_png_bytes)

    persisted_annotation = session.scalar(
        select(FrameAnnotation).where(
            FrameAnnotation.video_id == video_id,
            FrameAnnotation.frame_idx == frame_idx,
            FrameAnnotation.object_id == object_id,
        )
    )
    now = datetime.now()
    if persisted_annotation is None:
        persisted_annotation = FrameAnnotation(
            id=f"annotation-{uuid4().hex}",
            video_id=video_id,
            frame_idx=frame_idx,
            object_id=object_id,
            created_at=now,
            updated_at=now,
            is_keyframe=True,
            source="sam2",
            box_x=box_xywh_norm[0],
            box_y=box_xywh_norm[1],
            box_w=box_xywh_norm[2],
            box_h=box_xywh_norm[3],
            mask_path=relative_mask_path.as_posix(),
            mask_rle=None,
        )
        session.add(persisted_annotation)
    else:
        persisted_annotation.updated_at = now
        persisted_annotation.is_keyframe = True
        persisted_annotation.source = "sam2"
        persisted_annotation.box_x = box_xywh_norm[0]
        persisted_annotation.box_y = box_xywh_norm[1]
        persisted_annotation.box_w = box_xywh_norm[2]
        persisted_annotation.box_h = box_xywh_norm[3]
        persisted_annotation.mask_path = relative_mask_path.as_posix()
        persisted_annotation.mask_rle = None

    session.commit()
    return StoredFrameAnnotation(
        frame_idx=frame_idx,
        object_id=object_id,
        source="sam2",
        box_xywh_norm=box_xywh_norm,
        mask_path=relative_mask_path.as_posix(),
    )


def normalize_box_xyxy_to_xywh(
    *,
    box_xyxy_px: tuple[int, int, int, int],
    video_width: int,
    video_height: int,
) -> tuple[float, float, float, float]:
    """Normalize one in-frame pixel box into `xywh` fractions."""
    x1, y1, x2, y2 = box_xyxy_px
    if x1 < 0 or y1 < 0 or x2 <= x1 or y2 <= y1:
        raise InvalidBoxCoordinatesError("Prompt box must define a positive in-frame area")

    if x2 > video_width or y2 > video_height:
        raise InvalidBoxCoordinatesError("Prompt box must stay within indexed frame bounds")

    return (
        x1 / video_width,
        y1 / video_height,
        (x2 - x1) / video_width,
        (y2 - y1) / video_height,
    )


def _safe_path_segment(value: str) -> str:
    """Map arbitrary object ids into stable filesystem-safe path segments."""
    sanitized_value = re.sub(r"[^A-Za-z0-9._-]+", "_", value).strip("._")
    if sanitized_value:
        return sanitized_value

    return "object"
