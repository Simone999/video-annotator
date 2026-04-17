"""Tests for video catalog and manifest API routes."""

from pathlib import Path
from types import SimpleNamespace

from fastapi.testclient import TestClient
from pytest import MonkeyPatch
from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from app.db import Base, FrameAnnotation, ObjectTrack, Video
from app.db.session import get_engine, get_session_factory
from app.main import create_app
from app.services.video_indexing import VideoMetadata


def test_list_videos_returns_indexed_video_metadata(
    tmp_path: Path,
    monkeypatch: MonkeyPatch,
) -> None:
    """Return indexed videos with milestone-01 payload fields."""
    client = _build_client(
        tmp_path=tmp_path,
        monkeypatch=monkeypatch,
        persisted_videos=[
            Video(
                id="video-alpha",
                source_path="/tmp/videos/alpha.mp4",
                display_name="alpha.mp4",
                frame_count=120,
                fps=24.0,
                width=1920,
                height=1080,
                duration_seconds=5.0,
            ),
            Video(
                id="video-beta",
                source_path="/tmp/videos/nested/beta.mov",
                display_name="beta.mov",
                frame_count=240,
                fps=30.0,
                width=1280,
                height=720,
                duration_seconds=None,
            ),
        ],
    )

    with client:
        response = client.get("/api/videos")

    assert response.status_code == 200
    assert response.json() == [
        {
            "id": "video-alpha",
            "source_path": "/tmp/videos/alpha.mp4",
            "display_name": "alpha.mp4",
            "frame_count": 120,
            "fps": 24.0,
            "width": 1920,
            "height": 1080,
            "duration_seconds": 5.0,
        },
        {
            "id": "video-beta",
            "source_path": "/tmp/videos/nested/beta.mov",
            "display_name": "beta.mov",
            "frame_count": 240,
            "fps": 30.0,
            "width": 1280,
            "height": 720,
            "duration_seconds": None,
        },
    ]


def test_get_video_returns_indexed_video_metadata(
    tmp_path: Path,
    monkeypatch: MonkeyPatch,
) -> None:
    """Return one indexed video by stable backend identifier."""
    client = _build_client(
        tmp_path=tmp_path,
        monkeypatch=monkeypatch,
        persisted_videos=[
            Video(
                id="video-alpha",
                source_path="/tmp/videos/alpha.mp4",
                display_name="alpha.mp4",
                frame_count=120,
                fps=24.0,
                width=1920,
                height=1080,
                duration_seconds=5.0,
            ),
        ],
    )

    with client:
        response = client.get("/api/videos/video-alpha")

    assert response.status_code == 200
    assert response.json() == {
        "id": "video-alpha",
        "source_path": "/tmp/videos/alpha.mp4",
        "display_name": "alpha.mp4",
        "frame_count": 120,
        "fps": 24.0,
        "width": 1920,
        "height": 1080,
        "duration_seconds": 5.0,
    }


def test_get_video_returns_404_for_unknown_id(
    tmp_path: Path,
    monkeypatch: MonkeyPatch,
) -> None:
    """Return a client error when the requested video id is unknown."""
    client = _build_client(
        tmp_path=tmp_path,
        monkeypatch=monkeypatch,
        persisted_videos=[],
    )

    with client:
        response = client.get("/api/videos/video-missing")

    assert response.status_code == 404
    assert response.json() == {"detail": "Indexed video not found"}


def test_get_video_manifest_returns_empty_summary_for_video_without_annotations(
    tmp_path: Path,
    monkeypatch: MonkeyPatch,
) -> None:
    """Return empty manifest summary when a video has no objects or frame annotations."""
    client = _build_client(
        tmp_path=tmp_path,
        monkeypatch=monkeypatch,
        persisted_videos=[
            Video(
                id="video-alpha",
                source_path="/tmp/videos/alpha.mp4",
                display_name="alpha.mp4",
                frame_count=120,
                fps=24.0,
                width=1920,
                height=1080,
                duration_seconds=5.0,
            ),
        ],
    )

    with client:
        response = client.get("/api/videos/video-alpha/manifest")

    assert response.status_code == 200
    assert response.json() == {
        "video": {
            "id": "video-alpha",
            "frame_count": 120,
            "fps": 24.0,
            "width": 1920,
            "height": 1080,
            "duration_seconds": 5.0,
        },
        "objects": [],
        "annotated_frames": [],
        "keyframes": [],
    }


def test_get_video_manifest_returns_object_and_frame_summary(
    tmp_path: Path,
    monkeypatch: MonkeyPatch,
) -> None:
    """Return stable object ids plus annotated and keyframe indices for one video."""
    client = _build_client(
        tmp_path=tmp_path,
        monkeypatch=monkeypatch,
        persisted_videos=[
            Video(
                id="video-alpha",
                source_path="/tmp/videos/alpha.mp4",
                display_name="alpha.mp4",
                frame_count=120,
                fps=24.0,
                width=1920,
                height=1080,
                duration_seconds=5.0,
            ),
            Video(
                id="video-beta",
                source_path="/tmp/videos/beta.mp4",
                display_name="beta.mp4",
                frame_count=90,
                fps=30.0,
                width=1280,
                height=720,
                duration_seconds=3.0,
            ),
        ],
        persisted_object_tracks=[
            ObjectTrack(
                id="object-001",
                video_id="video-alpha",
                label="left hand",
                color="#00ffaa",
                status="active",
            ),
            ObjectTrack(
                id="object-002",
                video_id="video-alpha",
                label="right hand",
                color="#ff0055",
                status="hidden",
            ),
            ObjectTrack(
                id="object-003",
                video_id="video-beta",
                label="ignore other video",
                color="#000000",
                status="active",
            ),
        ],
        persisted_frame_annotations=[
            FrameAnnotation(
                id="ann-001",
                video_id="video-alpha",
                frame_idx=8,
                object_id="object-001",
                is_keyframe=True,
                source="manual",
                box_x=0.1,
                box_y=0.2,
                box_w=0.3,
                box_h=0.4,
                mask_path=None,
                mask_rle=None,
            ),
            FrameAnnotation(
                id="ann-002",
                video_id="video-alpha",
                frame_idx=12,
                object_id="object-001",
                is_keyframe=False,
                source="sam2",
                box_x=0.2,
                box_y=0.3,
                box_w=0.2,
                box_h=0.1,
                mask_path="masks/video-alpha/object-001/frame_000012.png",
                mask_rle=None,
            ),
            FrameAnnotation(
                id="ann-003",
                video_id="video-alpha",
                frame_idx=12,
                object_id="object-002",
                is_keyframe=True,
                source="manual",
                box_x=0.5,
                box_y=0.6,
                box_w=0.1,
                box_h=0.2,
                mask_path=None,
                mask_rle=None,
            ),
            FrameAnnotation(
                id="ann-004",
                video_id="video-beta",
                frame_idx=4,
                object_id="object-003",
                is_keyframe=True,
                source="manual",
                box_x=0.1,
                box_y=0.1,
                box_w=0.1,
                box_h=0.1,
                mask_path=None,
                mask_rle=None,
            ),
        ],
    )

    with client:
        response = client.get("/api/videos/video-alpha/manifest")

    assert response.status_code == 200
    assert response.json() == {
        "video": {
            "id": "video-alpha",
            "frame_count": 120,
            "fps": 24.0,
            "width": 1920,
            "height": 1080,
            "duration_seconds": 5.0,
        },
        "objects": [
            {
                "id": "object-001",
                "label": "left hand",
                "color": "#00ffaa",
                "status": "active",
            },
            {
                "id": "object-002",
                "label": "right hand",
                "color": "#ff0055",
                "status": "hidden",
            },
        ],
        "annotated_frames": [8, 12],
        "keyframes": [8, 12],
    }


def test_create_object_track_persists_stable_object_for_video(
    tmp_path: Path,
    monkeypatch: MonkeyPatch,
) -> None:
    """Create one stable object-track row for a persisted video."""
    client = _build_client(
        tmp_path=tmp_path,
        monkeypatch=monkeypatch,
        persisted_videos=[
            Video(
                id="video-alpha",
                source_path="/tmp/videos/alpha.mp4",
                display_name="alpha.mp4",
                frame_count=120,
                fps=24.0,
                width=1920,
                height=1080,
                duration_seconds=5.0,
            ),
        ],
    )

    with client:
        response = client.post(
            "/api/videos/video-alpha/objects",
            json={"label": "left hand"},
        )

    assert response.status_code == 201
    payload = response.json()
    assert payload == {
        "id": payload["id"],
        "label": "left hand",
        "color": "#00ffaa",
        "status": "active",
    }
    assert payload["id"].startswith("object-")

    engine = create_engine(f"sqlite:///{tmp_path / 'video-api.sqlite3'}")
    with Session(engine) as session:
        persisted_object_track = session.get(ObjectTrack, payload["id"])

    assert persisted_object_track is not None
    assert persisted_object_track.video_id == "video-alpha"
    assert persisted_object_track.label == "left hand"
    assert persisted_object_track.color == "#00ffaa"
    assert persisted_object_track.status == "active"


def test_create_object_track_returns_404_for_unknown_video(
    tmp_path: Path,
    monkeypatch: MonkeyPatch,
) -> None:
    """Reject object creation when the requested video id is unknown."""
    client = _build_client(
        tmp_path=tmp_path,
        monkeypatch=monkeypatch,
        persisted_videos=[],
    )

    with client:
        response = client.post(
            "/api/videos/video-missing/objects",
            json={"label": "left hand"},
        )

    assert response.status_code == 404
    assert response.json() == {"detail": "Indexed video not found"}


def test_put_manual_frame_annotation_persists_update_reload_and_delete(
    tmp_path: Path,
    monkeypatch: MonkeyPatch,
) -> None:
    """Create, update, reload, and delete one manual annotation on one frame."""
    client = _build_client(
        tmp_path=tmp_path,
        monkeypatch=monkeypatch,
        persisted_videos=[
            Video(
                id="video-alpha",
                source_path="/tmp/videos/alpha.mp4",
                display_name="alpha.mp4",
                frame_count=120,
                fps=24.0,
                width=1920,
                height=1080,
                duration_seconds=5.0,
            ),
        ],
        persisted_object_tracks=[
            ObjectTrack(
                id="object-001",
                video_id="video-alpha",
                label="left hand",
                color="#00ffaa",
                status="active",
            ),
        ],
    )

    with client:
        create_response = client.put(
            "/api/videos/video-alpha/annotations/frame/8",
            json={
                "object_id": "object-001",
                "is_keyframe": True,
                "box_xywh_norm": [0.1, 0.2, 0.3, 0.4],
            },
        )
        update_response = client.put(
            "/api/videos/video-alpha/annotations/frame/8",
            json={
                "object_id": "object-001",
                "is_keyframe": False,
                "box_xywh_norm": [0.25, 0.35, 0.15, 0.2],
            },
        )

    assert create_response.status_code == 200
    assert create_response.json() == {
        "video_id": "video-alpha",
        "frame_idx": 8,
        "object_id": "object-001",
        "is_keyframe": True,
        "source": "manual",
        "box_xywh_norm": [0.1, 0.2, 0.3, 0.4],
        "mask": {"path": None},
    }
    assert update_response.status_code == 200
    assert update_response.json() == {
        "video_id": "video-alpha",
        "frame_idx": 8,
        "object_id": "object-001",
        "is_keyframe": False,
        "source": "manual",
        "box_xywh_norm": [0.25, 0.35, 0.15, 0.2],
        "mask": {"path": None},
    }

    engine = create_engine(f"sqlite:///{tmp_path / 'video-api.sqlite3'}")
    with Session(engine) as session:
        reloaded_annotation = (
            session.query(FrameAnnotation)
            .filter_by(video_id="video-alpha", frame_idx=8, object_id="object-001")
            .one_or_none()
        )

    assert reloaded_annotation is not None
    assert reloaded_annotation.is_keyframe is False
    assert reloaded_annotation.source == "manual"
    assert reloaded_annotation.box_x == 0.25
    assert reloaded_annotation.box_y == 0.35
    assert reloaded_annotation.box_w == 0.15
    assert reloaded_annotation.box_h == 0.2
    assert reloaded_annotation.mask_path is None
    assert reloaded_annotation.mask_rle is None

    with client:
        delete_response = client.delete(
            "/api/videos/video-alpha/annotations/frame/8/object/object-001"
        )

    assert delete_response.status_code == 204
    assert delete_response.content == b""

    with Session(engine) as session:
        deleted_annotation = (
            session.query(FrameAnnotation)
            .filter_by(video_id="video-alpha", frame_idx=8, object_id="object-001")
            .one_or_none()
        )

    assert deleted_annotation is None


def test_get_video_frame_annotations_includes_manual_boxes_without_masks(
    tmp_path: Path,
    monkeypatch: MonkeyPatch,
) -> None:
    """Return persisted manual boxes on frame reads even when no mask exists."""
    client = _build_client(
        tmp_path=tmp_path,
        monkeypatch=monkeypatch,
        persisted_videos=[
            Video(
                id="video-alpha",
                source_path="/tmp/videos/alpha.mp4",
                display_name="alpha.mp4",
                frame_count=120,
                fps=24.0,
                width=1920,
                height=1080,
                duration_seconds=5.0,
            ),
        ],
        persisted_frame_annotations=[
            FrameAnnotation(
                id="ann-001",
                video_id="video-alpha",
                frame_idx=8,
                object_id="object-001",
                is_keyframe=True,
                source="manual",
                box_x=0.1,
                box_y=0.2,
                box_w=0.3,
                box_h=0.4,
                mask_path=None,
                mask_rle=None,
            ),
            FrameAnnotation(
                id="ann-002",
                video_id="video-alpha",
                frame_idx=8,
                object_id="object-002",
                is_keyframe=False,
                source="sam2",
                box_x=0.25,
                box_y=0.35,
                box_w=0.15,
                box_h=0.2,
                mask_path="masks/video-alpha/object-002/frame_000008.png",
                mask_rle=None,
            ),
        ],
    )

    with client:
        response = client.get("/api/videos/video-alpha/annotations/frame/8")

    assert response.status_code == 200
    assert response.json() == {
        "frame_idx": 8,
        "annotations": [
            {
                "object_id": "object-001",
                "source": "manual",
                "box_xywh_norm": [0.1, 0.2, 0.3, 0.4],
                "mask": None,
            },
            {
                "object_id": "object-002",
                "source": "sam2",
                "box_xywh_norm": [0.25, 0.35, 0.15, 0.2],
                "mask": {
                    "path": "masks/video-alpha/object-002/frame_000008.png",
                },
            },
        ],
    }


def test_put_manual_frame_annotation_returns_404_for_unknown_video(
    tmp_path: Path,
    monkeypatch: MonkeyPatch,
) -> None:
    """Reject manual annotation writes when selected video is unknown."""
    client = _build_client(
        tmp_path=tmp_path,
        monkeypatch=monkeypatch,
        persisted_videos=[],
    )

    with client:
        response = client.put(
            "/api/videos/video-missing/annotations/frame/8",
            json={
                "object_id": "object-001",
                "is_keyframe": True,
                "box_xywh_norm": [0.1, 0.2, 0.3, 0.4],
            },
        )

    assert response.status_code == 404
    assert response.json() == {"detail": "Indexed video not found"}


def test_get_video_source_returns_local_video_bytes(
    tmp_path: Path,
    monkeypatch: MonkeyPatch,
) -> None:
    """Return browser-playable bytes for one indexed local source video."""
    video_path = tmp_path / "alpha.mp4"
    video_path.write_bytes(b"video-bytes")
    client = _build_client(
        tmp_path=tmp_path,
        monkeypatch=monkeypatch,
        persisted_videos=[
            Video(
                id="video-alpha",
                source_path=str(video_path),
                display_name="alpha.mp4",
                frame_count=120,
                fps=24.0,
                width=1920,
                height=1080,
                duration_seconds=5.0,
            ),
        ],
    )

    with client:
        response = client.get("/api/videos/video-alpha/source")

    assert response.status_code == 200
    assert response.headers["content-type"] == "video/mp4"
    assert response.content == b"video-bytes"


def test_startup_indexes_discovered_local_video_into_video_list(
    tmp_path: Path,
    monkeypatch: MonkeyPatch,
) -> None:
    """Index configured local videos during app startup before list requests."""
    source_dir = tmp_path / "videos"
    indexed_video_path = source_dir / "nested" / "alpha.mp4"
    indexed_video_path.parent.mkdir(parents=True)
    indexed_video_path.write_bytes(b"video")

    monkeypatch.setattr(
        "app.main.extract_video_metadata",
        lambda _: VideoMetadata(
            frame_count=120,
            fps=24.0,
            width=1920,
            height=1080,
            duration_seconds=5.0,
        ),
        raising=False,
    )
    client = _build_client(
        tmp_path=tmp_path,
        monkeypatch=monkeypatch,
        persisted_videos=[],
        source_dir=source_dir,
    )

    with client:
        response = client.get("/api/videos")

    payload = response.json()
    assert response.status_code == 200
    assert payload == [
        {
            "id": payload[0]["id"],
            "source_path": str(indexed_video_path.resolve()),
            "display_name": "alpha.mp4",
            "frame_count": 120,
            "fps": 24.0,
            "width": 1920,
            "height": 1080,
            "duration_seconds": 5.0,
        }
    ]
    assert payload[0]["id"].startswith("video-")


def test_get_video_frame_returns_exact_png_bytes(
    tmp_path: Path,
    monkeypatch: MonkeyPatch,
) -> None:
    """Return backend-decoded frame bytes for a valid canonical frame index."""

    def fake_load_exact_video_frame(*, session: Session, video_id: str, frame_idx: int) -> object:
        del session
        assert video_id == "video-alpha"
        assert frame_idx == 3
        return SimpleNamespace(content=b"frame-3", media_type="image/png")

    monkeypatch.setattr(
        "app.api.videos.load_exact_video_frame",
        fake_load_exact_video_frame,
        raising=False,
    )
    client = _build_client(
        tmp_path=tmp_path,
        monkeypatch=monkeypatch,
        persisted_videos=[
            Video(
                id="video-alpha",
                source_path="/tmp/videos/alpha.mp4",
                display_name="alpha.mp4",
                frame_count=120,
                fps=24.0,
                width=1920,
                height=1080,
                duration_seconds=5.0,
            ),
        ],
    )

    with client:
        response = client.get("/api/videos/video-alpha/frame/3")

    assert response.status_code == 200
    assert response.headers["content-type"] == "image/png"
    assert response.content == b"frame-3"


def test_get_video_frame_returns_404_for_unknown_video(
    tmp_path: Path,
    monkeypatch: MonkeyPatch,
) -> None:
    """Return 404 when exact-frame request references unknown indexed video."""
    client = _build_client(
        tmp_path=tmp_path,
        monkeypatch=monkeypatch,
        persisted_videos=[],
    )

    with client:
        response = client.get("/api/videos/video-missing/frame/3")

    assert response.status_code == 404
    assert response.json() == {"detail": "Indexed video not found"}


def test_get_video_frame_returns_400_for_out_of_range_index(
    tmp_path: Path,
    monkeypatch: MonkeyPatch,
) -> None:
    """Reject negative and too-large canonical frame indices."""
    client = _build_client(
        tmp_path=tmp_path,
        monkeypatch=monkeypatch,
        persisted_videos=[
            Video(
                id="video-alpha",
                source_path="/tmp/videos/alpha.mp4",
                display_name="alpha.mp4",
                frame_count=120,
                fps=24.0,
                width=1920,
                height=1080,
                duration_seconds=5.0,
            ),
        ],
    )

    with client:
        negative_response = client.get("/api/videos/video-alpha/frame/-1")
        too_large_response = client.get("/api/videos/video-alpha/frame/120")

    assert negative_response.status_code == 400
    assert negative_response.json() == {"detail": "Frame index must be between 0 and 119"}
    assert too_large_response.status_code == 400
    assert too_large_response.json() == {"detail": "Frame index must be between 0 and 119"}


def test_get_video_frame_returns_stable_bytes_for_repeated_requests(
    tmp_path: Path,
    monkeypatch: MonkeyPatch,
) -> None:
    """Return stable exact-frame content for repeated canonical requests."""

    def fake_load_exact_video_frame(*, session: Session, video_id: str, frame_idx: int) -> object:
        del session
        return SimpleNamespace(
            content=f"{video_id}:{frame_idx}".encode(),
            media_type="image/png",
        )

    monkeypatch.setattr(
        "app.api.videos.load_exact_video_frame",
        fake_load_exact_video_frame,
        raising=False,
    )
    client = _build_client(
        tmp_path=tmp_path,
        monkeypatch=monkeypatch,
        persisted_videos=[
            Video(
                id="video-alpha",
                source_path="/tmp/videos/alpha.mp4",
                display_name="alpha.mp4",
                frame_count=120,
                fps=24.0,
                width=1920,
                height=1080,
                duration_seconds=5.0,
            ),
        ],
    )

    with client:
        first_response = client.get("/api/videos/video-alpha/frame/8")
        second_response = client.get("/api/videos/video-alpha/frame/8")

    assert first_response.status_code == 200
    assert second_response.status_code == 200
    assert first_response.headers["content-type"] == "image/png"
    assert second_response.headers["content-type"] == "image/png"
    assert first_response.content == b"video-alpha:8"
    assert second_response.content == b"video-alpha:8"
    assert second_response.content == first_response.content


def _build_client(
    *,
    tmp_path: Path,
    monkeypatch: MonkeyPatch,
    persisted_videos: list[Video],
    persisted_object_tracks: list[ObjectTrack] | None = None,
    persisted_frame_annotations: list[FrameAnnotation] | None = None,
    source_dir: Path | None = None,
) -> TestClient:
    database_path = tmp_path / "video-api.sqlite3"
    database_url = f"sqlite:///{database_path}"
    resolved_source_dir = source_dir or (tmp_path / "videos")
    resolved_source_dir.mkdir(parents=True, exist_ok=True)
    monkeypatch.setenv("APP_DB_URL", database_url)
    monkeypatch.setattr("app.main.VIDEO_SOURCE_DIR", resolved_source_dir, raising=False)
    get_engine.cache_clear()
    get_session_factory.cache_clear()

    engine = create_engine(database_url)
    Base.metadata.create_all(engine)

    with Session(engine) as session:
        session.add_all(persisted_videos)
        session.add_all(persisted_object_tracks or [])
        session.add_all(persisted_frame_annotations or [])
        session.commit()

    return TestClient(create_app())
