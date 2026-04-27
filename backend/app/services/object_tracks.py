"""Service helpers for persisted object-track lifecycle."""

from pathlib import Path
from uuid import uuid4

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import get_masks_dir
from app.db import FrameAnnotation, ObjectTrack, Video

DEFAULT_OBJECT_COLOR = "#04B84C"
DEFAULT_OBJECT_STATUS = "active"


class ObjectTrackNotFoundError(Exception):
    """Raised when a whole-track action targets an unknown object."""


def create_object_track(
    *,
    session: Session,
    video_id: str,
    label: str,
    color: str = DEFAULT_OBJECT_COLOR,
) -> ObjectTrack | None:
    """Create one stable object track for an indexed video."""
    video = session.get(Video, video_id)
    if video is None:
        return None

    object_track = ObjectTrack(
        id=f"object-{uuid4().hex[:12]}",
        video_id=video_id,
        label=label,
        color=color,
        status=DEFAULT_OBJECT_STATUS,
    )
    session.add(object_track)
    session.commit()
    session.refresh(object_track)
    return object_track


def delete_object_track(
    *,
    session: Session,
    video_id: str,
    object_id: str,
    masks_dir: Path | None = None,
    commit: bool = True,
) -> None:
    """Delete one object track, all linked rows, and any persisted mask files."""
    object_track = session.scalar(
        select(ObjectTrack).where(
            ObjectTrack.id == object_id,
            ObjectTrack.video_id == video_id,
        )
    )
    if object_track is None:
        raise ObjectTrackNotFoundError(object_id)

    annotations = session.scalars(
        select(FrameAnnotation).where(
            FrameAnnotation.video_id == video_id,
            FrameAnnotation.object_id == object_id,
        )
    ).all()
    deleted_mask_paths = [
        Path(annotation.mask_path) for annotation in annotations if annotation.mask_path is not None
    ]

    for annotation in annotations:
        session.delete(annotation)
    session.delete(object_track)

    if commit:
        session.commit()

    for deleted_mask_path in deleted_mask_paths:
        _delete_persisted_mask_file(
            relative_mask_path=deleted_mask_path,
            masks_dir=masks_dir,
        )


def _delete_persisted_mask_file(
    *,
    relative_mask_path: Path,
    masks_dir: Path | None,
) -> None:
    absolute_mask_path = _resolve_mask_path(
        relative_mask_path=relative_mask_path,
        masks_dir=masks_dir,
    )
    if absolute_mask_path is None:
        return

    absolute_mask_path.unlink(missing_ok=True)


def _resolve_mask_path(*, relative_mask_path: Path, masks_dir: Path | None) -> Path | None:
    resolved_masks_dir = (masks_dir or get_masks_dir()).resolve()
    absolute_mask_path = (resolved_masks_dir.parent / relative_mask_path).resolve()
    if not absolute_mask_path.is_relative_to(resolved_masks_dir):
        return None

    if not absolute_mask_path.exists():
        return None

    return absolute_mask_path
