"""Tests for milestone-03 SAM2 session lifecycle API routes."""

from pathlib import Path

from fastapi.testclient import TestClient
from pytest import MonkeyPatch
from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from app.db import Base, Sam2Session, Video
from app.db.session import get_engine, get_session_factory
from app.main import create_app


class FakeSam2Service:
    """Fake SAM2 adapter/service for API session lifecycle tests."""

    def __init__(self) -> None:
        """Initialize fake runtime/session tracking."""
        self._open_session_ids: set[str] = set()
        self.created_session_ids: list[str] = []
        self.closed_session_ids: list[str] = []

    def has_session(self, *, session_id: str) -> bool:
        """Return whether fake runtime state exists for one session id."""
        return session_id in self._open_session_ids

    def create_session(self, *, session_id: str, video_path: Path) -> None:
        """Record session creation against one local video path."""
        assert video_path.is_file()
        self._open_session_ids.add(session_id)
        self.created_session_ids.append(session_id)

    def close_session(self, *, session_id: str) -> None:
        """Record session closure."""
        self._open_session_ids.discard(session_id)
        self.closed_session_ids.append(session_id)


def test_create_sam2_session_creates_then_reuses_open_video_session(
    tmp_path: Path,
    monkeypatch: MonkeyPatch,
) -> None:
    """Create one session for local video, then reuse same open session."""
    video_path = tmp_path / "videos" / "alpha.mp4"
    video_path.parent.mkdir(parents=True, exist_ok=True)
    video_path.write_bytes(b"video")
    sam2_service = FakeSam2Service()
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
            )
        ],
        sam2_service=sam2_service,
    )

    with client:
        first_response = client.post("/api/videos/video-alpha/sam2/session")
        second_response = client.post("/api/videos/video-alpha/sam2/session")

    assert first_response.status_code == 200
    assert second_response.status_code == 200

    first_payload = first_response.json()
    second_payload = second_response.json()
    assert first_payload["reused"] is False
    assert second_payload["reused"] is True
    assert second_payload["session_id"] == first_payload["session_id"]
    assert sam2_service.created_session_ids == [first_payload["session_id"]]

    database_url = _database_url_for(tmp_path)
    with Session(get_engine(database_url=database_url)) as session:
        persisted_session = session.get(Sam2Session, first_payload["session_id"])

    assert persisted_session is not None
    assert persisted_session.video_id == "video-alpha"
    assert persisted_session.status == "open"
    assert persisted_session.closed_at is None
    assert persisted_session.last_used_at >= persisted_session.created_at


def test_create_sam2_session_rejects_missing_local_video_source_before_adapter(
    tmp_path: Path,
    monkeypatch: MonkeyPatch,
) -> None:
    """Reject create when indexed video source path no longer exists on disk."""
    sam2_service = FakeSam2Service()
    client = _build_client(
        tmp_path=tmp_path,
        monkeypatch=monkeypatch,
        persisted_videos=[
            Video(
                id="video-alpha",
                source_path=str(tmp_path / "videos" / "missing.mp4"),
                display_name="missing.mp4",
                frame_count=120,
                fps=24.0,
                width=1920,
                height=1080,
                duration_seconds=5.0,
            )
        ],
        sam2_service=sam2_service,
    )

    with client:
        response = client.post("/api/videos/video-alpha/sam2/session")

    assert response.status_code == 409
    assert response.json() == {"detail": "Indexed video source is not available"}
    assert sam2_service.created_session_ids == []


def test_close_sam2_session_marks_video_scoped_session_closed(
    tmp_path: Path,
    monkeypatch: MonkeyPatch,
) -> None:
    """Close one existing session that belongs to requested video."""
    video_path = tmp_path / "videos" / "alpha.mp4"
    video_path.parent.mkdir(parents=True, exist_ok=True)
    video_path.write_bytes(b"video")
    sam2_service = FakeSam2Service()
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
            )
        ],
        sam2_service=sam2_service,
    )

    with client:
        create_response = client.post("/api/videos/video-alpha/sam2/session")
        response = client.delete(
            f"/api/videos/video-alpha/sam2/session/{create_response.json()['session_id']}"
        )

    assert create_response.status_code == 200
    assert response.status_code == 204
    assert sam2_service.closed_session_ids == [create_response.json()["session_id"]]

    database_url = _database_url_for(tmp_path)
    with Session(get_engine(database_url=database_url)) as session:
        persisted_session = session.get(Sam2Session, create_response.json()["session_id"])

    assert persisted_session is not None
    assert persisted_session.status == "closed"
    assert persisted_session.closed_at is not None


def _database_url_for(tmp_path: Path) -> str:
    return f"sqlite:///{tmp_path / 'sam2-session-api.sqlite3'}"


def _build_client(
    *,
    tmp_path: Path,
    monkeypatch: MonkeyPatch,
    persisted_videos: list[Video],
    sam2_service: FakeSam2Service,
) -> TestClient:
    database_url = _database_url_for(tmp_path)
    source_dir = tmp_path / "indexed-videos"
    source_dir.mkdir(parents=True, exist_ok=True)
    monkeypatch.setenv("APP_DB_URL", database_url)
    monkeypatch.setattr("app.main.VIDEO_SOURCE_DIR", source_dir, raising=False)
    monkeypatch.setattr("app.api.videos.get_sam2_service", lambda: sam2_service, raising=False)
    get_engine.cache_clear()
    get_session_factory.cache_clear()

    engine = create_engine(database_url)
    Base.metadata.create_all(engine)

    with Session(engine) as session:
        session.add_all(persisted_videos)
        session.commit()

    return TestClient(create_app())
