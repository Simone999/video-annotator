"""Tests for persisted frame-annotation read APIs."""

from datetime import datetime
from pathlib import Path

from fastapi.testclient import TestClient
from pytest import MonkeyPatch
from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from app.db import Base, FrameAnnotation, Video
from app.db.session import get_engine, get_session_factory
from app.main import create_app


def test_get_frame_annotations_returns_persisted_same_frame_metadata(
    tmp_path: Path,
    monkeypatch: MonkeyPatch,
) -> None:
    """Return one persisted frame annotation for one canonical frame."""
    client = _build_client(
        tmp_path=tmp_path,
        monkeypatch=monkeypatch,
        persisted_videos=[
            Video(
                id="video-alpha",
                source_path=str(tmp_path / "videos" / "alpha.mp4"),
                display_name="alpha.mp4",
                frame_count=120,
                fps=24.0,
                width=200,
                height=100,
                duration_seconds=5.0,
            )
        ],
        persisted_annotations=[
            FrameAnnotation(
                id="annotation-001",
                video_id="video-alpha",
                frame_idx=12,
                object_id="object-7",
                created_at=_timestamp(),
                updated_at=_timestamp(),
                is_keyframe=True,
                source="sam2",
                box_x=0.05,
                box_y=0.2,
                box_w=0.25,
                box_h=0.5,
                mask_path="masks/video-alpha/object-7/frame_000012.png",
                mask_rle=None,
            )
        ],
    )

    with client:
        response = client.get("/api/videos/video-alpha/annotations/frame/12")

    assert response.status_code == 200
    assert response.json() == {
        "frame_idx": 12,
        "annotations": [
            {
                "object_id": "object-7",
                "source": "sam2",
                "box_xywh_norm": [0.05, 0.2, 0.25, 0.5],
                "mask": {
                    "path": "masks/video-alpha/object-7/frame_000012.png",
                },
            }
        ],
    }


def test_get_frame_annotation_mask_returns_persisted_png_bytes(
    tmp_path: Path,
    monkeypatch: MonkeyPatch,
) -> None:
    """Serve one persisted annotation mask through the API."""
    mask_file_path = tmp_path / "masks" / "video-alpha" / "object-7" / "frame_000012.png"
    mask_file_path.parent.mkdir(parents=True, exist_ok=True)
    mask_file_path.write_bytes(b"fake-mask-png")
    client = _build_client(
        tmp_path=tmp_path,
        monkeypatch=monkeypatch,
        persisted_videos=[
            Video(
                id="video-alpha",
                source_path=str(tmp_path / "videos" / "alpha.mp4"),
                display_name="alpha.mp4",
                frame_count=120,
                fps=24.0,
                width=200,
                height=100,
                duration_seconds=5.0,
            )
        ],
        persisted_annotations=[
            FrameAnnotation(
                id="annotation-001",
                video_id="video-alpha",
                frame_idx=12,
                object_id="object-7",
                created_at=_timestamp(),
                updated_at=_timestamp(),
                is_keyframe=True,
                source="sam2",
                box_x=0.05,
                box_y=0.2,
                box_w=0.25,
                box_h=0.5,
                mask_path="masks/video-alpha/object-7/frame_000012.png",
                mask_rle=None,
            )
        ],
    )

    with client:
        response = client.get("/api/videos/video-alpha/annotations/frame/12/object/object-7/mask")

    assert response.status_code == 200
    assert response.headers["content-type"] == "image/png"
    assert response.content == b"fake-mask-png"


def _timestamp() -> object:
    return datetime(2026, 4, 16, 9, 30, 0)


def _database_url_for(tmp_path: Path) -> str:
    return f"sqlite:///{tmp_path / 'frame-annotations-api.sqlite3'}"


def _build_client(
    *,
    tmp_path: Path,
    monkeypatch: MonkeyPatch,
    persisted_videos: list[Video],
    persisted_annotations: list[FrameAnnotation],
) -> TestClient:
    database_url = _database_url_for(tmp_path)
    source_dir = tmp_path / "indexed-videos"
    source_dir.mkdir(parents=True, exist_ok=True)
    monkeypatch.setenv("APP_DB_URL", database_url)
    monkeypatch.setenv("APP_MASKS_DIR", str(tmp_path / "masks"))
    monkeypatch.setattr("app.main.VIDEO_SOURCE_DIR", source_dir, raising=False)
    get_engine.cache_clear()
    get_session_factory.cache_clear()

    engine = create_engine(database_url)
    Base.metadata.create_all(engine)

    with Session(engine) as session:
        session.add_all([*persisted_videos, *persisted_annotations])
        session.commit()

    return TestClient(create_app())
