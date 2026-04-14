"""Tests for milestone-01 video catalog API routes."""

from pathlib import Path

from fastapi.testclient import TestClient
from pytest import MonkeyPatch
from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from app.db import Base, Video
from app.main import create_app


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


def _build_client(
    *,
    tmp_path: Path,
    monkeypatch: MonkeyPatch,
    persisted_videos: list[Video],
) -> TestClient:
    database_path = tmp_path / "video-api.sqlite3"
    database_url = f"sqlite:///{database_path}"
    monkeypatch.setenv("APP_DB_URL", database_url)

    engine = create_engine(database_url)
    Base.metadata.create_all(engine)

    with Session(engine) as session:
        session.add_all(persisted_videos)
        session.commit()

    return TestClient(create_app())
