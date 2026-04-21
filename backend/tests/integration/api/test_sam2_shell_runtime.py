"""Backend API integration tests for SAM2 shell contracts and runtime gaps."""

import time
from collections.abc import Callable, Iterator, Sequence
from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from httpx import Response

import app.api.videos as videos_api_module
import app.main as main_module
from app.db.migrations import upgrade_database
from app.db.seeds.baseline import seed_baseline
from app.db.session import get_engine, get_session_factory
from app.services.sam2 import (
    Sam2PromptResult,
    Sam2PropagationFrameResult,
    Sam2PropagationMaskResult,
    Sam2Service,
)
from app.services.video_metadata import VideoMetadata

type VideoInspector = Callable[[Path], VideoMetadata]


def test_sam2_routes_create_reuse_close_prompt_propagate_and_reopen_masks(
    monkeypatch: pytest.MonkeyPatch,
    tmp_path: Path,
) -> None:
    """Persist fake-adapter SAM2 shell work through real routes and reopen saved masks."""
    database_path = tmp_path / "sam2-shell.sqlite3"
    masks_dir = tmp_path / "masks"
    source_dir = tmp_path / "videos"
    source_dir.mkdir()
    masks_dir.mkdir()
    _write_video_stub(source_dir / "street_scene_014.mp4")
    fake_sam2_service = FakeSam2Service(
        propagation_frames=(8, 9),
    )

    _configure_backend_for_test(
        monkeypatch=monkeypatch,
        database_path=database_path,
        masks_dir=masks_dir,
        sam2_service=fake_sam2_service,
        source_dir=source_dir,
        inspect_video=_build_video_inspector(
            {
                "street_scene_014.mp4": VideoMetadata(
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
            video_id = client.get("/api/videos").json()[0]["id"]
            object_id = client.post(
                f"/api/videos/{video_id}/objects",
                json={"label": "left hand"},
            ).json()["id"]

            create_session_response = client.post(f"/api/videos/{video_id}/sam2/session")
            reused_session_response = client.post(f"/api/videos/{video_id}/sam2/session")
            session_id = create_session_response.json()["session_id"]

            prompt_response = client.post(
                f"/api/videos/{video_id}/sam2/prompt-box",
                json={
                    "box_xyxy_px": [40, 20, 200, 100],
                    "frame_idx": 7,
                    "object_id": object_id,
                    "session_id": session_id,
                },
            )
            prompt_reload_response = client.get(f"/api/videos/{video_id}/annotations/frame/7")

            create_job_response = client.post(
                f"/api/videos/{video_id}/sam2/propagate",
                json={
                    "direction": "forward",
                    "end_frame_idx": 9,
                    "object_ids": [object_id],
                    "session_id": session_id,
                    "start_frame_idx": 7,
                },
            )
            job_id = create_job_response.json()["job_id"]
            completed_job_response = _wait_for_job_status(
                client=client,
                job_id=job_id,
                expected_status="completed",
            )
            reopened_frame_response = client.get(f"/api/videos/{video_id}/annotations/frame/8")
            mask_response = client.get(
                f"/api/videos/{video_id}/annotations/frame/8/object/{object_id}/mask"
            )

            close_session_response = client.delete(
                f"/api/videos/{video_id}/sam2/session/{session_id}"
            )
            reopened_session_response = client.post(f"/api/videos/{video_id}/sam2/session")
    finally:
        _clear_backend_caches()

    assert create_session_response.status_code == 200
    assert create_session_response.json() == {
        "reused": False,
        "session_id": session_id,
    }
    assert reused_session_response.status_code == 200
    assert reused_session_response.json() == {
        "reused": True,
        "session_id": session_id,
    }
    assert prompt_response.status_code == 200
    assert prompt_response.json() == {
        "annotation": {
            "box_xywh_norm": [0.1, 0.1, 0.4, 0.4],
            "mask": {
                "path": f"masks/{video_id}/{object_id}/frame_000007.png",
            },
            "object_id": object_id,
            "source": "sam2",
        },
        "frame_idx": 7,
    }
    assert prompt_reload_response.status_code == 200
    assert prompt_reload_response.json() == {
        "annotations": [
            {
                "box_xywh_norm": [0.1, 0.1, 0.4, 0.4],
                "mask": {
                    "path": f"masks/{video_id}/{object_id}/frame_000007.png",
                },
                "object_id": object_id,
                "source": "sam2",
            }
        ],
        "frame_idx": 7,
    }
    assert create_job_response.status_code == 202
    assert create_job_response.json() == {
        "job_id": job_id,
        "progress_current": 0,
        "progress_total": 2,
        "status": "queued",
    }
    assert completed_job_response.status_code == 200
    assert completed_job_response.json() == {
        "error_message": None,
        "job_id": job_id,
        "progress_current": 2,
        "progress_total": 2,
        "result": {
            "object_ids": [object_id],
            "persisted_frame_count": 2,
            "persisted_frame_indices": [8, 9],
        },
        "status": "completed",
        "type": "sam2_propagation",
    }
    assert reopened_frame_response.status_code == 200
    assert reopened_frame_response.json() == {
        "annotations": [
            {
                "box_xywh_norm": None,
                "mask": {
                    "path": f"masks/{video_id}/{object_id}/frame_000008.png",
                },
                "object_id": object_id,
                "source": "sam2",
            }
        ],
        "frame_idx": 8,
    }
    assert mask_response.status_code == 200
    assert mask_response.headers["content-type"] == "image/png"
    assert mask_response.content == f"propagation-mask-frame-8-{object_id}".encode()
    assert close_session_response.status_code == 204
    assert reopened_session_response.status_code == 200
    assert reopened_session_response.json() == {
        "reused": False,
        "session_id": fake_sam2_service.created_session_ids[-1],
    }
    assert fake_sam2_service.closed_session_ids == [session_id]


def test_job_routes_cancel_active_sam2_propagation(
    monkeypatch: pytest.MonkeyPatch,
    tmp_path: Path,
) -> None:
    """Cancel active fake-adapter propagation without pretending runtime completed work."""
    database_path = tmp_path / "sam2-shell-cancel.sqlite3"
    masks_dir = tmp_path / "masks"
    source_dir = tmp_path / "videos"
    source_dir.mkdir()
    masks_dir.mkdir()
    _write_video_stub(source_dir / "street_scene_014.mp4")
    fake_sam2_service = FakeSam2Service(
        frame_delay_seconds=0.2,
        propagation_frames=(8, 9),
    )

    _configure_backend_for_test(
        monkeypatch=monkeypatch,
        database_path=database_path,
        masks_dir=masks_dir,
        sam2_service=fake_sam2_service,
        source_dir=source_dir,
        inspect_video=_build_video_inspector(
            {
                "street_scene_014.mp4": VideoMetadata(
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
            video_id = client.get("/api/videos").json()[0]["id"]
            session_id = client.post(f"/api/videos/{video_id}/sam2/session").json()["session_id"]
            create_job_response = client.post(
                f"/api/videos/{video_id}/sam2/propagate",
                json={
                    "direction": "forward",
                    "end_frame_idx": 9,
                    "object_ids": ["object-1"],
                    "session_id": session_id,
                    "start_frame_idx": 7,
                },
            )
            job_id = create_job_response.json()["job_id"]
            running_job_response = _wait_for_job_status(
                client=client,
                job_id=job_id,
                expected_status="running",
            )
            cancel_job_response = client.post(f"/api/jobs/{job_id}/cancel")
            cancelled_job_response = _wait_for_job_status(
                client=client,
                job_id=job_id,
                expected_status="cancelled",
            )
    finally:
        _clear_backend_caches()

    assert create_job_response.status_code == 202
    assert running_job_response.status_code == 200
    assert running_job_response.json()["status"] == "running"
    assert cancel_job_response.status_code == 202
    assert cancel_job_response.json() == {
        "job_id": job_id,
        "status": "cancelling",
    }
    assert cancelled_job_response.status_code == 200
    assert cancelled_job_response.json() == {
        "error_message": None,
        "job_id": job_id,
        "progress_current": 0,
        "progress_total": 2,
        "result": {
            "object_ids": ["object-1"],
            "persisted_frame_count": 0,
            "persisted_frame_indices": [],
        },
        "status": "cancelled",
        "type": "sam2_propagation",
    }


class FakeSam2Service(Sam2Service):
    """Deterministic fake adapter for shell-route integration tests."""

    def __init__(
        self,
        *,
        frame_delay_seconds: float = 0.0,
        propagation_frames: Sequence[int] = (),
    ) -> None:
        """Store deterministic propagation behavior for one test run."""
        super().__init__()
        self.created_session_ids: list[str] = []
        self.closed_session_ids: list[str] = []
        self.frame_delay_seconds = frame_delay_seconds
        self.propagation_frames = tuple(propagation_frames)

    def create_session(self, *, session_id: str, video_path: Path) -> None:
        """Track created runtime sessions while keeping base session behavior."""
        super().create_session(session_id=session_id, video_path=video_path)
        self.created_session_ids.append(session_id)

    def close_session(self, *, session_id: str) -> None:
        """Track closed runtime sessions while keeping base session behavior."""
        super().close_session(session_id=session_id)
        self.closed_session_ids.append(session_id)

    def prompt_box(
        self,
        *,
        session_id: str,
        frame_idx: int,
        object_id: str,
        box_xyxy_px: Sequence[int],
    ) -> Sam2PromptResult:
        """Return one deterministic prompt-box mask for current frame."""
        del frame_idx, object_id, box_xyxy_px
        assert self.has_session(session_id=session_id)
        return Sam2PromptResult(mask_png_bytes=b"prompt-mask-frame-7-object-1")

    def propagate(
        self,
        *,
        session_id: str,
        start_frame_idx: int,
        end_frame_idx: int | None,
        direction: str,
        object_ids: Sequence[str],
    ) -> Iterator[Sam2PropagationFrameResult]:
        """Yield deterministic propagated masks, optionally slowed for cancel tests."""
        del start_frame_idx, end_frame_idx, direction
        assert self.has_session(session_id=session_id)
        for frame_idx in self.propagation_frames:
            if self.frame_delay_seconds > 0:
                time.sleep(self.frame_delay_seconds)

            yield Sam2PropagationFrameResult(
                frame_idx=frame_idx,
                object_results=[
                    Sam2PropagationMaskResult(
                        object_id=object_id,
                        mask_png_bytes=f"propagation-mask-frame-{frame_idx}-{object_id}".encode(),
                    )
                    for object_id in object_ids
                ],
            )


def _wait_for_job_status(
    *,
    client: TestClient,
    job_id: str,
    expected_status: str,
    timeout_seconds: float = 2.0,
) -> Response:
    """Poll job route until one expected status appears."""
    deadline = time.monotonic() + timeout_seconds
    last_response = None
    while time.monotonic() < deadline:
        response = client.get(f"/api/jobs/{job_id}")
        last_response = response
        if response.status_code == 200 and response.json()["status"] == expected_status:
            return response

        time.sleep(0.02)

    raise AssertionError(
        f"Timed out waiting for job {job_id} status {expected_status}. "
        f"Last response: {None if last_response is None else last_response.json()}"
    )


def _configure_backend_for_test(
    *,
    monkeypatch: pytest.MonkeyPatch,
    database_path: Path,
    masks_dir: Path,
    sam2_service: Sam2Service,
    source_dir: Path,
    inspect_video: VideoInspector,
) -> None:
    """Point cached backend globals and SAM2 adapter at temp test state."""
    monkeypatch.setenv("APP_DB_URL", f"sqlite:///{database_path}")
    monkeypatch.setenv("APP_MASKS_DIR", str(masks_dir))
    monkeypatch.setattr(videos_api_module, "get_sam2_service", lambda: sam2_service)
    _clear_backend_caches()
    upgrade_database(database_url=f"sqlite:///{database_path}")
    seed_baseline(
        database_url=f"sqlite:///{database_path}",
        source_dir=source_dir,
        inspect_video=inspect_video,
    )


def _clear_backend_caches() -> None:
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
