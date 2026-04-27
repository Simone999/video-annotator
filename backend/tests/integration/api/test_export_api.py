"""Backend API integration tests for export create and download routes."""

import io
import json
import zipfile
from collections.abc import Callable
from datetime import datetime
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

import app.main as main_module
from app.db import ExportRecord, FrameAnnotation, ObjectTrack
from app.db.migrations import upgrade_database
from app.db.seeds.baseline import seed_baseline
from app.db.session import get_engine, get_session_factory
from app.services.video_metadata import VideoMetadata

type VideoInspector = Callable[[Path], VideoMetadata]


def test_export_routes_create_zip_artifact_record_and_download_payload(
    monkeypatch: pytest.MonkeyPatch,
    tmp_path: Path,
) -> None:
    """Create one deterministic export zip and download it through real routes."""
    database_path = tmp_path / "export-api.sqlite3"
    exports_dir = tmp_path / "exports"
    masks_dir = tmp_path / "masks"
    source_dir = tmp_path / "videos"
    source_dir.mkdir()
    exports_dir.mkdir()
    masks_dir.mkdir()
    _write_video_stub(source_dir / "ready.mp4")

    monkeypatch.setenv("APP_MASKS_DIR", str(masks_dir))
    monkeypatch.setenv("APP_EXPORTS_DIR", str(exports_dir))
    _configure_backend_for_test(
        monkeypatch=monkeypatch,
        database_path=database_path,
        source_dir=source_dir,
        inspect_video=_build_video_inspector(
            {
                "ready.mp4": VideoMetadata(
                    frame_count=24,
                    fps=24.0,
                    width=400,
                    height=200,
                    duration_seconds=1.0,
                )
            }
        ),
    )

    try:
        with TestClient(main_module.create_app()) as client:
            video_response = client.get("/api/videos")
            video_id = video_response.json()[0]["id"]
            _seed_export_fixture(video_id=video_id, masks_dir=masks_dir)

            create_response = client.post(f"/api/videos/{video_id}/export")
            create_payload = create_response.json()
            export_id = create_payload["export_id"]
            download_response = client.get(f"/api/exports/{export_id}")

            session_factory = get_session_factory()
            with session_factory() as session:
                export_record = session.get(ExportRecord, export_id)
    finally:
        _clear_database_caches()

    assert video_response.status_code == 200
    assert create_response.status_code == 201
    assert create_payload == {"export_id": export_id}
    assert export_record is not None
    assert export_record.video_id == video_id
    assert export_record.review_output_updated_at == datetime(2026, 4, 24, 9, 1, 0)

    assert download_response.status_code == 200
    assert download_response.headers["content-type"].startswith("application/zip")

    archive = zipfile.ZipFile(io.BytesIO(download_response.content))
    assert sorted(archive.namelist()) == [
        "annotations.json",
        "masks/video-export/object-a/frame_000007.png",
        "masks/video-export/object-b/frame_000009.png",
    ]
    assert json.loads(archive.read("annotations.json")) == {
        "version": 1,
        "videos": [
            {
                "video_id": video_id,
                "filepath": str(source_dir / "ready.mp4"),
                "fps": 24.0,
                "frame_count": 24,
                "objects": [
                    {
                        "id": "object-a",
                        "label": "left",
                        "frames": {
                            "2": {
                                "is_keyframe": True,
                                "source": "manual",
                                "box_xywh_norm": [0.25, 0.1, 0.2, 0.3],
                            },
                            "7": {
                                "is_keyframe": False,
                                "source": "sam2_edited",
                                "mask_path": "masks/video-export/object-a/frame_000007.png",
                            },
                        },
                    },
                    {
                        "id": "object-b",
                        "label": "right",
                        "frames": {
                            "9": {
                                "is_keyframe": False,
                                "source": "sam2",
                                "mask_path": "masks/video-export/object-b/frame_000009.png",
                            }
                        },
                    },
                ],
            }
        ],
    }
    assert archive.read("masks/video-export/object-a/frame_000007.png") == b"mask-object-a-frame-7"
    assert archive.read("masks/video-export/object-b/frame_000009.png") == b"mask-object-b-frame-9"


def test_export_routes_reject_unknown_video_and_export_id(
    monkeypatch: pytest.MonkeyPatch,
    tmp_path: Path,
) -> None:
    """Map missing create and download targets to stable 404 responses."""
    database_path = tmp_path / "export-api-errors.sqlite3"
    source_dir = tmp_path / "videos"
    source_dir.mkdir()
    _write_video_stub(source_dir / "ready.mp4")

    _configure_backend_for_test(
        monkeypatch=monkeypatch,
        database_path=database_path,
        source_dir=source_dir,
        inspect_video=_build_video_inspector(
            {
                "ready.mp4": VideoMetadata(
                    frame_count=24,
                    fps=24.0,
                    width=400,
                    height=200,
                    duration_seconds=1.0,
                )
            }
        ),
    )

    try:
        with TestClient(main_module.create_app()) as client:
            create_response = client.post("/api/videos/missing-video/export")
            download_response = client.get("/api/exports/missing-export")
    finally:
        _clear_database_caches()

    assert create_response.status_code == 404
    assert create_response.json() == {"detail": "Indexed video not found"}
    assert download_response.status_code == 404
    assert download_response.json() == {"detail": "Export not found"}


def _seed_export_fixture(*, video_id: str, masks_dir: Path) -> None:
    """Persist exportable rows and matching mask files for one ready video."""
    session_factory = get_session_factory()
    with session_factory() as session:
        session.add_all(
            [
                ObjectTrack(
                    id="object-b",
                    video_id=video_id,
                    label="right",
                    color="#22aaee",
                    status="active",
                ),
                ObjectTrack(
                    id="object-a",
                    video_id=video_id,
                    label="left",
                    color="#ffaa22",
                    status="active",
                ),
                FrameAnnotation(
                    id="annotation-object-b-frame-9",
                    video_id=video_id,
                    frame_idx=9,
                    object_id="object-b",
                    is_keyframe=False,
                    source="sam2",
                    box_x=None,
                    box_y=None,
                    box_w=None,
                    box_h=None,
                    mask_path="masks/video-export/object-b/frame_000009.png",
                    mask_confidence=0.73,
                    mask_rle=None,
                    created_at=datetime(2026, 4, 24, 9, 1, 0),
                    updated_at=datetime(2026, 4, 24, 9, 1, 0),
                ),
                FrameAnnotation(
                    id="annotation-object-a-frame-7",
                    video_id=video_id,
                    frame_idx=7,
                    object_id="object-a",
                    is_keyframe=False,
                    source="sam2_edited",
                    box_x=None,
                    box_y=None,
                    box_w=None,
                    box_h=None,
                    mask_path="masks/video-export/object-a/frame_000007.png",
                    mask_confidence=None,
                    mask_rle=None,
                    created_at=datetime(2026, 4, 24, 9, 0, 0),
                    updated_at=datetime(2026, 4, 24, 9, 0, 0),
                ),
                FrameAnnotation(
                    id="annotation-object-a-frame-2",
                    video_id=video_id,
                    frame_idx=2,
                    object_id="object-a",
                    is_keyframe=True,
                    source="manual",
                    box_x=0.25,
                    box_y=0.10,
                    box_w=0.20,
                    box_h=0.30,
                    mask_path=None,
                    mask_confidence=None,
                    mask_rle=None,
                    created_at=datetime(2026, 4, 24, 8, 59, 0),
                    updated_at=datetime(2026, 4, 24, 8, 59, 0),
                ),
            ]
        )
        session.commit()

    object_a_mask_path = masks_dir / "video-export" / "object-a" / "frame_000007.png"
    object_b_mask_path = masks_dir / "video-export" / "object-b" / "frame_000009.png"
    object_a_mask_path.parent.mkdir(parents=True, exist_ok=True)
    object_b_mask_path.parent.mkdir(parents=True, exist_ok=True)
    object_a_mask_path.write_bytes(b"mask-object-a-frame-7")
    object_b_mask_path.write_bytes(b"mask-object-b-frame-9")


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
