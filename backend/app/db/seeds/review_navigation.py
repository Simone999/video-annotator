"""Scenario seed helpers for review-navigation E2E coverage."""

from sqlalchemy import select

from app.db import ObjectTrack, Video
from app.db.session import get_session_factory
from app.services.manual_frame_annotations import upsert_manual_frame_annotation
from app.services.object_tracks import create_object_track

REVIEW_NAVIGATION_OBJECT_LABEL = "e2e-seed-object"
REVIEW_NAVIGATION_BOX_XYWH_NORM = [0.1, 0.1, 0.2, 0.2]
REVIEW_NAVIGATION_FRAME_CHOICES = (7, 18)


def seed_review_navigation(*, database_url: str | None = None) -> dict[str, object]:
    """Seed one deterministic review-navigation scenario."""
    with get_session_factory(database_url=database_url)() as session:
        seeded_video = session.scalar(select(Video).order_by(Video.source_path.asc()))
        if seeded_video is None:
            raise RuntimeError("Run baseline E2E seed before review-navigation seed")

        object_track = session.scalar(
            select(ObjectTrack).where(
                ObjectTrack.video_id == seeded_video.id,
                ObjectTrack.label == REVIEW_NAVIGATION_OBJECT_LABEL,
            )
        )
        if object_track is None:
            object_track = create_object_track(
                session=session,
                video_id=seeded_video.id,
                label=REVIEW_NAVIGATION_OBJECT_LABEL,
            )
            if object_track is None:
                raise RuntimeError("Seeded review-navigation video is missing")

        frame_indices = _resolve_seed_frame_indices(frame_count=seeded_video.frame_count)
        for frame_idx in frame_indices:
            upsert_manual_frame_annotation(
                session=session,
                video_id=seeded_video.id,
                frame_idx=frame_idx,
                object_id=object_track.id,
                is_keyframe=True,
                box_xywh_norm=REVIEW_NAVIGATION_BOX_XYWH_NORM,
            )

        return {
            "frame_indices": frame_indices,
            "object_id": object_track.id,
            "video_display_name": seeded_video.display_name,
            "video_id": seeded_video.id,
        }


def _resolve_seed_frame_indices(*, frame_count: int) -> list[int]:
    unique_indices: list[int] = []
    for frame_idx in [*REVIEW_NAVIGATION_FRAME_CHOICES, 0, max(frame_count - 1, 0)]:
        if frame_idx < 0 or frame_idx >= frame_count or frame_idx in unique_indices:
            continue
        unique_indices.append(frame_idx)
        if len(unique_indices) == 2:
            break

    return unique_indices
