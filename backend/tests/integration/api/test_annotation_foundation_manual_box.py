"""Backend API integration tests for annotation foundation manual box workflows."""

from collections.abc import Callable
from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import select

import app.main as main_module
from app.db import FrameAnnotation
from app.db.migrations import upgrade_database
from app.db.seeds.baseline import seed_baseline
from app.db.session import get_engine, get_session_factory
from app.services.video_metadata import VideoMetadata

type VideoInspector = Callable[[Path], VideoMetadata]


def test_manual_annotation_routes_create_reload_update_and_delete_manual_rows(
    monkeypatch: pytest.MonkeyPatch,
    tmp_path: Path,
) -> None:
    """Persist manual box CRUD through real routes and reload rows with mask null."""
    database_path = tmp_path / "annotation-foundation.sqlite3"
    source_dir = tmp_path / "videos"
    source_dir.mkdir()
    _write_video_stub(source_dir / "street_scene_014.mp4")

    _configure_backend_for_test(
        monkeypatch=monkeypatch,
        database_path=database_path,
        source_dir=source_dir,
        inspect_video=_build_video_inspector(
            {
                "street_scene_014.mp4": VideoMetadata(
                    frame_count=240,
                    fps=24.0,
                    width=1920,
                    height=1080,
                    duration_seconds=10.0,
                )
            }
        ),
    )

    try:
        with TestClient(main_module.create_app()) as client:
            video_response = client.get("/api/videos")
            video_id = video_response.json()[0]["id"]

            create_object_response = client.post(
                f"/api/videos/{video_id}/objects",
                json={"label": "left hand"},
            )
            object_id = create_object_response.json()["id"]

            create_annotation_response = client.put(
                f"/api/videos/{video_id}/annotations/frame/7",
                json={
                    "box_xywh_norm": [0.1, 0.2, 0.3, 0.4],
                    "is_keyframe": True,
                    "object_id": object_id,
                },
            )
            update_annotation_response = client.put(
                f"/api/videos/{video_id}/annotations/frame/7",
                json={
                    "box_xywh_norm": [0.2, 0.25, 0.35, 0.3],
                    "is_keyframe": False,
                    "object_id": object_id,
                },
            )
            reload_annotation_response = client.get(f"/api/videos/{video_id}/annotations/frame/7")
            session_factory = get_session_factory()
            with session_factory() as session:
                persisted_annotations = list(
                    session.scalars(
                        select(FrameAnnotation).where(
                            FrameAnnotation.video_id == video_id,
                            FrameAnnotation.frame_idx == 7,
                        )
                    )
                )

                create_annotation_payload = create_annotation_response.json()
                update_annotation_payload = update_annotation_response.json()
                reload_annotation_payload = reload_annotation_response.json()

            delete_annotation_response = client.delete(
                f"/api/videos/{video_id}/annotations/frame/7/object/{object_id}"
            )
            reload_after_delete_response = client.get(f"/api/videos/{video_id}/annotations/frame/7")
            reload_after_delete_payload = reload_after_delete_response.json()
    finally:
        _clear_database_caches()

    assert video_response.status_code == 200
    assert create_object_response.status_code == 201
    assert create_annotation_response.status_code == 200
    assert update_annotation_response.status_code == 200
    assert reload_annotation_response.status_code == 200
    assert delete_annotation_response.status_code == 204
    assert reload_after_delete_response.status_code == 200

    created_object_payload = create_object_response.json()
    assert created_object_payload["id"] == object_id
    assert created_object_payload["label"] == "left hand"
    assert created_object_payload["status"] == "active"
    assert created_object_payload["color"].startswith("#")
    assert create_annotation_payload == {
        "box_xywh_norm": [0.1, 0.2, 0.3, 0.4],
        "frame_idx": 7,
        "is_keyframe": True,
        "mask": {"path": None},
        "object_id": object_id,
        "source": "manual",
        "video_id": video_id,
    }
    assert update_annotation_payload == {
        "box_xywh_norm": [0.2, 0.25, 0.35, 0.3],
        "frame_idx": 7,
        "is_keyframe": False,
        "mask": {"path": None},
        "object_id": object_id,
        "source": "manual",
        "video_id": video_id,
    }
    assert reload_annotation_payload == {
        "annotations": [
            {
                "box_xywh_norm": [0.2, 0.25, 0.35, 0.3],
                "mask_confidence": None,
                "mask": None,
                "object_id": object_id,
                "source": "manual",
            }
        ],
        "frame_idx": 7,
    }
    assert len(persisted_annotations) == 1
    assert persisted_annotations[0].object_id == object_id
    assert persisted_annotations[0].source == "manual"
    assert persisted_annotations[0].mask_path is None
    assert persisted_annotations[0].mask_confidence is None
    assert persisted_annotations[0].box_x == 0.2
    assert persisted_annotations[0].box_y == 0.25
    assert persisted_annotations[0].box_w == 0.35
    assert persisted_annotations[0].box_h == 0.3
    assert reload_after_delete_payload == {
        "annotations": [],
        "frame_idx": 7,
    }


def test_manual_annotation_routes_reject_wrong_video_object_and_invalid_frames(
    monkeypatch: pytest.MonkeyPatch,
    tmp_path: Path,
) -> None:
    """Reject real corruption risks instead of accepting cross-video or bad-frame writes."""
    database_path = tmp_path / "annotation-foundation-errors.sqlite3"
    source_dir = tmp_path / "videos"
    nested_dir = source_dir / "nested"
    nested_dir.mkdir(parents=True)
    _write_video_stub(source_dir / "street_scene_014.mp4")
    _write_video_stub(nested_dir / "warehouse_cam_001.mp4")

    _configure_backend_for_test(
        monkeypatch=monkeypatch,
        database_path=database_path,
        source_dir=source_dir,
        inspect_video=_build_video_inspector(
            {
                "street_scene_014.mp4": VideoMetadata(
                    frame_count=240,
                    fps=24.0,
                    width=1920,
                    height=1080,
                    duration_seconds=10.0,
                ),
                "warehouse_cam_001.mp4": VideoMetadata(
                    frame_count=120,
                    fps=30.0,
                    width=1280,
                    height=720,
                    duration_seconds=4.0,
                ),
            }
        ),
    )

    try:
        with TestClient(main_module.create_app()) as client:
            videos_response = client.get("/api/videos")
            videos = videos_response.json()
            first_video_id = next(
                video["id"] for video in videos if video["display_name"] == "street_scene_014.mp4"
            )
            second_video_id = next(
                video["id"] for video in videos if video["display_name"] == "warehouse_cam_001.mp4"
            )

            second_video_object_response = client.post(
                f"/api/videos/{second_video_id}/objects",
                json={"label": "forklift"},
            )
            wrong_video_object_id = second_video_object_response.json()["id"]

            wrong_video_response = client.put(
                f"/api/videos/{first_video_id}/annotations/frame/7",
                json={
                    "box_xywh_norm": [0.1, 0.2, 0.3, 0.4],
                    "is_keyframe": True,
                    "object_id": wrong_video_object_id,
                },
            )
            invalid_frame_response = client.put(
                f"/api/videos/{first_video_id}/annotations/frame/240",
                json={
                    "box_xywh_norm": [0.1, 0.2, 0.3, 0.4],
                    "is_keyframe": True,
                    "object_id": wrong_video_object_id,
                },
            )
    finally:
        _clear_database_caches()

    assert videos_response.status_code == 200
    assert second_video_object_response.status_code == 201
    assert wrong_video_response.status_code == 404
    assert wrong_video_response.json() == {"detail": "Object track not found"}
    assert invalid_frame_response.status_code == 400
    assert invalid_frame_response.json() == {"detail": "Frame index must be between 0 and 239"}


def test_object_track_delete_route_removes_linked_annotations_and_manifest_truth(
    monkeypatch: pytest.MonkeyPatch,
    tmp_path: Path,
) -> None:
    """Delete one whole object track and clear only target-object summary truth."""
    database_path = tmp_path / "object-track-delete.sqlite3"
    masks_dir = tmp_path / "masks"
    source_dir = tmp_path / "videos"
    source_dir.mkdir()
    masks_dir.mkdir()
    _write_video_stub(source_dir / "street_scene_014.mp4")
    monkeypatch.setenv("APP_MASKS_DIR", str(masks_dir))

    _configure_backend_for_test(
        monkeypatch=monkeypatch,
        database_path=database_path,
        source_dir=source_dir,
        inspect_video=_build_video_inspector(
            {
                "street_scene_014.mp4": VideoMetadata(
                    frame_count=240,
                    fps=24.0,
                    width=1920,
                    height=1080,
                    duration_seconds=10.0,
                )
            }
        ),
    )

    try:
        with TestClient(main_module.create_app()) as client:
            videos_response = client.get("/api/videos")
            video_id = videos_response.json()[0]["id"]

            deleted_object_response = client.post(
                f"/api/videos/{video_id}/objects",
                json={"label": "pedestrian"},
            )
            survivor_object_response = client.post(
                f"/api/videos/{video_id}/objects",
                json={"label": "cyclist"},
            )
            deleted_object_id = deleted_object_response.json()["id"]
            survivor_object_id = survivor_object_response.json()["id"]

            deleted_mask_relative_path = (
                Path("masks") / video_id / deleted_object_id / "frame_000007.png"
            )
            deleted_mask_absolute_path = (
                masks_dir / video_id / deleted_object_id / "frame_000007.png"
            )
            deleted_mask_absolute_path.parent.mkdir(parents=True, exist_ok=True)
            deleted_mask_absolute_path.write_bytes(b"deleted-object-mask")

            survivor_mask_relative_path = (
                Path("masks") / video_id / survivor_object_id / "frame_000007.png"
            )
            survivor_mask_absolute_path = (
                masks_dir / video_id / survivor_object_id / "frame_000007.png"
            )
            survivor_mask_absolute_path.parent.mkdir(parents=True, exist_ok=True)
            survivor_mask_absolute_path.write_bytes(b"survivor-mask")

            session_factory = get_session_factory()
            with session_factory() as session:
                session.add_all(
                    [
                        FrameAnnotation(
                            id="annotation-deleted-current",
                            video_id=video_id,
                            frame_idx=7,
                            object_id=deleted_object_id,
                            is_keyframe=True,
                            source="sam2",
                            box_x=0.1,
                            box_y=0.2,
                            box_w=0.3,
                            box_h=0.4,
                            mask_path=deleted_mask_relative_path.as_posix(),
                            mask_confidence=0.91,
                            mask_rle=None,
                        ),
                        FrameAnnotation(
                            id="annotation-deleted-corrected",
                            video_id=video_id,
                            frame_idx=8,
                            object_id=deleted_object_id,
                            is_keyframe=False,
                            source="sam2_edited",
                            box_x=None,
                            box_y=None,
                            box_w=None,
                            box_h=None,
                            mask_path=None,
                            mask_confidence=None,
                            mask_rle=None,
                        ),
                        FrameAnnotation(
                            id="annotation-survivor-current",
                            video_id=video_id,
                            frame_idx=7,
                            object_id=survivor_object_id,
                            is_keyframe=True,
                            source="sam2",
                            box_x=0.5,
                            box_y=0.25,
                            box_w=0.2,
                            box_h=0.25,
                            mask_path=survivor_mask_relative_path.as_posix(),
                            mask_confidence=0.73,
                            mask_rle=None,
                        ),
                    ]
                )
                session.commit()

            summary_before_delete_response = client.get(
                f"/api/videos/{video_id}/objects/{deleted_object_id}/summary",
                params={
                    "end_frame_idx": 8,
                    "frame_idx": 7,
                    "start_frame_idx": 7,
                },
            )
            delete_response = client.delete(f"/api/videos/{video_id}/objects/{deleted_object_id}")
            manifest_after_delete_response = client.get(f"/api/videos/{video_id}/manifest")
            annotations_after_delete_response = client.get(
                f"/api/videos/{video_id}/annotations/frame/7"
            )
            deleted_summary_after_delete_response = client.get(
                f"/api/videos/{video_id}/objects/{deleted_object_id}/summary",
                params={
                    "end_frame_idx": 8,
                    "frame_idx": 7,
                    "start_frame_idx": 7,
                },
            )
            survivor_summary_after_delete_response = client.get(
                f"/api/videos/{video_id}/objects/{survivor_object_id}/summary",
                params={
                    "end_frame_idx": 8,
                    "frame_idx": 7,
                    "start_frame_idx": 7,
                },
            )
            with session_factory() as session:
                remaining_annotations = list(
                    session.scalars(
                        select(FrameAnnotation).where(FrameAnnotation.video_id == video_id)
                    )
                )
    finally:
        _clear_database_caches()

    assert videos_response.status_code == 200
    assert deleted_object_response.status_code == 201
    assert survivor_object_response.status_code == 201
    assert summary_before_delete_response.status_code == 200
    assert summary_before_delete_response.json()["mask_confidence"] == 0.91
    assert delete_response.status_code == 204
    assert manifest_after_delete_response.status_code == 200
    assert annotations_after_delete_response.status_code == 200
    assert deleted_summary_after_delete_response.status_code == 404
    assert survivor_summary_after_delete_response.status_code == 200

    assert manifest_after_delete_response.json()["objects"] == [
        {
            "color": "#00ffaa",
            "id": survivor_object_id,
            "label": "cyclist",
            "status": "active",
        }
    ]
    assert annotations_after_delete_response.json() == {
        "annotations": [
            {
                "box_xywh_norm": [0.5, 0.25, 0.2, 0.25],
                "mask_confidence": 0.73,
                "mask": {"path": survivor_mask_relative_path.as_posix()},
                "object_id": survivor_object_id,
                "source": "sam2",
            }
        ],
        "frame_idx": 7,
    }
    assert deleted_summary_after_delete_response.json() == {"detail": "Object track not found"}
    assert survivor_summary_after_delete_response.json()["object_id"] == survivor_object_id
    assert survivor_summary_after_delete_response.json()["mask_confidence"] == 0.73
    assert [annotation.object_id for annotation in remaining_annotations] == [survivor_object_id]
    assert deleted_mask_absolute_path.exists() is False
    assert survivor_mask_absolute_path.exists() is True


def _configure_backend_for_test(
    *,
    monkeypatch: pytest.MonkeyPatch,
    database_path: Path,
    source_dir: Path,
    inspect_video: VideoInspector,
) -> None:
    """Point cached backend globals at temp storage for one integration test."""
    monkeypatch.setenv("APP_DB_URL", f"sqlite:///{database_path}")
    _clear_database_caches()
    upgrade_database(database_url=f"sqlite:///{database_path}")
    seed_baseline(
        database_url=f"sqlite:///{database_path}",
        source_dir=source_dir,
        inspect_video=inspect_video,
    )


def _clear_database_caches() -> None:
    """Reset cached engine and session factory between isolated backend tests."""
    get_session_factory.cache_clear()
    get_engine.cache_clear()


def _write_video_stub(video_path: Path) -> None:
    """Create one local video-path placeholder for indexing tests."""
    video_path.write_bytes(b"fake-video-file")


def _build_video_inspector(
    metadata_by_name: dict[str, VideoMetadata],
) -> VideoInspector:
    """Return a metadata inspector that maps file name to fixed metadata."""

    def inspect_video(video_path: Path) -> VideoMetadata:
        """Return fixed metadata for known test video paths."""
        return metadata_by_name[video_path.name]

    return inspect_video
