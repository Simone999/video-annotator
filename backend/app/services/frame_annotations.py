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


class FrameAnnotationNotFoundError(Exception):
    """Raised when one requested annotation row does not exist."""


@dataclass(slots=True)
class StoredFrameAnnotation:
    """Persisted annotation payload for API responses."""

    frame_idx: int
    object_id: str
    source: str
    box_xywh_norm: tuple[float, float, float, float]
    mask_path: str
    mask_confidence: float | None


@dataclass(slots=True)
class ReadFrameAnnotation:
    """Persisted annotation payload returned by read APIs."""

    object_id: str
    source: str
    box_xywh_norm: tuple[float, float, float, float] | None
    mask_path: str | None
    mask_confidence: float | None


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
    mask_confidence: float | None = None,
    masks_dir: Path | None = None,
    commit: bool = True,
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
        mask_confidence: Nullable SAM2 confidence for untouched mask output.
        masks_dir: Optional mask-root override for tests.
        commit: Whether to commit the open session before returning.

    Raises:
        InvalidBoxCoordinatesError: If box does not fit within indexed frame bounds.
    """
    box_xywh_norm = normalize_box_xyxy_to_xywh(
        box_xyxy_px=box_xyxy_px,
        video_width=video_width,
        video_height=video_height,
    )
    relative_mask_path = _write_mask_file(
        video_id=video_id,
        frame_idx=frame_idx,
        object_id=object_id,
        mask_png_bytes=mask_png_bytes,
        masks_dir=masks_dir,
    )

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
            mask_confidence=mask_confidence,
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
        persisted_annotation.mask_confidence = mask_confidence
        persisted_annotation.mask_rle = None

    if commit:
        session.commit()

    return StoredFrameAnnotation(
        frame_idx=frame_idx,
        object_id=object_id,
        source="sam2",
        box_xywh_norm=box_xywh_norm,
        mask_path=relative_mask_path.as_posix(),
        mask_confidence=mask_confidence,
    )


def upsert_sam2_propagated_frame_annotation(
    *,
    session: Session,
    video_id: str,
    frame_idx: int,
    object_id: str,
    mask_png_bytes: bytes,
    mask_confidence: float | None = None,
    masks_dir: Path | None = None,
    commit: bool = True,
) -> StoredFrameAnnotation:
    """Persist one propagated SAM2 annotation and backing mask file."""
    relative_mask_path = _write_mask_file(
        video_id=video_id,
        frame_idx=frame_idx,
        object_id=object_id,
        mask_png_bytes=mask_png_bytes,
        masks_dir=masks_dir,
    )

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
            is_keyframe=False,
            source="sam2",
            box_x=None,
            box_y=None,
            box_w=None,
            box_h=None,
            mask_path=relative_mask_path.as_posix(),
            mask_confidence=mask_confidence,
            mask_rle=None,
        )
        session.add(persisted_annotation)
    else:
        persisted_annotation.updated_at = now
        persisted_annotation.is_keyframe = False
        persisted_annotation.source = "sam2"
        persisted_annotation.box_x = None
        persisted_annotation.box_y = None
        persisted_annotation.box_w = None
        persisted_annotation.box_h = None
        persisted_annotation.mask_path = relative_mask_path.as_posix()
        persisted_annotation.mask_confidence = mask_confidence
        persisted_annotation.mask_rle = None

    if commit:
        session.commit()

    return StoredFrameAnnotation(
        frame_idx=frame_idx,
        object_id=object_id,
        source="sam2",
        box_xywh_norm=(0.0, 0.0, 0.0, 0.0),
        mask_path=relative_mask_path.as_posix(),
        mask_confidence=mask_confidence,
    )


def list_frame_annotations(
    *,
    session: Session,
    video_id: str,
    frame_idx: int,
) -> list[ReadFrameAnnotation]:
    """Return persisted annotation rows for one canonical frame."""
    persisted_annotations = session.scalars(
        select(FrameAnnotation)
        .where(
            FrameAnnotation.video_id == video_id,
            FrameAnnotation.frame_idx == frame_idx,
        )
        .order_by(FrameAnnotation.object_id.asc())
    ).all()

    return [
        ReadFrameAnnotation(
            object_id=annotation.object_id,
            source=annotation.source,
            box_xywh_norm=(
                None
                if (
                    annotation.box_x is None
                    or annotation.box_y is None
                    or annotation.box_w is None
                    or annotation.box_h is None
                )
                else (
                    annotation.box_x,
                    annotation.box_y,
                    annotation.box_w,
                    annotation.box_h,
                )
            ),
            mask_path=annotation.mask_path,
            mask_confidence=_resolve_mask_confidence(annotation=annotation),
        )
        for annotation in persisted_annotations
    ]


def _resolve_mask_confidence(*, annotation: FrameAnnotation) -> float | None:
    """Return reviewer-visible confidence only for untouched SAM2 rows."""
    if annotation.source != "sam2":
        return None

    return annotation.mask_confidence


def get_frame_annotation_mask_path(
    *,
    session: Session,
    video_id: str,
    frame_idx: int,
    object_id: str,
    masks_dir: Path | None = None,
) -> Path:
    """Resolve one persisted mask file path for API serving."""
    annotation = session.scalar(
        select(FrameAnnotation).where(
            FrameAnnotation.video_id == video_id,
            FrameAnnotation.frame_idx == frame_idx,
            FrameAnnotation.object_id == object_id,
            FrameAnnotation.mask_path.is_not(None),
        )
    )
    if annotation is None or annotation.mask_path is None:
        raise FrameAnnotationNotFoundError(object_id)

    return _resolve_mask_path(
        relative_mask_path=Path(annotation.mask_path),
        masks_dir=masks_dir,
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


def _write_mask_file(
    *,
    video_id: str,
    frame_idx: int,
    object_id: str,
    mask_png_bytes: bytes,
    masks_dir: Path | None,
) -> Path:
    """Write one persisted mask file and return its relative path."""
    resolved_masks_dir = masks_dir or get_masks_dir()
    relative_mask_path = (
        Path(resolved_masks_dir.name)
        / video_id
        / _safe_path_segment(object_id)
        / f"frame_{frame_idx:06d}.png"
    )
    absolute_mask_path = (
        resolved_masks_dir / video_id / _safe_path_segment(object_id) / f"frame_{frame_idx:06d}.png"
    )
    absolute_mask_path.parent.mkdir(parents=True, exist_ok=True)
    absolute_mask_path.write_bytes(mask_png_bytes)
    return relative_mask_path


def _resolve_mask_path(*, relative_mask_path: Path, masks_dir: Path | None) -> Path:
    """Resolve one stored relative mask path to an absolute filesystem path."""
    resolved_masks_dir = (masks_dir or get_masks_dir()).resolve()
    absolute_mask_path = (resolved_masks_dir.parent / relative_mask_path).resolve()
    if not absolute_mask_path.is_relative_to(resolved_masks_dir):
        raise FrameAnnotationNotFoundError(relative_mask_path.as_posix())

    if not absolute_mask_path.exists():
        raise FrameAnnotationNotFoundError(relative_mask_path.as_posix())

    return absolute_mask_path
