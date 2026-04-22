"""Backend API integration tests for SAM2 shell contracts and runtime gaps."""

import contextlib
import time
from collections.abc import Callable, Iterator, Sequence
from pathlib import Path
from typing import cast

import pytest
from fastapi.testclient import TestClient
from httpx import Response

import app.api.videos as videos_api_module
import app.main as main_module
from app.db.migrations import upgrade_database
from app.db.seeds.baseline import seed_baseline
from app.db.session import get_engine, get_session_factory
from app.services.sam2 import (
    Sam2LoadedPredictor,
    Sam2PromptResult,
    Sam2PropagationFrameResult,
    Sam2PropagationMaskResult,
    Sam2RuntimeConfig,
    Sam2Service,
    _TorchModule,
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
            "mask_confidence": 0.91,
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
                "mask_confidence": 0.91,
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
                "mask_confidence": 0.78,
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


def test_sam2_prompt_box_uses_real_service_runtime_loader_and_persists_png(
    monkeypatch: pytest.MonkeyPatch,
    tmp_path: Path,
) -> None:
    """Persist prompt result through real service with lazy runtime loader wiring."""
    database_path = tmp_path / "sam2-real-prompt.sqlite3"
    masks_dir = tmp_path / "masks"
    source_dir = tmp_path / "videos"
    source_dir.mkdir()
    masks_dir.mkdir()
    _write_video_stub(source_dir / "street_scene_014.mp4")
    config_path = tmp_path / "sam2" / "configs" / "sam2.1" / "sam2.1_hiera_t.yaml"
    config_path.parent.mkdir(parents=True)
    config_path.write_text("model: {}", encoding="utf-8")
    checkpoint_path = tmp_path / "sam2.1_hiera_tiny.pt"
    checkpoint_path.write_bytes(b"checkpoint")
    monkeypatch.setenv("SAM2_CONFIG_PATH", str(config_path))
    monkeypatch.setenv("SAM2_CHECKPOINT_PATH", str(checkpoint_path))
    predictor = _FakeRuntimePredictor()
    loaded_configs: list[Sam2RuntimeConfig] = []
    sam2_service = Sam2Service()

    def load_predictor(config: Sam2RuntimeConfig) -> Sam2LoadedPredictor:
        loaded_configs.append(config)
        return Sam2LoadedPredictor(
            predictor=predictor,
            torch_module=cast(_TorchModule, _FakeTorchModule()),
            device_type="cpu",
        )

    monkeypatch.setattr("app.services.sam2._load_real_sam2_predictor", load_predictor)
    _configure_backend_for_test(
        monkeypatch=monkeypatch,
        database_path=database_path,
        masks_dir=masks_dir,
        sam2_service=sam2_service,
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
            session_id = client.post(f"/api/videos/{video_id}/sam2/session").json()["session_id"]
            sam2_service.close_session(session_id=session_id)

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
            mask_response = client.get(
                f"/api/videos/{video_id}/annotations/frame/7/object/{object_id}/mask"
            )
    finally:
        _clear_backend_caches()

    assert prompt_response.status_code == 200
    assert prompt_response.json() == {
        "annotation": {
            "box_xywh_norm": [0.1, 0.1, 0.4, 0.4],
            "mask_confidence": None,
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
                "mask_confidence": None,
                "mask": {
                    "path": f"masks/{video_id}/{object_id}/frame_000007.png",
                },
                "object_id": object_id,
                "source": "sam2",
            }
        ],
        "frame_idx": 7,
    }
    assert mask_response.status_code == 200
    assert mask_response.headers["content-type"] == "image/png"
    assert mask_response.content.startswith(b"\x89PNG\r\n\x1a\n")
    assert loaded_configs == [
        Sam2RuntimeConfig(
            config_name="configs/sam2.1/sam2.1_hiera_t.yaml",
            checkpoint_path=checkpoint_path.resolve(),
            device_name=None,
        )
    ]
    assert predictor.init_state_calls == [str((source_dir / "street_scene_014.mp4").resolve())]
    assert predictor.prompt_calls == [
        (7, object_id, (40, 20, 200, 100)),
    ]


def test_sam2_propagation_uses_real_service_runtime_loader_and_persists_png(
    monkeypatch: pytest.MonkeyPatch,
    tmp_path: Path,
) -> None:
    """Persist propagated masks through default service runtime wiring."""
    database_path = tmp_path / "sam2-real-propagation.sqlite3"
    masks_dir = tmp_path / "masks"
    source_dir = tmp_path / "videos"
    source_dir.mkdir()
    masks_dir.mkdir()
    _write_video_stub(source_dir / "street_scene_014.mp4")
    config_path = tmp_path / "sam2" / "configs" / "sam2.1" / "sam2.1_hiera_t.yaml"
    config_path.parent.mkdir(parents=True)
    config_path.write_text("model: {}", encoding="utf-8")
    checkpoint_path = tmp_path / "sam2.1_hiera_tiny.pt"
    checkpoint_path.write_bytes(b"checkpoint")
    monkeypatch.setenv("SAM2_CONFIG_PATH", str(config_path))
    monkeypatch.setenv("SAM2_CHECKPOINT_PATH", str(checkpoint_path))
    predictor = _FakeRuntimePredictor()
    loaded_configs: list[Sam2RuntimeConfig] = []

    def load_predictor(config: Sam2RuntimeConfig) -> Sam2LoadedPredictor:
        loaded_configs.append(config)
        return Sam2LoadedPredictor(
            predictor=predictor,
            torch_module=cast(_TorchModule, _FakeTorchModule()),
            device_type="cpu",
        )

    monkeypatch.setattr("app.services.sam2._load_real_sam2_predictor", load_predictor)
    _configure_backend_for_test(
        monkeypatch=monkeypatch,
        database_path=database_path,
        masks_dir=masks_dir,
        sam2_service=Sam2Service(),
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
            propagation_sequence: list[tuple[int, Sequence[str], _FakeMaskLogits]] = [
                (
                    7,
                    [object_id],
                    _FakeMaskLogits([[[[-1.0, 2.0], [2.0, -1.0]]]]),
                ),
                (
                    8,
                    [object_id],
                    _FakeMaskLogits([[[[2.0, 2.0], [-1.0, -1.0]]]]),
                ),
                (
                    9,
                    [object_id],
                    _FakeMaskLogits([[[[-1.0, -1.0], [2.0, 2.0]]]]),
                ),
            ]
            predictor.propagation_sequences = [propagation_sequence]
            session_id = client.post(f"/api/videos/{video_id}/sam2/session").json()["session_id"]
            prompt_response = client.post(
                f"/api/videos/{video_id}/sam2/prompt-box",
                json={
                    "box_xyxy_px": [40, 20, 200, 100],
                    "frame_idx": 7,
                    "object_id": object_id,
                    "session_id": session_id,
                },
            )
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
    finally:
        _clear_backend_caches()

    assert prompt_response.status_code == 200
    assert create_job_response.status_code == 202
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
                "mask_confidence": None,
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
    assert mask_response.content.startswith(b"\x89PNG\r\n\x1a\n")
    assert loaded_configs == [
        Sam2RuntimeConfig(
            config_name="configs/sam2.1/sam2.1_hiera_t.yaml",
            checkpoint_path=checkpoint_path.resolve(),
            device_name=None,
        )
    ]
    assert predictor.init_state_calls == [str((source_dir / "street_scene_014.mp4").resolve())]
    assert predictor.prompt_calls == [
        (7, object_id, (40, 20, 200, 100)),
    ]
    assert predictor.propagation_calls == [
        (7, 2, False),
    ]


def test_sam2_prompt_box_returns_service_unavailable_when_runtime_missing(
    monkeypatch: pytest.MonkeyPatch,
    tmp_path: Path,
) -> None:
    """Return explicit prompt failure when runtime env is not configured."""
    database_path = tmp_path / "sam2-missing-runtime.sqlite3"
    masks_dir = tmp_path / "masks"
    source_dir = tmp_path / "videos"
    source_dir.mkdir()
    masks_dir.mkdir()
    _write_video_stub(source_dir / "street_scene_014.mp4")
    monkeypatch.delenv("SAM2_CONFIG_PATH", raising=False)
    monkeypatch.delenv("SAM2_CHECKPOINT_PATH", raising=False)

    _configure_backend_for_test(
        monkeypatch=monkeypatch,
        database_path=database_path,
        masks_dir=masks_dir,
        sam2_service=Sam2Service(),
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
            session_id = client.post(f"/api/videos/{video_id}/sam2/session").json()["session_id"]

            prompt_response = client.post(
                f"/api/videos/{video_id}/sam2/prompt-box",
                json={
                    "box_xyxy_px": [40, 20, 200, 100],
                    "frame_idx": 7,
                    "object_id": object_id,
                    "session_id": session_id,
                },
            )
    finally:
        _clear_backend_caches()

    assert prompt_response.status_code == 503
    assert prompt_response.json() == {
        "detail": "SAM2 runtime not configured. Set SAM2_CONFIG_PATH and SAM2_CHECKPOINT_PATH.",
    }


def test_sam2_propagation_job_marks_failed_when_runtime_missing(
    monkeypatch: pytest.MonkeyPatch,
    tmp_path: Path,
) -> None:
    """Fail propagation jobs explicitly when default runtime config is missing."""
    database_path = tmp_path / "sam2-propagation-missing-runtime.sqlite3"
    masks_dir = tmp_path / "masks"
    source_dir = tmp_path / "videos"
    source_dir.mkdir()
    masks_dir.mkdir()
    _write_video_stub(source_dir / "street_scene_014.mp4")
    monkeypatch.delenv("SAM2_CONFIG_PATH", raising=False)
    monkeypatch.delenv("SAM2_CHECKPOINT_PATH", raising=False)

    _configure_backend_for_test(
        monkeypatch=monkeypatch,
        database_path=database_path,
        masks_dir=masks_dir,
        sam2_service=Sam2Service(),
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
            failed_job_response = _wait_for_job_status(
                client=client,
                job_id=job_id,
                expected_status="failed",
            )
    finally:
        _clear_backend_caches()

    assert create_job_response.status_code == 202
    assert failed_job_response.status_code == 200
    assert failed_job_response.json() == {
        "error_message": (
            "SAM2 runtime not configured. Set SAM2_CONFIG_PATH and SAM2_CHECKPOINT_PATH."
        ),
        "job_id": job_id,
        "progress_current": 0,
        "progress_total": 2,
        "result": {
            "object_ids": ["object-1"],
            "persisted_frame_count": 0,
            "persisted_frame_indices": [],
        },
        "status": "failed",
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
        return Sam2PromptResult(
            mask_png_bytes=b"prompt-mask-frame-7-object-1",
            mask_confidence=0.91,
        )

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
                        mask_confidence=0.78,
                    )
                    for object_id in object_ids
                ],
            )


class _FakeRuntimePredictor:
    def __init__(
        self,
        *,
        propagation_sequences: Sequence[
            Sequence[tuple[int, Sequence[str], "_FakeMaskLogits"]]
        ] = (),
    ) -> None:
        self.init_state_calls: list[str] = []
        self.prompt_calls: list[tuple[int, str, tuple[int, int, int, int]]] = []
        self.propagation_calls: list[tuple[int | None, int | None, bool]] = []
        self.propagation_sequences = [list(sequence) for sequence in propagation_sequences]

    def init_state(
        self,
        video_path: str,
        offload_video_to_cpu: bool = False,
        offload_state_to_cpu: bool = False,
        async_loading_frames: bool = False,
    ) -> dict[str, object]:
        del offload_video_to_cpu, offload_state_to_cpu, async_loading_frames
        self.init_state_calls.append(video_path)
        return {"video_path": video_path}

    def add_new_points_or_box(
        self,
        inference_state: object,
        frame_idx: int,
        obj_id: str,
        points: object | None = None,
        labels: object | None = None,
        clear_old_points: bool = True,
        normalize_coords: bool = True,
        box: object | None = None,
    ) -> tuple[int, list[str], "_FakeMaskLogits"]:
        del inference_state, points, labels, clear_old_points, normalize_coords
        assert isinstance(box, tuple)
        self.prompt_calls.append((frame_idx, obj_id, box))
        return (
            frame_idx,
            [obj_id],
            _FakeMaskLogits([[[[-1.0, 2.0], [2.0, -1.0]]]]),
        )

    def propagate_in_video(
        self,
        inference_state: object,
        start_frame_idx: int | None = None,
        max_frame_num_to_track: int | None = None,
        reverse: bool = False,
    ) -> Iterator[tuple[int, Sequence[str], "_FakeMaskLogits"]]:
        del inference_state
        self.propagation_calls.append((start_frame_idx, max_frame_num_to_track, reverse))
        if not self.propagation_sequences:
            return iter(())

        return iter(self.propagation_sequences.pop(0))


class _FakeMaskLogits:
    def __init__(self, values: list[list[list[list[float]]]]) -> None:
        self.values = values

    def __getitem__(self, key: tuple[int, int]) -> "_FakeMaskTensor":
        object_index, channel_index = key
        return _FakeMaskTensor(self.values[object_index][channel_index])


class _FakeMaskTensor:
    def __init__(self, values: list[list[float]] | list[list[bool]]) -> None:
        self.values = values

    def __gt__(self, threshold: float) -> "_FakeMaskTensor":
        return _FakeMaskTensor(
            [[value > threshold for value in row] for row in self.values]  # type: ignore[operator]
        )

    def detach(self) -> "_FakeMaskTensor":
        return self

    def to(
        self,
        *,
        device: str | None = None,
        dtype: object | None = None,
    ) -> "_FakeMaskTensor":
        del device, dtype
        return self

    def tolist(self) -> list[list[float]] | list[list[bool]]:
        return self.values


class _FakeTorchModule:
    uint8 = "uint8"
    bfloat16 = "bfloat16"

    class cuda:
        @staticmethod
        def is_available() -> bool:
            return False

    class backends:
        mps = None

    @staticmethod
    def inference_mode() -> contextlib.AbstractContextManager[None]:
        return contextlib.nullcontext()

    @staticmethod
    def autocast(*_args: object, **_kwargs: object) -> contextlib.AbstractContextManager[None]:
        return contextlib.nullcontext()


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
