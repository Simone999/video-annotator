"""Tests for milestone-03 SAM2 prompt-box API route."""

from pathlib import Path

from fastapi.testclient import TestClient
from pytest import MonkeyPatch
from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session

from app.db import Base, FrameAnnotation, Sam2Session, Video
from app.db.session import get_engine, get_session_factory
from app.main import create_app
from app.services import Sam2PromptResult


class FakeSam2Service:
    """Fake SAM2 adapter/service for prompt-box API tests."""

    def __init__(self) -> None:
        """Initialize recorded prompt requests."""
        self.prompt_requests: list[dict[str, object]] = []

    def prompt_box(
        self,
        *,
        session_id: str,
        frame_idx: int,
        object_id: str,
        box_xyxy_px: tuple[int, int, int, int],
    ) -> Sam2PromptResult:
        """Record prompt request and return fake PNG bytes."""
        self.prompt_requests.append(
            {
                "session_id": session_id,
                "frame_idx": frame_idx,
                "object_id": object_id,
                "box_xyxy_px": box_xyxy_px,
            }
        )
        return Sam2PromptResult(mask_png_bytes=b"fake-png-mask")


def test_prompt_box_persists_same_frame_annotation_and_mask_file(
    tmp_path: Path,
    monkeypatch: MonkeyPatch,
) -> None:
    """Run prompt-box on one frame and persist mask-backed annotation metadata."""
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
                width=200,
                height=100,
                duration_seconds=5.0,
            )
        ],
        persisted_sessions=[
            Sam2Session(
                id="sam2-session-001",
                video_id="video-alpha",
                status="open",
                created_at=_timestamp(),
                last_used_at=_timestamp(),
                closed_at=None,
            )
        ],
        sam2_service=sam2_service,
    )

    with client:
        response = client.post(
            "/api/videos/video-alpha/sam2/prompt-box",
            json={
                "session_id": "sam2-session-001",
                "frame_idx": 12,
                "object_id": "object-7",
                "box_xyxy_px": [10, 20, 60, 70],
            },
        )

    assert response.status_code == 200
    assert response.json() == {
        "frame_idx": 12,
        "annotation": {
            "object_id": "object-7",
            "source": "sam2",
            "box_xywh_norm": [0.05, 0.2, 0.25, 0.5],
            "mask": {
                "path": "masks/video-alpha/object-7/frame_000012.png",
            },
        },
    }
    assert sam2_service.prompt_requests == [
        {
            "session_id": "sam2-session-001",
            "frame_idx": 12,
            "object_id": "object-7",
            "box_xyxy_px": (10, 20, 60, 70),
        }
    ]

    database_url = _database_url_for(tmp_path)
    with Session(get_engine(database_url=database_url)) as session:
        persisted_annotation = session.scalar(
            select(FrameAnnotation).filter_by(
                video_id="video-alpha",
                frame_idx=12,
                object_id="object-7",
            )
        )

    assert persisted_annotation is not None
    assert persisted_annotation.source == "sam2"
    assert persisted_annotation.is_keyframe is True
    assert persisted_annotation.box_x == 0.05
    assert persisted_annotation.box_y == 0.2
    assert persisted_annotation.box_w == 0.25
    assert persisted_annotation.box_h == 0.5
    assert persisted_annotation.mask_path == "masks/video-alpha/object-7/frame_000012.png"
    mask_file_path = tmp_path / "masks" / "video-alpha" / "object-7" / "frame_000012.png"
    assert mask_file_path.read_bytes() == b"fake-png-mask"


def _timestamp() -> object:
    from datetime import datetime

    return datetime(2026, 4, 16, 9, 30, 0)


def _database_url_for(tmp_path: Path) -> str:
    return f"sqlite:///{tmp_path / 'sam2-prompt-box-api.sqlite3'}"


def _build_client(
    *,
    tmp_path: Path,
    monkeypatch: MonkeyPatch,
    persisted_videos: list[Video],
    persisted_sessions: list[Sam2Session],
    sam2_service: FakeSam2Service,
) -> TestClient:
    database_url = _database_url_for(tmp_path)
    source_dir = tmp_path / "indexed-videos"
    source_dir.mkdir(parents=True, exist_ok=True)
    monkeypatch.setenv("APP_DB_URL", database_url)
    monkeypatch.setenv("APP_MASKS_DIR", str(tmp_path / "masks"))
    monkeypatch.setattr("app.main.VIDEO_SOURCE_DIR", source_dir, raising=False)
    monkeypatch.setattr("app.api.videos.get_sam2_service", lambda: sam2_service, raising=False)
    get_engine.cache_clear()
    get_session_factory.cache_clear()

    engine = create_engine(database_url)
    Base.metadata.create_all(engine)

    with Session(engine) as session:
        session.add_all([*persisted_videos, *persisted_sessions])
        session.commit()

    return TestClient(create_app())
