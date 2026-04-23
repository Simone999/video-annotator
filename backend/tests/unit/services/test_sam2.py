"""Unit tests for SAM2 helper branches."""

import contextlib
from collections.abc import Iterator, Sequence
from datetime import datetime
from pathlib import Path
from types import SimpleNamespace
from typing import Protocol, cast

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.db import Job, Sam2Session, Video
from app.db.base import Base
from app.services.sam2 import (
    InvalidPropagationRangeError,
    JobNotFoundError,
    Sam2LoadedPredictor,
    Sam2PromptResult,
    Sam2PropagationFrameResult,
    Sam2PropagationMaskResult,
    Sam2RuntimeConfig,
    Sam2RuntimeDependencyError,
    Sam2RuntimeExecutionError,
    Sam2RuntimeNotConfiguredError,
    Sam2Service,
    Sam2SessionNotFoundError,
    Sam2SessionResult,
    Sam2VideoNotFoundError,
    Sam2VideoSourceNotAvailableError,
    _build_refine_point_inputs,
    _decode_seed_mask_png,
    _encode_prompt_mask_png,
    _get_job_or_raise,
    _get_open_sam2_session,
    _iter_runtime_propagation_calls,
    _load_real_sam2_predictor,
    _load_runtime_config_from_env,
    _normalize_sam2_config_name,
    _prompt_runtime_context,
    _resolve_runtime_device_type,
    _resolve_runtime_track_length,
    _resolve_target_frame_indices,
    _run_sam2_propagation_job,
    _TorchModule,
    _validate_frame_idx,
    close_sam2_session,
    create_or_reuse_sam2_session,
    get_job_status,
    prompt_sam2_box,
    request_job_cancellation,
    start_sam2_propagation_job,
)
from app.services.video_frames import FrameIndexOutOfRangeError


def _open_session(database_path: Path) -> Session:
    engine = create_engine(f"sqlite:///{database_path}")
    Base.metadata.create_all(engine)
    return Session(engine, expire_on_commit=False)


def _seed_video(session: Session, *, frame_count: int = 12) -> None:
    session.add(
        Video(
            id="video-1",
            source_path="/tmp/video-1.mp4",
            display_name="video-1.mp4",
            frame_count=frame_count,
            fps=24.0,
            width=400,
            height=200,
            duration_seconds=1.0,
        )
    )
    session.commit()


def _seed_open_sam2_session(session: Session) -> None:
    now = datetime(2026, 4, 22, 0, 0, 0)
    session.add(
        Sam2Session(
            id="sam2-session-1",
            video_id="video-1",
            status="open",
            created_at=now,
            last_used_at=now,
            closed_at=None,
        )
    )
    session.commit()


def _seed_closed_sam2_session(session: Session) -> None:
    now = datetime(2026, 4, 22, 0, 0, 0)
    session.add(
        Sam2Session(
            id="sam2-session-1",
            video_id="video-1",
            status="closed",
            created_at=now,
            last_used_at=now,
            closed_at=now,
        )
    )
    session.commit()


def _create_job(
    *,
    job_id: str = "job-1",
    status: str = "queued",
    cancel_requested_at: datetime | None = None,
) -> Job:
    return Job(
        id=job_id,
        type="sam2_propagation",
        video_id="video-1",
        object_id="object-1",
        session_id="sam2-session-1",
        status=status,
        progress_current=0,
        progress_total=2,
        payload_json={},
        result_json=None,
        error_message=None,
        cancel_requested_at=cancel_requested_at,
        started_at=None,
        completed_at=None,
    )


class _FakeSam2Service(Sam2Service):
    def __init__(
        self,
        *,
        prompt_result: Sam2PromptResult | None = None,
        propagation_frames: Sequence[Sam2PropagationFrameResult] = (),
        propagate_error: Exception | None = None,
    ) -> None:
        super().__init__()
        self.prompt_result = prompt_result or Sam2PromptResult(mask_png_bytes=b"mask")
        self.propagation_frames = list(propagation_frames)
        self.propagate_error = propagate_error

    def prompt_box(
        self,
        *,
        session_id: str,
        frame_idx: int,
        object_id: str,
        box_xyxy_px: Sequence[int],
    ) -> Sam2PromptResult:
        del session_id, frame_idx, object_id, box_xyxy_px
        return self.prompt_result

    def propagate(
        self,
        *,
        session_id: str,
        start_frame_idx: int,
        end_frame_idx: int | None,
        direction: str,
        object_ids: Sequence[str],
    ) -> Iterator[Sam2PropagationFrameResult]:
        del session_id, start_frame_idx, end_frame_idx, direction, object_ids
        if self.propagate_error is not None:
            raise self.propagate_error
        return iter(self.propagation_frames)


class _ArrayLike(Protocol):
    def tolist(self) -> object: ...


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
        self.refine_point_calls: list[tuple[int, str, list[list[float]], list[int]]] = []
        self.mask_calls: list[tuple[int, str, list[list[bool]]]] = []
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
        del inference_state, clear_old_points, normalize_coords
        if box is not None:
            assert isinstance(box, tuple)
            self.prompt_calls.append((frame_idx, obj_id, box))
        else:
            assert points is not None
            assert labels is not None
            refine_points = cast(_ArrayLike, points)
            refine_labels = cast(_ArrayLike, labels)
            self.refine_point_calls.append(
                (
                    frame_idx,
                    obj_id,
                    cast(list[list[float]], refine_points.tolist()),
                    cast(list[int], refine_labels.tolist()),
                )
            )
        return (
            frame_idx,
            [obj_id],
            _FakeMaskLogits([[[[-1.0, 2.0], [2.0, -1.0]]]]),
        )

    def add_new_mask(
        self,
        inference_state: object,
        frame_idx: int,
        obj_id: str,
        mask: object,
    ) -> tuple[int, list[str], "_FakeMaskLogits"]:
        del inference_state
        seed_mask = cast(_ArrayLike, mask)
        self.mask_calls.append((frame_idx, obj_id, cast(list[list[bool]], seed_mask.tolist())))
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


class _FailingPromptRuntimePredictor(_FakeRuntimePredictor):
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
        del (
            inference_state,
            frame_idx,
            obj_id,
            points,
            labels,
            clear_old_points,
            normalize_coords,
            box,
        )
        raise RuntimeError("predictor boom")


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
    def __init__(
        self,
        *,
        cuda_available: bool = False,
        cuda_major: int = 0,
        mps_available: bool = False,
    ) -> None:
        self.uint8 = object()
        self.bfloat16 = object()
        self.inference_mode_calls = 0
        self.autocast_calls: list[tuple[str, object]] = []
        self.cuda = SimpleNamespace(
            is_available=lambda: cuda_available,
            get_device_properties=lambda _device_index: SimpleNamespace(major=cuda_major),
        )
        self.backends = SimpleNamespace(
            cuda=SimpleNamespace(matmul=SimpleNamespace(allow_tf32=False)),
            cudnn=SimpleNamespace(allow_tf32=False),
            mps=SimpleNamespace(is_available=lambda: mps_available),
        )

    def inference_mode(self) -> contextlib.AbstractContextManager[None]:
        self.inference_mode_calls += 1
        return contextlib.nullcontext()

    def autocast(
        self,
        device_type: str,
        *,
        dtype: object,
    ) -> contextlib.AbstractContextManager[None]:
        self.autocast_calls.append((device_type, dtype))
        return contextlib.nullcontext()


class _FakeSam2BuildModule:
    def __init__(self, predictor: _FakeRuntimePredictor) -> None:
        self.predictor = predictor
        self.calls: list[tuple[str, str, str]] = []

    def build_sam2_video_predictor(
        self,
        config_name: str,
        checkpoint_path: str,
        *,
        device: str,
    ) -> _FakeRuntimePredictor:
        self.calls.append((config_name, checkpoint_path, device))
        return self.predictor


def _make_seed_mask_png() -> bytes:
    from io import BytesIO

    from PIL import Image

    image = Image.new("L", (2, 2), color=0)
    image.putpixel((1, 0), 255)
    image.putpixel((0, 1), 255)
    buffer = BytesIO()
    image.save(buffer, format="PNG")
    return buffer.getvalue()


def test_resolve_target_frame_indices_covers_forward_backward_and_both_modes() -> None:
    """Resolve deterministic target ranges for each supported propagation direction."""
    assert _resolve_target_frame_indices(
        frame_count=10,
        start_frame_idx=7,
        end_frame_idx=9,
        direction="forward",
    ) == [8, 9]
    assert _resolve_target_frame_indices(
        frame_count=10,
        start_frame_idx=7,
        end_frame_idx=5,
        direction="backward",
    ) == [6, 5]
    assert _resolve_target_frame_indices(
        frame_count=10,
        start_frame_idx=7,
        end_frame_idx=None,
        direction="both",
    ) == [8, 9, 6, 5, 4, 3, 2, 1, 0]
    assert _resolve_target_frame_indices(
        frame_count=10,
        start_frame_idx=7,
        end_frame_idx=5,
        direction="both",
    ) == [8, 9, 6, 5]


@pytest.mark.parametrize(
    ("direction", "end_frame_idx", "message"),
    [
        ("forward", 6, "greater than or equal"),
        ("backward", 8, "less than or equal"),
        ("sideways", None, "Unsupported propagation direction"),
    ],
)
def test_resolve_target_frame_indices_rejects_invalid_ranges_and_directions(
    direction: str,
    end_frame_idx: int | None,
    message: str,
) -> None:
    """Reject malformed propagation requests before runtime work starts."""
    with pytest.raises(InvalidPropagationRangeError, match=message):
        _resolve_target_frame_indices(
            frame_count=10,
            start_frame_idx=7,
            end_frame_idx=end_frame_idx,
            direction=direction,
        )


def test_iter_runtime_propagation_calls_handles_open_ended_modes() -> None:
    """Map open-ended app ranges onto SAM2 runtime call arguments."""
    assert list(
        _iter_runtime_propagation_calls(
            start_frame_idx=7,
            end_frame_idx=None,
            direction="forward",
        )
    ) == [(False, None)]
    assert list(
        _iter_runtime_propagation_calls(
            start_frame_idx=7,
            end_frame_idx=None,
            direction="backward",
        )
    ) == [(True, None)]
    assert list(
        _iter_runtime_propagation_calls(
            start_frame_idx=7,
            end_frame_idx=None,
            direction="both",
        )
    ) == [(False, None), (True, None)]
    assert _resolve_runtime_track_length(7, None) is None


@pytest.mark.parametrize(
    ("direction", "end_frame_idx", "message"),
    [
        ("forward", 6, "greater than or equal"),
        ("backward", 8, "less than or equal"),
        ("sideways", None, "Unsupported propagation direction"),
    ],
)
def test_iter_runtime_propagation_calls_rejects_invalid_ranges_and_directions(
    direction: str,
    end_frame_idx: int | None,
    message: str,
) -> None:
    """Reject invalid runtime-call mappings before invoking SAM2."""
    with pytest.raises(InvalidPropagationRangeError, match=message):
        list(
            _iter_runtime_propagation_calls(
                start_frame_idx=7,
                end_frame_idx=end_frame_idx,
                direction=direction,
            )
        )


def test_validate_frame_idx_rejects_out_of_range_values() -> None:
    """Reject frame indexes outside canonical bounds."""
    with pytest.raises(FrameIndexOutOfRangeError, match="between 0 and 11"):
        _validate_frame_idx(frame_idx=12, frame_count=12)


def test_sam2_service_requires_real_file_and_tracks_open_sessions(tmp_path: Path) -> None:
    """Reject missing files and track runtime open-session ids."""
    service = Sam2Service()

    with pytest.raises(FileNotFoundError):
        service.create_session(session_id="sam2-session-1", video_path=tmp_path / "missing.mp4")

    video_path = tmp_path / "video.mp4"
    video_path.write_bytes(b"video")

    service.create_session(session_id="sam2-session-1", video_path=video_path)
    assert service.has_session(session_id="sam2-session-1") is True

    service.close_session(session_id="sam2-session-1")
    assert service.has_session(session_id="sam2-session-1") is False


def test_sam2_service_prompt_box_uses_configured_runtime_once_and_returns_png(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """Load configured runtime lazily and reuse one initialized video state per session."""
    video_path = tmp_path / "video.mp4"
    video_path.write_bytes(b"video")
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

    service = Sam2Service(predictor_loader=load_predictor)
    service.create_session(session_id="sam2-session-1", video_path=video_path)

    first_result = service.prompt_box(
        session_id="sam2-session-1",
        frame_idx=2,
        object_id="object-1",
        box_xyxy_px=(10, 20, 40, 60),
    )
    second_result = service.prompt_box(
        session_id="sam2-session-1",
        frame_idx=3,
        object_id="object-1",
        box_xyxy_px=(20, 30, 50, 80),
    )

    assert loaded_configs == [
        Sam2RuntimeConfig(
            config_name="configs/sam2.1/sam2.1_hiera_t.yaml",
            checkpoint_path=checkpoint_path.resolve(),
            device_name=None,
        )
    ]
    assert predictor.init_state_calls == [str(video_path.resolve())]
    assert predictor.prompt_calls == [
        (2, "object-1", (10, 20, 40, 60)),
        (3, "object-1", (20, 30, 50, 80)),
    ]
    assert first_result.mask_png_bytes.startswith(b"\x89PNG\r\n\x1a\n")
    assert second_result.mask_png_bytes.startswith(b"\x89PNG\r\n\x1a\n")
    assert first_result.mask_confidence is None


def test_sam2_service_prompt_box_rejects_missing_runtime_configuration(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """Raise explicit setup error instead of placeholder runtime failure."""
    video_path = tmp_path / "video.mp4"
    video_path.write_bytes(b"video")
    monkeypatch.delenv("SAM2_CONFIG_PATH", raising=False)
    monkeypatch.delenv("SAM2_CHECKPOINT_PATH", raising=False)

    service = Sam2Service()
    service.create_session(session_id="sam2-session-1", video_path=video_path)

    with pytest.raises(Sam2RuntimeNotConfiguredError, match="SAM2 runtime not configured"):
        service.prompt_box(
            session_id="sam2-session-1",
            frame_idx=2,
            object_id="object-1",
            box_xyxy_px=(10, 20, 40, 60),
        )


def test_sam2_service_prompt_box_wraps_predictor_failures(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """Normalize prompt predictor crashes into explicit runtime execution errors."""
    video_path = tmp_path / "video.mp4"
    video_path.write_bytes(b"video")
    config_path = tmp_path / "sam2" / "configs" / "sam2.1" / "sam2.1_hiera_t.yaml"
    config_path.parent.mkdir(parents=True)
    config_path.write_text("model: {}", encoding="utf-8")
    checkpoint_path = tmp_path / "sam2.1_hiera_tiny.pt"
    checkpoint_path.write_bytes(b"checkpoint")
    monkeypatch.setenv("SAM2_CONFIG_PATH", str(config_path))
    monkeypatch.setenv("SAM2_CHECKPOINT_PATH", str(checkpoint_path))

    service = Sam2Service(
        predictor_loader=lambda _config: Sam2LoadedPredictor(
            predictor=_FailingPromptRuntimePredictor(),
            torch_module=cast(_TorchModule, _FakeTorchModule()),
            device_type="cpu",
        )
    )
    service.create_session(session_id="sam2-session-1", video_path=video_path)

    with pytest.raises(Sam2RuntimeExecutionError, match="predictor boom"):
        service.prompt_box(
            session_id="sam2-session-1",
            frame_idx=2,
            object_id="object-1",
            box_xyxy_px=(10, 20, 40, 60),
        )


def test_sam2_service_prompt_box_rejects_unknown_runtime_session() -> None:
    """Reject prompt requests when runtime state was never opened."""
    with pytest.raises(Sam2SessionNotFoundError):
        Sam2Service().prompt_box(
            session_id="sam2-session-1",
            frame_idx=2,
            object_id="object-1",
            box_xyxy_px=(10, 20, 40, 60),
        )


def test_sam2_service_propagate_rejects_unknown_runtime_session() -> None:
    """Reject propagation requests when runtime state was never opened."""
    with pytest.raises(Sam2SessionNotFoundError):
        list(
            Sam2Service().propagate(
                session_id="sam2-session-1",
                start_frame_idx=2,
                end_frame_idx=4,
                direction="forward",
                object_ids=("object-1",),
            )
        )


def test_sam2_service_refine_uses_seed_mask_and_point_prompts(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """Seed refine from persisted mask, then apply point prompts on same frame."""
    video_path = tmp_path / "video.mp4"
    video_path.write_bytes(b"video")
    config_path = tmp_path / "sam2" / "configs" / "sam2.1" / "sam2.1_hiera_t.yaml"
    config_path.parent.mkdir(parents=True)
    config_path.write_text("model: {}", encoding="utf-8")
    checkpoint_path = tmp_path / "sam2.1_hiera_tiny.pt"
    checkpoint_path.write_bytes(b"checkpoint")
    monkeypatch.setenv("SAM2_CONFIG_PATH", str(config_path))
    monkeypatch.setenv("SAM2_CHECKPOINT_PATH", str(checkpoint_path))

    predictor = _FakeRuntimePredictor()
    service = Sam2Service(
        predictor_loader=lambda _config: Sam2LoadedPredictor(
            predictor=predictor,
            torch_module=cast(_TorchModule, _FakeTorchModule()),
            device_type="cpu",
        )
    )
    service.create_session(session_id="sam2-session-1", video_path=video_path)

    refine_result = service.refine(
        session_id="sam2-session-1",
        frame_idx=2,
        object_id="object-1",
        positive_points=((10.0, 20.0),),
        negative_points=((30.0, 40.0),),
        seed_mask_png_bytes=_make_seed_mask_png(),
    )

    assert refine_result.mask_png_bytes.startswith(b"\x89PNG\r\n\x1a\n")
    assert predictor.mask_calls == [
        (2, "object-1", [[False, True], [True, False]]),
    ]
    assert predictor.refine_point_calls == [
        (2, "object-1", [[10.0, 20.0], [30.0, 40.0]], [1, 0]),
    ]


def test_sam2_service_refine_rejects_unknown_runtime_session() -> None:
    """Reject refine requests when runtime state was never opened."""
    with pytest.raises(Sam2SessionNotFoundError):
        Sam2Service().refine(
            session_id="sam2-session-1",
            frame_idx=2,
            object_id="object-1",
            positive_points=((10.0, 20.0),),
        )


def test_sam2_service_refine_requires_seed_or_points(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """Reject no-op refine requests that provide neither seed nor points."""
    video_path = tmp_path / "video.mp4"
    video_path.write_bytes(b"video")
    config_path = tmp_path / "sam2" / "configs" / "sam2.1" / "sam2.1_hiera_t.yaml"
    config_path.parent.mkdir(parents=True)
    config_path.write_text("model: {}", encoding="utf-8")
    checkpoint_path = tmp_path / "sam2.1_hiera_tiny.pt"
    checkpoint_path.write_bytes(b"checkpoint")
    monkeypatch.setenv("SAM2_CONFIG_PATH", str(config_path))
    monkeypatch.setenv("SAM2_CHECKPOINT_PATH", str(checkpoint_path))

    service = Sam2Service(
        predictor_loader=lambda _config: Sam2LoadedPredictor(
            predictor=_FakeRuntimePredictor(),
            torch_module=cast(_TorchModule, _FakeTorchModule()),
            device_type="cpu",
        )
    )
    service.create_session(session_id="sam2-session-1", video_path=video_path)

    with pytest.raises(Sam2RuntimeExecutionError, match="requires one persisted seed mask"):
        service.refine(
            session_id="sam2-session-1",
            frame_idx=2,
            object_id="object-1",
        )


def test_refine_point_inputs_and_seed_mask_helpers_cover_empty_and_populated_inputs() -> None:
    """Build refine point arrays and decode persisted PNG seed masks."""
    empty_points, empty_labels = _build_refine_point_inputs(
        positive_points=(),
        negative_points=(),
    )
    populated_points, populated_labels = _build_refine_point_inputs(
        positive_points=((10.0, 20.0),),
        negative_points=((30.0, 40.0),),
    )
    decoded_mask = _decode_seed_mask_png(seed_mask_png_bytes=_make_seed_mask_png())

    assert empty_points is None
    assert empty_labels is None
    assert populated_points is not None
    assert populated_labels is not None
    assert cast(_ArrayLike, populated_points).tolist() == [[10.0, 20.0], [30.0, 40.0]]
    assert cast(_ArrayLike, populated_labels).tolist() == [1, 0]
    assert cast(_ArrayLike, decoded_mask).tolist() == [[False, True], [True, False]]


def test_sam2_service_propagate_uses_runtime_and_filters_requested_objects(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """Load configured runtime lazily and encode propagated masks for requested objects only."""
    video_path = tmp_path / "video.mp4"
    video_path.write_bytes(b"video")
    config_path = tmp_path / "sam2" / "configs" / "sam2.1" / "sam2.1_hiera_t.yaml"
    config_path.parent.mkdir(parents=True)
    config_path.write_text("model: {}", encoding="utf-8")
    checkpoint_path = tmp_path / "sam2.1_hiera_tiny.pt"
    checkpoint_path.write_bytes(b"checkpoint")
    monkeypatch.setenv("SAM2_CONFIG_PATH", str(config_path))
    monkeypatch.setenv("SAM2_CHECKPOINT_PATH", str(checkpoint_path))

    predictor = _FakeRuntimePredictor(
        propagation_sequences=[
            (
                (
                    2,
                    ("object-1", "object-2"),
                    _FakeMaskLogits(
                        [
                            [[[-1.0, 2.0], [2.0, -1.0]]],
                            [[[2.0, 2.0], [-1.0, -1.0]]],
                        ]
                    ),
                ),
                (
                    3,
                    ("object-2",),
                    _FakeMaskLogits([[[[2.0, 2.0], [-1.0, -1.0]]]]),
                ),
            )
        ]
    )
    loaded_configs: list[Sam2RuntimeConfig] = []

    def load_predictor(config: Sam2RuntimeConfig) -> Sam2LoadedPredictor:
        loaded_configs.append(config)
        return Sam2LoadedPredictor(
            predictor=predictor,
            torch_module=cast(_TorchModule, _FakeTorchModule()),
            device_type="cpu",
        )

    service = Sam2Service(predictor_loader=load_predictor)
    service.create_session(session_id="sam2-session-1", video_path=video_path)

    results = list(
        service.propagate(
            session_id="sam2-session-1",
            start_frame_idx=2,
            end_frame_idx=4,
            direction="forward",
            object_ids=("object-1",),
        )
    )

    assert loaded_configs == [
        Sam2RuntimeConfig(
            config_name="configs/sam2.1/sam2.1_hiera_t.yaml",
            checkpoint_path=checkpoint_path.resolve(),
            device_name=None,
        )
    ]
    assert predictor.init_state_calls == [str(video_path.resolve())]
    assert predictor.propagation_calls == [(2, 2, False)]
    assert [result.frame_idx for result in results] == [2]
    assert [result.object_results[0].object_id for result in results] == ["object-1"]
    assert results[0].object_results[0].mask_png_bytes.startswith(b"\x89PNG\r\n\x1a\n")
    assert results[0].object_results[0].mask_confidence is None


def test_sam2_service_propagate_maps_both_mode_to_forward_then_reverse(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """Map `both` direction into forward then reverse SAM2 runtime calls."""
    video_path = tmp_path / "video.mp4"
    video_path.write_bytes(b"video")
    config_path = tmp_path / "sam2" / "configs" / "sam2.1" / "sam2.1_hiera_t.yaml"
    config_path.parent.mkdir(parents=True)
    config_path.write_text("model: {}", encoding="utf-8")
    checkpoint_path = tmp_path / "sam2.1_hiera_tiny.pt"
    checkpoint_path.write_bytes(b"checkpoint")
    monkeypatch.setenv("SAM2_CONFIG_PATH", str(config_path))
    monkeypatch.setenv("SAM2_CHECKPOINT_PATH", str(checkpoint_path))

    predictor = _FakeRuntimePredictor(
        propagation_sequences=[
            (),
            (),
        ]
    )

    service = Sam2Service(
        predictor_loader=lambda _config: Sam2LoadedPredictor(
            predictor=predictor,
            torch_module=cast(_TorchModule, _FakeTorchModule()),
            device_type="cpu",
        )
    )
    service.create_session(session_id="sam2-session-1", video_path=video_path)

    assert (
        list(
            service.propagate(
                session_id="sam2-session-1",
                start_frame_idx=7,
                end_frame_idx=5,
                direction="both",
                object_ids=("object-1",),
            )
        )
        == []
    )
    assert predictor.propagation_calls == [
        (7, None, False),
        (7, 2, True),
    ]


def test_sam2_service_propagate_maps_both_mode_forward_limit_when_end_is_ahead(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """Respect existing both-mode semantics when end frame is ahead of the seed frame."""
    video_path = tmp_path / "video.mp4"
    video_path.write_bytes(b"video")
    config_path = tmp_path / "sam2" / "configs" / "sam2.1" / "sam2.1_hiera_t.yaml"
    config_path.parent.mkdir(parents=True)
    config_path.write_text("model: {}", encoding="utf-8")
    checkpoint_path = tmp_path / "sam2.1_hiera_tiny.pt"
    checkpoint_path.write_bytes(b"checkpoint")
    monkeypatch.setenv("SAM2_CONFIG_PATH", str(config_path))
    monkeypatch.setenv("SAM2_CHECKPOINT_PATH", str(checkpoint_path))

    predictor = _FakeRuntimePredictor(
        propagation_sequences=[
            (),
            (),
        ]
    )

    service = Sam2Service(
        predictor_loader=lambda _config: Sam2LoadedPredictor(
            predictor=predictor,
            torch_module=cast(_TorchModule, _FakeTorchModule()),
            device_type="cpu",
        )
    )
    service.create_session(session_id="sam2-session-1", video_path=video_path)

    assert (
        list(
            service.propagate(
                session_id="sam2-session-1",
                start_frame_idx=7,
                end_frame_idx=9,
                direction="both",
                object_ids=("object-1",),
            )
        )
        == []
    )
    assert predictor.propagation_calls == [
        (7, 2, False),
        (7, None, True),
    ]


def test_sam2_service_propagate_maps_both_mode_backward_only_when_end_matches_start(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """Skip useless forward runtime work when both-mode boundary equals the seed frame."""
    video_path = tmp_path / "video.mp4"
    video_path.write_bytes(b"video")
    config_path = tmp_path / "sam2" / "configs" / "sam2.1" / "sam2.1_hiera_t.yaml"
    config_path.parent.mkdir(parents=True)
    config_path.write_text("model: {}", encoding="utf-8")
    checkpoint_path = tmp_path / "sam2.1_hiera_tiny.pt"
    checkpoint_path.write_bytes(b"checkpoint")
    monkeypatch.setenv("SAM2_CONFIG_PATH", str(config_path))
    monkeypatch.setenv("SAM2_CHECKPOINT_PATH", str(checkpoint_path))

    predictor = _FakeRuntimePredictor(
        propagation_sequences=[
            (),
        ]
    )

    service = Sam2Service(
        predictor_loader=lambda _config: Sam2LoadedPredictor(
            predictor=predictor,
            torch_module=cast(_TorchModule, _FakeTorchModule()),
            device_type="cpu",
        )
    )
    service.create_session(session_id="sam2-session-1", video_path=video_path)

    assert (
        list(
            service.propagate(
                session_id="sam2-session-1",
                start_frame_idx=7,
                end_frame_idx=7,
                direction="both",
                object_ids=("object-1",),
            )
        )
        == []
    )
    assert predictor.propagation_calls == [
        (7, None, True),
    ]


def test_sam2_service_propagate_rejects_missing_runtime_configuration(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """Raise explicit setup error instead of placeholder propagation failure."""
    video_path = tmp_path / "video.mp4"
    video_path.write_bytes(b"video")
    monkeypatch.delenv("SAM2_CONFIG_PATH", raising=False)
    monkeypatch.delenv("SAM2_CHECKPOINT_PATH", raising=False)

    service = Sam2Service()
    service.create_session(session_id="sam2-session-1", video_path=video_path)

    with pytest.raises(Sam2RuntimeNotConfiguredError, match="SAM2 runtime not configured"):
        list(
            service.propagate(
                session_id="sam2-session-1",
                start_frame_idx=2,
                end_frame_idx=4,
                direction="forward",
                object_ids=("object-1",),
            )
        )


def test_load_runtime_config_from_env_accepts_configs_value_and_missing_checkpoint(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """Resolve config names directly and reject missing checkpoint files."""
    checkpoint_path = tmp_path / "sam2.1_hiera_tiny.pt"
    checkpoint_path.write_bytes(b"checkpoint")
    monkeypatch.setenv("SAM2_CONFIG_PATH", "configs/sam2.1/sam2.1_hiera_t.yaml")
    monkeypatch.setenv("SAM2_CHECKPOINT_PATH", str(checkpoint_path))

    runtime_config = _load_runtime_config_from_env()

    assert runtime_config == Sam2RuntimeConfig(
        config_name="configs/sam2.1/sam2.1_hiera_t.yaml",
        checkpoint_path=checkpoint_path.resolve(),
        device_name=None,
    )

    monkeypatch.setenv("SAM2_CHECKPOINT_PATH", str(tmp_path / "missing.pt"))
    with pytest.raises(Sam2RuntimeNotConfiguredError, match="checkpoint file not found"):
        _load_runtime_config_from_env()


def test_normalize_sam2_config_name_rejects_missing_or_non_configs_paths(
    tmp_path: Path,
) -> None:
    """Reject config paths that do not exist or do not map into SAM2 configs."""
    with pytest.raises(Sam2RuntimeNotConfiguredError, match="config file not found"):
        _normalize_sam2_config_name(str(tmp_path / "missing.yaml"))

    non_config_path = tmp_path / "plain.yaml"
    non_config_path.write_text("model: {}", encoding="utf-8")
    with pytest.raises(
        Sam2RuntimeNotConfiguredError,
        match="must point to a file under `configs/`",
    ):
        _normalize_sam2_config_name(str(non_config_path))


def test_load_real_sam2_predictor_handles_dependency_error_and_success(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """Wrap missing deps clearly and build predictor with resolved device when available."""
    runtime_config = Sam2RuntimeConfig(
        config_name="configs/sam2.1/sam2.1_hiera_t.yaml",
        checkpoint_path=tmp_path / "sam2.1_hiera_tiny.pt",
        device_name="cuda",
    )

    def import_missing(_name: str) -> object:
        raise ModuleNotFoundError("missing module")

    monkeypatch.setattr("app.services.sam2.importlib.import_module", import_missing)
    with pytest.raises(Sam2RuntimeDependencyError, match="dependency missing"):
        _load_real_sam2_predictor(runtime_config)

    predictor = _FakeRuntimePredictor()
    build_module = _FakeSam2BuildModule(predictor)
    torch_module = _FakeTorchModule(cuda_available=True, cuda_major=8)

    def import_success(name: str) -> object:
        if name == "torch":
            return torch_module
        if name == "sam2.build_sam":
            return build_module
        raise ModuleNotFoundError(name)

    monkeypatch.setattr("app.services.sam2.importlib.import_module", import_success)
    loaded_predictor = _load_real_sam2_predictor(runtime_config)

    assert loaded_predictor.predictor is predictor
    assert loaded_predictor.device_type == "cuda"
    assert build_module.calls == [
        (
            "configs/sam2.1/sam2.1_hiera_t.yaml",
            str(runtime_config.checkpoint_path),
            "cuda",
        )
    ]
    assert torch_module.backends.cuda.matmul.allow_tf32 is True
    assert torch_module.backends.cudnn.allow_tf32 is True

    failing_build_module = SimpleNamespace(
        build_sam2_video_predictor=lambda *_args, **_kwargs: (_ for _ in ()).throw(
            RuntimeError("bad config")
        )
    )

    def import_bad_build(name: str) -> object:
        if name == "torch":
            return torch_module
        if name == "sam2.build_sam":
            return failing_build_module
        raise ModuleNotFoundError(name)

    monkeypatch.setattr("app.services.sam2.importlib.import_module", import_bad_build)
    with pytest.raises(Sam2RuntimeNotConfiguredError, match="failed to load configured predictor"):
        _load_real_sam2_predictor(runtime_config)


def test_resolve_runtime_device_type_handles_invalid_and_auto_modes() -> None:
    """Cover explicit invalid devices and automatic cuda or mps or cpu fallbacks."""
    with pytest.raises(Sam2RuntimeNotConfiguredError, match="must be one of"):
        _resolve_runtime_device_type(
            torch_module=cast(_TorchModule, _FakeTorchModule()),
            configured_device_name="bad",
        )

    with pytest.raises(Sam2RuntimeNotConfiguredError, match="CUDA is not available"):
        _resolve_runtime_device_type(
            torch_module=cast(_TorchModule, _FakeTorchModule()),
            configured_device_name="cuda",
        )

    with pytest.raises(Sam2RuntimeNotConfiguredError, match="MPS is not available"):
        _resolve_runtime_device_type(
            torch_module=cast(_TorchModule, _FakeTorchModule()),
            configured_device_name="mps",
        )

    assert (
        _resolve_runtime_device_type(
            torch_module=cast(_TorchModule, _FakeTorchModule(cuda_available=True)),
            configured_device_name=None,
        )
        == "cuda"
    )
    assert (
        _resolve_runtime_device_type(
            torch_module=cast(_TorchModule, _FakeTorchModule(mps_available=True)),
            configured_device_name=None,
        )
        == "mps"
    )
    assert (
        _resolve_runtime_device_type(
            torch_module=cast(_TorchModule, _FakeTorchModule()),
            configured_device_name=None,
        )
        == "cpu"
    )


def test_prompt_runtime_context_and_mask_encoding_cover_error_paths(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """Cover cuda autocast plus empty-mask, missing-object, and missing-Pillow errors."""
    predictor = _FakeRuntimePredictor()
    torch_module = _FakeTorchModule(cuda_available=True)
    loaded_predictor = Sam2LoadedPredictor(
        predictor=predictor,
        torch_module=cast(_TorchModule, torch_module),
        device_type="cuda",
    )

    with _prompt_runtime_context(loaded_predictor=loaded_predictor):
        pass

    assert torch_module.inference_mode_calls == 1
    assert torch_module.autocast_calls == [("cuda", torch_module.bfloat16)]

    with pytest.raises(Sam2RuntimeExecutionError, match="did not include requested object id"):
        _encode_prompt_mask_png(
            object_id="missing",
            object_ids=["object-1"],
            mask_logits=_FakeMaskLogits([[[[-1.0, 2.0], [2.0, -1.0]]]]),
            loaded_predictor=Sam2LoadedPredictor(
                predictor=predictor,
                torch_module=cast(_TorchModule, _FakeTorchModule()),
                device_type="cpu",
            ),
        )

    with pytest.raises(Sam2RuntimeExecutionError, match="empty mask"):
        _encode_prompt_mask_png(
            object_id="object-1",
            object_ids=["object-1"],
            mask_logits=_FakeMaskLogits([[[]]]),
            loaded_predictor=Sam2LoadedPredictor(
                predictor=predictor,
                torch_module=cast(_TorchModule, _FakeTorchModule()),
                device_type="cpu",
            ),
        )

    original_import = __import__

    def import_without_pil(
        name: str,
        globals: dict[str, object] | None = None,
        locals: dict[str, object] | None = None,
        fromlist: Sequence[str] = (),
        level: int = 0,
    ) -> object:
        if name == "PIL":
            raise ModuleNotFoundError("PIL")
        return original_import(name, globals, locals, fromlist, level)

    monkeypatch.setattr("builtins.__import__", import_without_pil)
    with pytest.raises(Sam2RuntimeDependencyError, match="Pillow is required"):
        _encode_prompt_mask_png(
            object_id="object-1",
            object_ids=["object-1"],
            mask_logits=_FakeMaskLogits([[[[-1.0, 2.0], [2.0, -1.0]]]]),
            loaded_predictor=Sam2LoadedPredictor(
                predictor=predictor,
                torch_module=cast(_TorchModule, _FakeTorchModule()),
                device_type="cpu",
            ),
        )


def test_create_or_reuse_sam2_session_reopens_persisted_session_when_runtime_missing(
    tmp_path: Path,
) -> None:
    """Recreate in-memory runtime state when DB session exists but process state does not."""
    video_path = tmp_path / "video.mp4"
    video_path.write_bytes(b"video")

    with _open_session(tmp_path / "reopen-runtime.sqlite3") as session:
        session.add(
            Video(
                id="video-1",
                source_path=str(video_path),
                display_name="video.mp4",
                frame_count=12,
                fps=24.0,
                width=400,
                height=200,
                duration_seconds=1.0,
            )
        )
        _seed_open_sam2_session(session)

        sam2_service = Sam2Service()
        result = create_or_reuse_sam2_session(
            session=session,
            video_id="video-1",
            sam2_service=sam2_service,
        )

    assert result == Sam2SessionResult(session_id="sam2-session-1", reused=True)
    assert sam2_service.has_session(session_id="sam2-session-1") is True


def test_prompt_sam2_box_rehydrates_runtime_state_after_process_restart(tmp_path: Path) -> None:
    """Recreate in-memory runtime state from open DB session before prompt execution."""
    video_path = tmp_path / "video.mp4"
    video_path.write_bytes(b"video")
    sam2_service = _FakeSam2Service()

    with _open_session(tmp_path / "prompt-rehydrate.sqlite3") as session:
        session.add(
            Video(
                id="video-1",
                source_path=str(video_path),
                display_name="video.mp4",
                frame_count=12,
                fps=24.0,
                width=400,
                height=200,
                duration_seconds=1.0,
            )
        )
        _seed_open_sam2_session(session)

        stored_annotation = prompt_sam2_box(
            session=session,
            video_id="video-1",
            session_id="sam2-session-1",
            frame_idx=2,
            object_id="object-1",
            box_xyxy_px=(10, 20, 40, 60),
            sam2_service=sam2_service,
        )

    assert stored_annotation.object_id == "object-1"
    assert sam2_service.has_session(session_id="sam2-session-1") is True


def test_request_job_cancellation_marks_active_jobs_and_keeps_terminal_status(
    tmp_path: Path,
) -> None:
    """Return cancelling for active jobs and preserve terminal job state."""
    with _open_session(tmp_path / "job-cancel.sqlite3") as session:
        session.add(
            Job(
                id="job-active",
                type="sam2_propagation",
                video_id="video-1",
                object_id=None,
                session_id="sam2-session-1",
                status="queued",
                progress_current=0,
                progress_total=2,
                payload_json={},
                result_json=None,
                error_message=None,
                cancel_requested_at=None,
                started_at=None,
                completed_at=None,
            )
        )
        session.add(
            Job(
                id="job-done",
                type="sam2_propagation",
                video_id="video-1",
                object_id=None,
                session_id="sam2-session-1",
                status="completed",
                progress_current=2,
                progress_total=2,
                payload_json={},
                result_json={"persisted_frame_count": 2},
                error_message=None,
                cancel_requested_at=None,
                started_at=None,
                completed_at=datetime(2026, 4, 22, 0, 5, 0),
            )
        )
        session.commit()

        active_result = request_job_cancellation(session=session, job_id="job-active")
        terminal_result = request_job_cancellation(session=session, job_id="job-done")
        active_job = session.get(Job, "job-active")

    assert active_result.status == "cancelling"
    assert terminal_result.status == "completed"
    assert active_job is not None
    assert active_job.cancel_requested_at is not None


def test_request_job_cancellation_and_get_job_status_reject_missing_jobs(
    tmp_path: Path,
) -> None:
    """Reject lookups for unknown job ids."""
    with _open_session(tmp_path / "missing-job.sqlite3") as session:
        with pytest.raises(JobNotFoundError):
            request_job_cancellation(session=session, job_id="missing-job")

        with pytest.raises(JobNotFoundError):
            get_job_status(session=session, job_id="missing-job")


def test_start_sam2_propagation_job_completes_immediately_for_empty_target_range(
    tmp_path: Path,
) -> None:
    """Complete synchronously when resolved propagation target range is empty."""
    with _open_session(tmp_path / "empty-target.sqlite3") as session:
        _seed_video(session)
        _seed_open_sam2_session(session)

        result = start_sam2_propagation_job(
            session=session,
            video_id="video-1",
            session_id="sam2-session-1",
            start_frame_idx=7,
            end_frame_idx=7,
            direction="forward",
            object_ids=("object-1",),
            sam2_service=Sam2Service(),
        )
        job_status = get_job_status(session=session, job_id=result.job_id)

    assert result.status == "completed"
    assert result.progress_current == 0
    assert result.progress_total == 0
    assert job_status.status == "completed"
    assert job_status.result_json == {
        "object_ids": ["object-1"],
        "persisted_frame_count": 0,
        "persisted_frame_indices": [],
    }


def test_create_or_reuse_sam2_session_reuses_open_runtime_without_reopening(
    tmp_path: Path,
) -> None:
    """Reuse persisted session when runtime already owns it."""
    video_path = tmp_path / "video.mp4"
    video_path.write_bytes(b"video")

    with _open_session(tmp_path / "reuse-session.sqlite3") as session:
        session.add(
            Video(
                id="video-1",
                source_path=str(video_path),
                display_name="video.mp4",
                frame_count=12,
                fps=24.0,
                width=400,
                height=200,
                duration_seconds=1.0,
            )
        )
        _seed_open_sam2_session(session)

        sam2_service = Sam2Service()
        sam2_service.create_session(session_id="sam2-session-1", video_path=video_path)

        result = create_or_reuse_sam2_session(
            session=session,
            video_id="video-1",
            sam2_service=sam2_service,
        )

    assert result == Sam2SessionResult(session_id="sam2-session-1", reused=True)
    assert sam2_service.has_session(session_id="sam2-session-1") is True


def test_close_sam2_session_keeps_closed_sessions_unchanged(tmp_path: Path) -> None:
    """Skip runtime close when persisted session is already terminal."""
    with _open_session(tmp_path / "closed-session.sqlite3") as session:
        _seed_video(session)
        _seed_closed_sam2_session(session)
        sam2_service = Sam2Service()

        close_sam2_session(
            session=session,
            video_id="video-1",
            session_id="sam2-session-1",
            sam2_service=sam2_service,
        )

        persisted_session = session.get(Sam2Session, "sam2-session-1")

    assert persisted_session is not None
    assert persisted_session.status == "closed"
    assert sam2_service.has_session(session_id="sam2-session-1") is False


def test_prompt_sam2_box_rejects_out_of_range_frame_idx(tmp_path: Path) -> None:
    """Reject prompt requests outside persisted frame bounds."""
    with _open_session(tmp_path / "prompt-range.sqlite3") as session:
        _seed_video(session)
        _seed_open_sam2_session(session)

        with pytest.raises(FrameIndexOutOfRangeError, match="between 0 and 11"):
            prompt_sam2_box(
                session=session,
                video_id="video-1",
                session_id="sam2-session-1",
                frame_idx=12,
                object_id="object-1",
                box_xyxy_px=(10, 20, 30, 40),
                sam2_service=_FakeSam2Service(),
            )


def test_start_sam2_propagation_job_accepts_none_end_frame_and_both_forward_limit(
    tmp_path: Path,
) -> None:
    """Allow open-ended propagation requests and both-mode forward limits."""
    with _open_session(tmp_path / "open-ended-propagation.sqlite3") as session:
        video_path = tmp_path / "video-1.mp4"
        video_path.write_bytes(b"video")
        _seed_video(session)
        _seed_open_sam2_session(session)
        persisted_video = session.get(Video, "video-1")
        assert persisted_video is not None
        persisted_video.source_path = str(video_path)
        session.commit()
        session_factory = sessionmaker(session.get_bind(), expire_on_commit=False)
        sam2_service = _FakeSam2Service()
        sam2_service.create_session(session_id="sam2-session-1", video_path=video_path)

        result = start_sam2_propagation_job(
            session=session,
            video_id="video-1",
            session_id="sam2-session-1",
            start_frame_idx=7,
            end_frame_idx=None,
            direction="backward",
            object_ids=("object-1",),
            sam2_service=sam2_service,
            session_factory=session_factory,
        )

    assert result.status == "queued"
    assert result.progress_total == 7
    assert _resolve_target_frame_indices(
        frame_count=12,
        start_frame_idx=7,
        end_frame_idx=9,
        direction="both",
    ) == [8, 9, 6, 5, 4, 3, 2, 1, 0]


def test_run_sam2_propagation_job_cancels_before_consuming_iterator(
    tmp_path: Path,
) -> None:
    """Mark queued job cancelled when cancellation is already requested."""
    with _open_session(tmp_path / "cancel-before-next.sqlite3") as session:
        session.add(_create_job(cancel_requested_at=datetime(2026, 4, 22, 0, 1, 0)))
        session.commit()
        session_factory = sessionmaker(session.get_bind(), expire_on_commit=False)

    _run_sam2_propagation_job(
        job_id="job-1",
        video_id="video-1",
        session_id="sam2-session-1",
        start_frame_idx=7,
        end_frame_idx=9,
        direction="forward",
        object_ids=("object-1",),
        target_frame_indices=(8, 9),
        sam2_service=_FakeSam2Service(
            propagation_frames=(
                Sam2PropagationFrameResult(
                    frame_idx=8,
                    object_results=(
                        Sam2PropagationMaskResult(
                            object_id="object-1",
                            mask_png_bytes=b"mask",
                        ),
                    ),
                ),
            ),
        ),
        session_factory=session_factory,
    )

    with session_factory() as session:
        job = session.get(Job, "job-1")

    assert job is not None
    assert job.status == "cancelled"
    assert job.progress_current == 0


def test_run_sam2_propagation_job_skips_non_target_frames_other_objects_and_duplicates(
    monkeypatch: pytest.MonkeyPatch,
    tmp_path: Path,
) -> None:
    """Persist only target frames for requested objects and count each frame once."""
    persisted_masks: list[tuple[int, str]] = []

    monkeypatch.setattr(
        "app.services.sam2.upsert_sam2_propagated_frame_annotation",
        lambda **kwargs: persisted_masks.append((kwargs["frame_idx"], kwargs["object_id"])),
    )

    with _open_session(tmp_path / "propagation-filters.sqlite3") as session:
        session.add(_create_job())
        session.commit()
        session_factory = sessionmaker(session.get_bind(), expire_on_commit=False)

    _run_sam2_propagation_job(
        job_id="job-1",
        video_id="video-1",
        session_id="sam2-session-1",
        start_frame_idx=7,
        end_frame_idx=9,
        direction="forward",
        object_ids=("object-1",),
        target_frame_indices=(8, 9),
        sam2_service=_FakeSam2Service(
            propagation_frames=(
                Sam2PropagationFrameResult(
                    frame_idx=10,
                    object_results=(
                        Sam2PropagationMaskResult(
                            object_id="object-1",
                            mask_png_bytes=b"skip-frame",
                        ),
                    ),
                ),
                Sam2PropagationFrameResult(
                    frame_idx=8,
                    object_results=(
                        Sam2PropagationMaskResult(
                            object_id="object-2",
                            mask_png_bytes=b"wrong-object",
                        ),
                        Sam2PropagationMaskResult(
                            object_id="object-1",
                            mask_png_bytes=b"persist-frame-8",
                        ),
                    ),
                ),
                Sam2PropagationFrameResult(
                    frame_idx=8,
                    object_results=(
                        Sam2PropagationMaskResult(
                            object_id="object-1",
                            mask_png_bytes=b"duplicate-frame-8",
                        ),
                    ),
                ),
            ),
        ),
        session_factory=session_factory,
    )

    with session_factory() as session:
        job = session.get(Job, "job-1")

    assert persisted_masks == [(8, "object-1"), (8, "object-1")]
    assert job is not None
    assert job.status == "completed"
    assert job.progress_current == 1
    assert job.result_json == {
        "object_ids": ["object-1"],
        "persisted_frame_count": 1,
        "persisted_frame_indices": [8],
    }


def test_run_sam2_propagation_job_marks_failed_when_runtime_raises(
    tmp_path: Path,
) -> None:
    """Persist failed job state when propagation iterator setup crashes."""
    with _open_session(tmp_path / "propagation-failed.sqlite3") as session:
        session.add(_create_job())
        session.commit()
        session_factory = sessionmaker(session.get_bind(), expire_on_commit=False)

    _run_sam2_propagation_job(
        job_id="job-1",
        video_id="video-1",
        session_id="sam2-session-1",
        start_frame_idx=7,
        end_frame_idx=9,
        direction="forward",
        object_ids=("object-1",),
        target_frame_indices=(8, 9),
        sam2_service=_FakeSam2Service(propagate_error=RuntimeError("propagate broke")),
        session_factory=session_factory,
    )

    with session_factory() as session:
        job = session.get(Job, "job-1")

    assert job is not None
    assert job.status == "failed"
    assert job.error_message == "propagate broke"


def test_create_or_reuse_sam2_session_rejects_missing_video_or_missing_source(
    tmp_path: Path,
) -> None:
    """Reject session creation when indexed video or local source is unavailable."""
    with _open_session(tmp_path / "missing-video-or-source.sqlite3") as session:
        with pytest.raises(Sam2VideoNotFoundError):
            create_or_reuse_sam2_session(
                session=session,
                video_id="missing-video",
                sam2_service=Sam2Service(),
            )

        _seed_video(session)

        with pytest.raises(Sam2VideoSourceNotAvailableError):
            create_or_reuse_sam2_session(
                session=session,
                video_id="video-1",
                sam2_service=Sam2Service(),
            )


def test_get_open_sam2_session_and_get_job_or_raise_reject_missing_rows(
    tmp_path: Path,
) -> None:
    """Reject missing persisted SAM2 session and missing job rows."""
    with _open_session(tmp_path / "missing-sam2-rows.sqlite3") as session:
        _seed_video(session)

        with pytest.raises(Sam2SessionNotFoundError):
            _get_open_sam2_session(
                session=session,
                video_id="video-1",
                session_id="missing-session",
            )

        with pytest.raises(JobNotFoundError):
            _get_job_or_raise(session=session, job_id="missing-job")
