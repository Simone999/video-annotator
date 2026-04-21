"""Backend API integration tests for ingest and exact-frame review."""

import subprocess
from collections.abc import Callable
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

import app.main as main_module
import app.services.video_frames as video_frames_module
from app.db.session import get_engine, get_session_factory
from app.services.video_metadata import VideoMetadata

type VideoInspector = Callable[[Path], VideoMetadata]


def test_startup_indexes_videos_and_lists_them_in_deterministic_order(
    monkeypatch: pytest.MonkeyPatch,
    tmp_path: Path,
) -> None:
    """Index local videos on startup and keep discovery stable across restarts."""
    database_path = tmp_path / "video-index.sqlite3"
    source_dir = tmp_path / "videos"
    nested_dir = source_dir / "nested"
    nested_dir.mkdir(parents=True)
    _write_video_stub(source_dir / "street_scene_014.mp4")
    _write_video_stub(nested_dir / "warehouse_cam_001.mp4")

    inspector = _build_video_inspector(
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
    )

    _configure_backend_for_test(
        monkeypatch=monkeypatch,
        database_path=database_path,
        source_dir=source_dir,
        inspect_video=inspector,
    )

    try:
        with TestClient(main_module.create_app()) as first_client:
            first_response = first_client.get("/api/videos")

        with TestClient(main_module.create_app()) as second_client:
            second_response = second_client.get("/api/videos")
    finally:
        _clear_database_caches()

    assert first_response.status_code == 200
    assert second_response.status_code == 200

    first_payload = first_response.json()
    second_payload = second_response.json()

    assert first_payload == second_payload
    expected_source_paths = sorted(
        [
            str(source_dir / "street_scene_014.mp4"),
            str(nested_dir / "warehouse_cam_001.mp4"),
        ]
    )
    assert [video["source_path"] for video in first_payload] == expected_source_paths
    assert [video["display_name"] for video in first_payload] == [
        Path(path).name for path in expected_source_paths
    ]
    assert len({video["id"] for video in first_payload}) == 2


def test_exact_frame_route_returns_png_and_rejects_out_of_range_frame(
    monkeypatch: pytest.MonkeyPatch,
    tmp_path: Path,
) -> None:
    """Return backend-decoded PNG bytes and reject invalid canonical frame ids."""
    database_path = tmp_path / "video-frames.sqlite3"
    source_dir = tmp_path / "videos"
    source_dir.mkdir()
    _write_video_stub(source_dir / "street_scene_014.mp4")

    inspector = _build_video_inspector(
        {
            "street_scene_014.mp4": VideoMetadata(
                frame_count=240,
                fps=24.0,
                width=1920,
                height=1080,
                duration_seconds=10.0,
            )
        }
    )

    _configure_backend_for_test(
        monkeypatch=monkeypatch,
        database_path=database_path,
        source_dir=source_dir,
        inspect_video=inspector,
    )
    decode_calls: list[list[str]] = []

    def fake_subprocess_run(
        command: list[str],
        *,
        check: bool,
        capture_output: bool,
    ) -> subprocess.CompletedProcess[bytes]:
        """Capture ffmpeg arguments and return stable PNG bytes."""
        del check, capture_output
        decode_calls.append(command)
        return subprocess.CompletedProcess(
            args=command,
            returncode=0,
            stdout=b"png-frame-bytes",
            stderr=b"",
        )

    monkeypatch.setattr(video_frames_module.subprocess, "run", fake_subprocess_run)

    try:
        with TestClient(main_module.create_app()) as client:
            video_response = client.get("/api/videos")
            video_id = video_response.json()[0]["id"]

            frame_response = client.get(f"/api/videos/{video_id}/frame/7")
            invalid_frame_response = client.get(f"/api/videos/{video_id}/frame/240")
    finally:
        _clear_database_caches()

    assert video_response.status_code == 200
    assert frame_response.status_code == 200
    assert frame_response.content == b"png-frame-bytes"
    assert frame_response.headers["content-type"] == "image/png"
    assert decode_calls == [
        [
            "ffmpeg",
            "-v",
            "error",
            "-i",
            str(source_dir / "street_scene_014.mp4"),
            "-vf",
            "select=eq(n\\,7)",
            "-frames:v",
            "1",
            "-f",
            "image2pipe",
            "-vcodec",
            "png",
            "pipe:1",
        ]
    ]

    assert invalid_frame_response.status_code == 400
    assert invalid_frame_response.json() == {"detail": "Frame index must be between 0 and 239"}


def _configure_backend_for_test(
    *,
    monkeypatch: pytest.MonkeyPatch,
    database_path: Path,
    source_dir: Path,
    inspect_video: VideoInspector,
) -> None:
    """Point cached backend globals at temp storage for one integration test."""
    monkeypatch.setenv("APP_DB_URL", f"sqlite:///{database_path}")
    monkeypatch.setattr(main_module, "VIDEO_SOURCE_DIR", source_dir)
    monkeypatch.setattr(main_module, "extract_video_metadata", inspect_video)
    _clear_database_caches()


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
