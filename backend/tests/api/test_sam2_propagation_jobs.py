"""Tests for milestone-03 SAM2 propagation job API routes."""

import time
from datetime import datetime
from pathlib import Path
from threading import Event

from fastapi.testclient import TestClient
from pytest import MonkeyPatch
from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session

from app.db import Base, FrameAnnotation, Job, Sam2Session, Video
from app.db.session import get_engine, get_session_factory
from app.main import create_app
from app.services import Sam2PropagationFrameResult, Sam2PropagationMaskResult


class FakeSam2Service:
    """Fake SAM2 adapter/service for propagation job API tests."""

    def __init__(self) -> None:
        """Initialize propagation fixtures and synchronization hooks."""
        self.propagate_requests: list[dict[str, object]] = []
        self._release_events: dict[int, Event] = {}
        self.propagation_started = Event()

    def propagate(
        self,
        *,
        session_id: str,
        start_frame_idx: int,
        end_frame_idx: int | None,
        direction: str,
        object_ids: tuple[str, ...],
    ) -> object:
        """Yield fake frame masks after test-controlled release events."""
        self.propagate_requests.append(
            {
                "session_id": session_id,
                "start_frame_idx": start_frame_idx,
                "end_frame_idx": end_frame_idx,
                "direction": direction,
                "object_ids": object_ids,
            }
        )
        self.propagation_started.set()
        for frame_idx in (13, 14):
            event = self._release_events.setdefault(frame_idx, Event())
            event.wait(timeout=5)
            yield Sam2PropagationFrameResult(
                frame_idx=frame_idx,
                object_results=(
                    Sam2PropagationMaskResult(
                        object_id="object-7",
                        mask_png_bytes=f"mask-{frame_idx}".encode(),
                    ),
                ),
            )

    def release_frame(self, frame_idx: int) -> None:
        """Allow one queued frame result to reach the worker."""
        self._release_events.setdefault(frame_idx, Event()).set()


def test_propagation_job_persists_masks_and_completes(
    tmp_path: Path,
    monkeypatch: MonkeyPatch,
) -> None:
    """Run one propagation job to completion and persist frame annotations."""
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
        create_response = client.post(
            "/api/videos/video-alpha/sam2/propagate",
            json={
                "session_id": "sam2-session-001",
                "start_frame_idx": 12,
                "end_frame_idx": 14,
                "direction": "forward",
                "object_ids": ["object-7"],
            },
        )

        assert create_response.status_code == 202
        create_payload = create_response.json()
        assert create_payload == {
            "job_id": create_payload["job_id"],
            "status": "queued",
            "progress_current": 0,
            "progress_total": 2,
        }
        assert sam2_service.propagation_started.wait(timeout=5)

        sam2_service.release_frame(13)
        sam2_service.release_frame(14)

        job_payload = _wait_for_job_status(
            client=client,
            job_id=create_payload["job_id"],
            expected_status="completed",
        )

    assert sam2_service.propagate_requests == [
        {
            "session_id": "sam2-session-001",
            "start_frame_idx": 12,
            "end_frame_idx": 14,
            "direction": "forward",
            "object_ids": ("object-7",),
        }
    ]
    assert job_payload == {
        "job_id": create_payload["job_id"],
        "type": "sam2_propagation",
        "status": "completed",
        "progress_current": 2,
        "progress_total": 2,
        "result": {
            "object_ids": ["object-7"],
            "persisted_frame_count": 2,
            "persisted_frame_indices": [13, 14],
        },
        "error_message": None,
    }

    database_url = _database_url_for(tmp_path)
    with Session(get_engine(database_url=database_url)) as session:
        persisted_job = session.get(Job, create_payload["job_id"])
        persisted_annotations = session.scalars(
            select(FrameAnnotation)
            .where(
                FrameAnnotation.video_id == "video-alpha",
                FrameAnnotation.object_id == "object-7",
            )
            .order_by(FrameAnnotation.frame_idx.asc())
        ).all()

    assert persisted_job is not None
    assert persisted_job.status == "completed"
    assert persisted_job.progress_current == 2
    assert persisted_job.progress_total == 2
    assert persisted_job.result_json == {
        "object_ids": ["object-7"],
        "persisted_frame_count": 2,
        "persisted_frame_indices": [13, 14],
    }
    assert [annotation.frame_idx for annotation in persisted_annotations] == [13, 14]
    assert all(annotation.source == "sam2" for annotation in persisted_annotations)
    assert all(annotation.is_keyframe is False for annotation in persisted_annotations)
    assert (tmp_path / "masks" / "video-alpha" / "object-7" / "frame_000013.png").read_bytes() == (
        b"mask-13"
    )
    assert (tmp_path / "masks" / "video-alpha" / "object-7" / "frame_000014.png").read_bytes() == (
        b"mask-14"
    )


def test_cancel_propagation_job_stops_future_frames(
    tmp_path: Path,
    monkeypatch: MonkeyPatch,
) -> None:
    """Cancel one running propagation job before later frames are persisted."""
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
        create_response = client.post(
            "/api/videos/video-alpha/sam2/propagate",
            json={
                "session_id": "sam2-session-001",
                "start_frame_idx": 12,
                "end_frame_idx": 14,
                "direction": "forward",
                "object_ids": ["object-7"],
            },
        )

        assert create_response.status_code == 202
        job_id = create_response.json()["job_id"]
        assert sam2_service.propagation_started.wait(timeout=5)

        sam2_service.release_frame(13)
        running_payload = _wait_for_job_progress(
            client=client,
            job_id=job_id,
            expected_progress=1,
        )
        assert running_payload["status"] == "running"

        cancel_response = client.post(f"/api/jobs/{job_id}/cancel")
        assert cancel_response.status_code == 202
        assert cancel_response.json() == {"job_id": job_id, "status": "cancelling"}

        sam2_service.release_frame(14)
        cancelled_payload = _wait_for_job_status(
            client=client,
            job_id=job_id,
            expected_status="cancelled",
        )

    assert cancelled_payload == {
        "job_id": job_id,
        "type": "sam2_propagation",
        "status": "cancelled",
        "progress_current": 1,
        "progress_total": 2,
        "result": {
            "object_ids": ["object-7"],
            "persisted_frame_count": 1,
            "persisted_frame_indices": [13],
        },
        "error_message": None,
    }

    database_url = _database_url_for(tmp_path)
    with Session(get_engine(database_url=database_url)) as session:
        persisted_annotations = session.scalars(
            select(FrameAnnotation)
            .where(
                FrameAnnotation.video_id == "video-alpha",
                FrameAnnotation.object_id == "object-7",
            )
            .order_by(FrameAnnotation.frame_idx.asc())
        ).all()

    assert [annotation.frame_idx for annotation in persisted_annotations] == [13]
    assert not (tmp_path / "masks" / "video-alpha" / "object-7" / "frame_000014.png").exists()


def _timestamp() -> object:
    return datetime(2026, 4, 16, 9, 30, 0)


def _database_url_for(tmp_path: Path) -> str:
    return f"sqlite:///{tmp_path / 'sam2-propagation-api.sqlite3'}"


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


def _wait_for_job_status(
    *,
    client: TestClient,
    job_id: str,
    expected_status: str,
) -> dict[str, object]:
    deadline = time.monotonic() + 5
    latest_payload: dict[str, object] | None = None
    while time.monotonic() < deadline:
        response = client.get(f"/api/jobs/{job_id}")
        assert response.status_code == 200
        payload: dict[str, object] = response.json()
        latest_payload = payload
        if payload["status"] == expected_status:
            return payload

        time.sleep(0.02)

    assert latest_payload is not None
    raise AssertionError(f"Job {job_id} did not reach status {expected_status}: {latest_payload}")


def _wait_for_job_progress(
    *,
    client: TestClient,
    job_id: str,
    expected_progress: int,
) -> dict[str, object]:
    deadline = time.monotonic() + 5
    latest_payload: dict[str, object] | None = None
    while time.monotonic() < deadline:
        response = client.get(f"/api/jobs/{job_id}")
        assert response.status_code == 200
        payload: dict[str, object] = response.json()
        latest_payload = payload
        if payload["progress_current"] == expected_progress:
            return payload

        time.sleep(0.02)

    assert latest_payload is not None
    raise AssertionError(
        f"Job {job_id} did not reach progress {expected_progress}: {latest_payload}"
    )
