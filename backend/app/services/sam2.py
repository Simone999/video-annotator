"""SAM2 adapter and persisted session lifecycle helpers."""

import contextlib
import importlib
import os
from collections.abc import Callable, Iterator, Sequence
from dataclasses import dataclass
from datetime import datetime
from functools import cache
from io import BytesIO
from pathlib import Path
from threading import RLock, Thread
from typing import Protocol, cast
from uuid import uuid4

from sqlalchemy import select
from sqlalchemy.orm import Session, sessionmaker

from app.db import Job, Sam2Session, Video
from app.db.session import get_session_factory

from .frame_annotations import (
    StoredFrameAnnotation,
    upsert_sam2_frame_annotation,
    upsert_sam2_propagated_frame_annotation,
)
from .video_catalog import get_indexed_video_by_id
from .video_frames import FrameIndexOutOfRangeError


class Sam2VideoNotFoundError(Exception):
    """Raised when SAM2 route targets an unknown indexed video."""


class Sam2VideoSourceNotAvailableError(Exception):
    """Raised when indexed video metadata points at a missing local file."""


class Sam2SessionNotFoundError(Exception):
    """Raised when requested session metadata is missing for the video."""


class JobNotFoundError(Exception):
    """Raised when background job metadata does not exist."""


class InvalidPropagationRangeError(Exception):
    """Raised when propagation range does not fit requested direction."""


class Sam2RuntimeUnavailableError(Exception):
    """Raised when prompt runtime cannot serve the request."""


class Sam2RuntimeNotConfiguredError(Sam2RuntimeUnavailableError):
    """Raised when runtime config or model files are missing."""


class Sam2RuntimeDependencyError(Sam2RuntimeUnavailableError):
    """Raised when optional runtime dependencies are not installed."""


class Sam2RuntimeExecutionError(Sam2RuntimeUnavailableError):
    """Raised when runtime returns an unusable prompt result."""


@dataclass(slots=True)
class Sam2SessionResult:
    """Persisted SAM2 session lifecycle payload."""

    session_id: str
    reused: bool


@dataclass(slots=True)
class Sam2PromptResult:
    """In-memory SAM2 prompt result for one same-frame mask."""

    mask_png_bytes: bytes
    mask_confidence: float | None = None


@dataclass(slots=True)
class Sam2PropagationMaskResult:
    """One propagated object mask for one frame."""

    object_id: str
    mask_png_bytes: bytes
    mask_confidence: float | None = None


@dataclass(slots=True)
class Sam2PropagationFrameResult:
    """One propagated frame payload returned by the SAM2 adapter."""

    frame_idx: int
    object_results: Sequence[Sam2PropagationMaskResult]


@dataclass(slots=True)
class Sam2PropagationJobResult:
    """Create-job response payload for SAM2 propagation."""

    job_id: str
    status: str
    progress_current: int
    progress_total: int


@dataclass(slots=True)
class JobStatusResult:
    """Persisted job status payload for API reads."""

    job_id: str
    type: str
    status: str
    progress_current: int
    progress_total: int
    result_json: dict[str, object] | None
    error_message: str | None


@dataclass(slots=True)
class JobCancelResult:
    """Cancel-request response payload for one background job."""

    job_id: str
    status: str


@dataclass(slots=True)
class Sam2RuntimeConfig:
    """Runtime config resolved from environment variables."""

    config_name: str
    checkpoint_path: Path
    device_name: str | None = None


class _Sam2VideoPredictor(Protocol):
    """Runtime predictor contract used by the backend adapter."""

    def init_state(
        self,
        video_path: str,
        offload_video_to_cpu: bool = False,
        offload_state_to_cpu: bool = False,
        async_loading_frames: bool = False,
    ) -> object:
        """Create one predictor state for a video."""
        ...

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
    ) -> tuple[int, Sequence[str], "_MaskLogits"]:
        """Run one prompt interaction and return frame masks."""
        ...

    def propagate_in_video(
        self,
        inference_state: object,
        start_frame_idx: int | None = None,
        max_frame_num_to_track: int | None = None,
        reverse: bool = False,
    ) -> Iterator[tuple[int, Sequence[str], "_MaskLogits"]]:
        """Yield frame-wise propagation results for current inference state."""
        ...


class _MaskTensor(Protocol):
    """Small tensor-like contract used for prompt mask encoding."""

    def __gt__(self, threshold: float) -> "_MaskTensor":
        """Threshold tensor values."""
        ...

    def detach(self) -> "_MaskTensor":
        """Detach from runtime graph state."""
        ...

    def to(
        self,
        *,
        device: str | None = None,
        dtype: object | None = None,
    ) -> "_MaskTensor":
        """Move tensor or cast dtype."""
        ...

    def tolist(self) -> Sequence[Sequence[bool | float | int]]:
        """Convert tensor into nested Python lists."""
        ...


class _MaskLogits(Protocol):
    """Mask-logit collection returned by prompt runtime."""

    def __getitem__(self, key: tuple[int, int]) -> _MaskTensor:
        """Return one object-channel mask slice."""
        ...


class _TorchDeviceProperties(Protocol):
    """Minimal torch device properties contract."""

    major: int


class _TorchCuda(Protocol):
    """Minimal torch cuda module contract."""

    def is_available(self) -> bool:
        """Return whether CUDA is available."""
        ...

    def get_device_properties(self, device_index: int) -> _TorchDeviceProperties:
        """Return device properties for one CUDA device."""
        ...


class _TorchMatmulBackend(Protocol):
    """Minimal torch matmul backend contract."""

    allow_tf32: bool


class _TorchCudnnBackend(Protocol):
    """Minimal torch cudnn backend contract."""

    allow_tf32: bool


class _TorchMpsBackend(Protocol):
    """Minimal torch MPS backend contract."""

    def is_available(self) -> bool:
        """Return whether MPS is available."""
        ...


class _TorchCudaBackends(Protocol):
    """Minimal torch CUDA backends contract."""

    matmul: _TorchMatmulBackend


class _TorchBackends(Protocol):
    """Minimal torch backends contract."""

    cuda: _TorchCudaBackends
    cudnn: _TorchCudnnBackend
    mps: _TorchMpsBackend | None


class _TorchModule(Protocol):
    """Minimal torch module contract used by runtime loader."""

    uint8: object
    bfloat16: object
    cuda: _TorchCuda
    backends: _TorchBackends

    def inference_mode(self) -> contextlib.AbstractContextManager[object]:
        """Return inference-only context."""
        ...

    def autocast(
        self,
        device_type: str,
        *,
        dtype: object,
    ) -> contextlib.AbstractContextManager[object]:
        """Return autocast context for one device type."""
        ...


@dataclass(slots=True)
class Sam2LoadedPredictor:
    """Loaded real SAM2 predictor plus runtime metadata."""

    predictor: _Sam2VideoPredictor
    torch_module: _TorchModule
    device_type: str


@dataclass(slots=True)
class _Sam2RuntimeSessionState:
    """Tracked runtime state for one persisted session id."""

    video_path: Path
    inference_state: object | None = None


class Sam2Service:
    """Isolated SAM2 adapter with lazy real prompt runtime loading."""

    def __init__(
        self,
        predictor_loader: Callable[[Sam2RuntimeConfig], Sam2LoadedPredictor] | None = None,
    ) -> None:
        """Initialize empty runtime-session registry.

        Args:
            predictor_loader: Optional test seam for real predictor construction.
        """
        self._predictor_loader = predictor_loader
        self._loaded_predictor: Sam2LoadedPredictor | None = None
        self._runtime_lock = RLock()
        self._session_states: dict[str, _Sam2RuntimeSessionState] = {}

    def has_session(self, *, session_id: str) -> bool:
        """Return whether runtime state exists for one persisted session id.

        Args:
            session_id: Persisted session identifier.
        """
        return session_id in self._session_states

    def create_session(self, *, session_id: str, video_path: Path) -> None:
        """Create runtime state for one persisted session id.

        Args:
            session_id: Persisted session identifier.
            video_path: Indexed local source path owned by the backend.
        """
        if not video_path.is_file():
            raise FileNotFoundError(video_path)

        self._session_states[session_id] = _Sam2RuntimeSessionState(video_path=video_path.resolve())

    def close_session(self, *, session_id: str) -> None:
        """Drop runtime state for one persisted session id.

        Args:
            session_id: Persisted session identifier.
        """
        self._session_states.pop(session_id, None)

    def prompt_box(
        self,
        *,
        session_id: str,
        frame_idx: int,
        object_id: str,
        box_xyxy_px: Sequence[int],
    ) -> Sam2PromptResult:
        """Run one same-frame prompt-box operation for persisted session id."""
        session_state = self._session_states.get(session_id)
        if session_state is None:
            raise Sam2SessionNotFoundError(session_id)

        with self._runtime_lock:
            loaded_predictor = self._get_or_load_predictor()
            if session_state.inference_state is None:
                session_state.inference_state = _init_runtime_state(
                    loaded_predictor=loaded_predictor,
                    video_path=session_state.video_path,
                )

            with _prompt_runtime_context(loaded_predictor=loaded_predictor):
                _, object_ids, mask_logits = loaded_predictor.predictor.add_new_points_or_box(
                    inference_state=session_state.inference_state,
                    frame_idx=frame_idx,
                    obj_id=object_id,
                    box=tuple(box_xyxy_px),
                    normalize_coords=False,
                )

        mask_png_bytes = _encode_prompt_mask_png(
            object_id=object_id,
            object_ids=object_ids,
            mask_logits=mask_logits,
            loaded_predictor=loaded_predictor,
        )
        return Sam2PromptResult(mask_png_bytes=mask_png_bytes, mask_confidence=None)

    def propagate(
        self,
        *,
        session_id: str,
        start_frame_idx: int,
        end_frame_idx: int | None,
        direction: str,
        object_ids: Sequence[str],
    ) -> Iterator[Sam2PropagationFrameResult]:
        """Run propagation for one persisted session id."""
        session_state = self._session_states.get(session_id)
        if session_state is None:
            raise Sam2SessionNotFoundError(session_id)

        with self._runtime_lock:
            loaded_predictor = self._get_or_load_predictor()
            if session_state.inference_state is None:
                session_state.inference_state = _init_runtime_state(
                    loaded_predictor=loaded_predictor,
                    video_path=session_state.video_path,
                )

            with _prompt_runtime_context(loaded_predictor=loaded_predictor):
                for reverse, max_frame_num_to_track in _iter_runtime_propagation_calls(
                    start_frame_idx=start_frame_idx,
                    end_frame_idx=end_frame_idx,
                    direction=direction,
                ):
                    for (
                        frame_idx,
                        result_object_ids,
                        mask_logits,
                    ) in loaded_predictor.predictor.propagate_in_video(
                        session_state.inference_state,
                        start_frame_idx=start_frame_idx,
                        max_frame_num_to_track=max_frame_num_to_track,
                        reverse=reverse,
                    ):
                        object_results = _build_propagation_object_results(
                            requested_object_ids=object_ids,
                            result_object_ids=result_object_ids,
                            mask_logits=mask_logits,
                            loaded_predictor=loaded_predictor,
                        )
                        if not object_results:
                            continue

                        yield Sam2PropagationFrameResult(
                            frame_idx=frame_idx,
                            object_results=object_results,
                        )

    def _get_or_load_predictor(self) -> Sam2LoadedPredictor:
        """Return loaded predictor, creating it once on first prompt use."""
        if self._loaded_predictor is None:
            runtime_config = _load_runtime_config_from_env()
            predictor_loader = self._predictor_loader or _load_real_sam2_predictor
            self._loaded_predictor = predictor_loader(runtime_config)

        return self._loaded_predictor


def _load_runtime_config_from_env() -> Sam2RuntimeConfig:
    """Resolve runtime config from explicit environment variables."""
    config_value = os.environ.get("SAM2_CONFIG_PATH")
    checkpoint_value = os.environ.get("SAM2_CHECKPOINT_PATH")
    if config_value is None or checkpoint_value is None:
        raise Sam2RuntimeNotConfiguredError(
            "SAM2 runtime not configured. Set SAM2_CONFIG_PATH and SAM2_CHECKPOINT_PATH."
        )

    checkpoint_path = Path(checkpoint_value).expanduser()
    if not checkpoint_path.is_file():
        raise Sam2RuntimeNotConfiguredError(
            f"SAM2 checkpoint file not found: {checkpoint_path.resolve()}"
        )

    return Sam2RuntimeConfig(
        config_name=_normalize_sam2_config_name(config_value),
        checkpoint_path=checkpoint_path.resolve(),
        device_name=os.environ.get("SAM2_DEVICE"),
    )


def _normalize_sam2_config_name(config_value: str) -> str:
    """Normalize env config input into SAM2 Hydra config name."""
    normalized_value = config_value.replace("\\", "/")
    if normalized_value.startswith("configs/"):
        return normalized_value

    config_path = Path(config_value).expanduser()
    if not config_path.is_file():
        raise Sam2RuntimeNotConfiguredError(f"SAM2 config file not found: {config_path.resolve()}")

    config_parts = config_path.resolve().parts
    if "configs" not in config_parts:
        raise Sam2RuntimeNotConfiguredError(
            "SAM2 config path must point to a file under `configs/` "
            "or already be a `configs/...yaml` value."
        )

    config_index = config_parts.index("configs")
    return Path(*config_parts[config_index:]).as_posix()


def _load_real_sam2_predictor(runtime_config: Sam2RuntimeConfig) -> Sam2LoadedPredictor:
    """Load one real SAM2 video predictor from optional runtime deps."""
    try:
        torch_module = cast(_TorchModule, importlib.import_module("torch"))
        sam2_build_module = importlib.import_module("sam2.build_sam")
    except ModuleNotFoundError as error:
        raise Sam2RuntimeDependencyError(
            "SAM2 runtime dependency missing. "
            "Install backend extra with `uv --project backend sync --extra sam2`."
        ) from error

    device_type = _resolve_runtime_device_type(
        torch_module=torch_module,
        configured_device_name=runtime_config.device_name,
    )
    _configure_torch_runtime(torch_module=torch_module, device_type=device_type)
    try:
        predictor = sam2_build_module.build_sam2_video_predictor(
            runtime_config.config_name,
            str(runtime_config.checkpoint_path),
            device=device_type,
        )
    except Exception as error:
        raise Sam2RuntimeNotConfiguredError(
            "SAM2 runtime failed to load configured predictor. "
            "Check SAM2_CONFIG_PATH, SAM2_CHECKPOINT_PATH, and installed SAM2 assets."
        ) from error
    return Sam2LoadedPredictor(
        predictor=predictor,
        torch_module=torch_module,
        device_type=device_type,
    )


def _resolve_runtime_device_type(
    *,
    torch_module: _TorchModule,
    configured_device_name: str | None,
) -> str:
    """Resolve supported prompt runtime device type."""
    if configured_device_name is not None:
        if configured_device_name not in {"cpu", "cuda", "mps"}:
            raise Sam2RuntimeNotConfiguredError(
                "SAM2_DEVICE must be one of `cpu`, `cuda`, or `mps`."
            )

        if configured_device_name == "cuda" and not torch_module.cuda.is_available():
            raise Sam2RuntimeNotConfiguredError(
                "SAM2 runtime requested `cuda`, but CUDA is not available."
            )

        if configured_device_name == "mps" and not _is_mps_available(torch_module):
            raise Sam2RuntimeNotConfiguredError(
                "SAM2 runtime requested `mps`, but MPS is not available."
            )

        return configured_device_name

    if torch_module.cuda.is_available():
        return "cuda"

    if _is_mps_available(torch_module):
        return "mps"

    return "cpu"


def _is_mps_available(torch_module: _TorchModule) -> bool:
    """Return whether torch MPS backend is available."""
    mps_backend = getattr(torch_module.backends, "mps", None)
    return bool(mps_backend is not None and mps_backend.is_available())


def _configure_torch_runtime(*, torch_module: _TorchModule, device_type: str) -> None:
    """Apply safe torch runtime toggles for selected device."""
    if device_type == "cuda" and torch_module.cuda.get_device_properties(0).major >= 8:
        torch_module.backends.cuda.matmul.allow_tf32 = True
        torch_module.backends.cudnn.allow_tf32 = True


def _init_runtime_state(
    *,
    loaded_predictor: Sam2LoadedPredictor,
    video_path: Path,
) -> object:
    """Initialize predictor state for one persisted video session."""
    with _prompt_runtime_context(loaded_predictor=loaded_predictor):
        return loaded_predictor.predictor.init_state(
            video_path=str(video_path),
            offload_video_to_cpu=loaded_predictor.device_type == "mps",
        )


def _prompt_runtime_context(
    *,
    loaded_predictor: Sam2LoadedPredictor,
) -> contextlib.AbstractContextManager[object]:
    """Return inference/autocast context for one runtime operation."""
    torch_module = loaded_predictor.torch_module
    exit_stack = contextlib.ExitStack()
    exit_stack.enter_context(torch_module.inference_mode())
    if loaded_predictor.device_type == "cuda":
        exit_stack.enter_context(torch_module.autocast("cuda", dtype=torch_module.bfloat16))

    return exit_stack


def _encode_prompt_mask_png(
    *,
    object_id: str,
    object_ids: Sequence[str],
    mask_logits: _MaskLogits,
    loaded_predictor: Sam2LoadedPredictor,
) -> bytes:
    """Encode one requested object mask into grayscale PNG bytes."""
    object_index = _find_object_index(object_ids=object_ids, object_id=object_id)
    if object_index is None:
        raise Sam2RuntimeExecutionError(
            f"SAM2 prompt result did not include requested object id {object_id!r}."
        )

    return _encode_mask_png(
        mask_logits=mask_logits,
        object_index=object_index,
        loaded_predictor=loaded_predictor,
        empty_mask_error="SAM2 prompt returned an empty mask.",
    )


def _iter_runtime_propagation_calls(
    *,
    start_frame_idx: int,
    end_frame_idx: int | None,
    direction: str,
) -> Iterator[tuple[bool, int | None]]:
    """Map app propagation directions onto SAM2 runtime call arguments."""
    if direction == "forward":
        if end_frame_idx is not None and end_frame_idx < start_frame_idx:
            raise InvalidPropagationRangeError(
                "Forward propagation end frame must be greater than or equal to start frame"
            )
        yield (False, _resolve_runtime_track_length(start_frame_idx, end_frame_idx))
        return

    if direction == "backward":
        if end_frame_idx is not None and end_frame_idx > start_frame_idx:
            raise InvalidPropagationRangeError(
                "Backward propagation end frame must be less than or equal to start frame"
            )
        yield (True, _resolve_runtime_track_length(start_frame_idx, end_frame_idx))
        return

    if direction == "both":
        if end_frame_idx is None:
            yield (False, None)
            yield (True, None)
            return

        if end_frame_idx >= start_frame_idx:
            if end_frame_idx > start_frame_idx:
                yield (False, _resolve_runtime_track_length(start_frame_idx, end_frame_idx))
            yield (True, None)
            return

        yield (False, None)
        yield (True, _resolve_runtime_track_length(start_frame_idx, end_frame_idx))
        return

    raise InvalidPropagationRangeError(f"Unsupported propagation direction: {direction}")


def _resolve_runtime_track_length(
    start_frame_idx: int,
    end_frame_idx: int | None,
) -> int | None:
    """Convert inclusive target boundary into SAM2 propagation length."""
    if end_frame_idx is None:
        return None

    return abs(end_frame_idx - start_frame_idx)


def _build_propagation_object_results(
    *,
    requested_object_ids: Sequence[str],
    result_object_ids: Sequence[str],
    mask_logits: _MaskLogits,
    loaded_predictor: Sam2LoadedPredictor,
) -> list[Sam2PropagationMaskResult]:
    """Encode propagated masks for requested object ids present in one frame result."""
    requested_object_id_set = set(requested_object_ids)
    object_results: list[Sam2PropagationMaskResult] = []
    for object_id in result_object_ids:
        if object_id not in requested_object_id_set:
            continue

        object_index = _find_object_index(object_ids=result_object_ids, object_id=object_id)
        assert object_index is not None

        object_results.append(
            Sam2PropagationMaskResult(
                object_id=object_id,
                mask_png_bytes=_encode_mask_png(
                    mask_logits=mask_logits,
                    object_index=object_index,
                    loaded_predictor=loaded_predictor,
                    empty_mask_error="SAM2 propagation returned an empty mask.",
                ),
                mask_confidence=None,
            )
        )

    return object_results


def _encode_mask_png(
    *,
    mask_logits: _MaskLogits,
    object_index: int,
    loaded_predictor: Sam2LoadedPredictor,
    empty_mask_error: str,
) -> bytes:
    """Encode one runtime mask-logit slice into grayscale PNG bytes."""
    try:
        from PIL import Image
    except ModuleNotFoundError as error:
        raise Sam2RuntimeDependencyError(
            "Pillow is required for SAM2 mask PNG encoding. "
            "Install backend extra with `uv --project backend sync --extra sam2`."
        ) from error

    selected_mask_logits = mask_logits[object_index, 0]
    torch_module = loaded_predictor.torch_module
    mask_tensor = (selected_mask_logits > 0.0).detach().to(device="cpu", dtype=torch_module.uint8)
    mask_rows = mask_tensor.tolist()
    mask_height = len(mask_rows)
    mask_width = 0 if mask_height == 0 else len(mask_rows[0])
    if mask_height == 0 or mask_width == 0:
        raise Sam2RuntimeExecutionError(empty_mask_error)

    pixel_bytes = bytes(255 if value else 0 for row in mask_rows for value in row)
    image = Image.frombytes("L", (mask_width, mask_height), pixel_bytes)
    buffer = BytesIO()
    image.save(buffer, format="PNG")
    return buffer.getvalue()


def _find_object_index(*, object_ids: Sequence[str], object_id: str) -> int | None:
    """Return runtime result index for requested object id when present."""
    for index, candidate_object_id in enumerate(object_ids):
        if candidate_object_id == object_id:
            return index

    return None


@cache
def get_sam2_service() -> Sam2Service:
    """Return shared local SAM2 adapter instance."""
    return Sam2Service()


def create_or_reuse_sam2_session(
    *,
    session: Session,
    video_id: str,
    sam2_service: Sam2Service,
) -> Sam2SessionResult:
    """Create or reuse one open SAM2 session for an indexed video.

    Args:
        session: Open database session.
        video_id: Indexed video identifier.
        sam2_service: Isolated SAM2 adapter implementation.

    Raises:
        Sam2VideoNotFoundError: If indexed video metadata does not exist.
        Sam2VideoSourceNotAvailableError: If local source file is missing.
    """
    video_path = _get_local_video_path(session=session, video_id=video_id)

    existing_session = session.scalar(
        select(Sam2Session)
        .where(Sam2Session.video_id == video_id, Sam2Session.closed_at.is_(None))
        .order_by(Sam2Session.created_at.desc())
    )
    now = datetime.now()
    if existing_session is not None:
        if not sam2_service.has_session(session_id=existing_session.id):
            sam2_service.create_session(session_id=existing_session.id, video_path=video_path)

        existing_session.last_used_at = now
        session.commit()
        return Sam2SessionResult(session_id=existing_session.id, reused=True)

    session_id = f"sam2-session-{uuid4().hex}"
    sam2_service.create_session(session_id=session_id, video_path=video_path)
    persisted_session = Sam2Session(
        id=session_id,
        video_id=video_id,
        status="open",
        created_at=now,
        last_used_at=now,
        closed_at=None,
    )
    session.add(persisted_session)
    session.commit()
    return Sam2SessionResult(session_id=session_id, reused=False)


def close_sam2_session(
    *,
    session: Session,
    video_id: str,
    session_id: str,
    sam2_service: Sam2Service,
) -> None:
    """Close one persisted SAM2 session for an indexed video.

    Args:
        session: Open database session.
        video_id: Indexed video identifier.
        session_id: Persisted SAM2 session identifier.
        sam2_service: Isolated SAM2 adapter implementation.

    Raises:
        Sam2SessionNotFoundError: If session does not belong to the video.
    """
    persisted_session = _get_open_sam2_session(
        session=session,
        video_id=video_id,
        session_id=session_id,
        allow_closed=True,
    )

    if persisted_session.closed_at is None:
        sam2_service.close_session(session_id=session_id)
        persisted_session.status = "closed"
        persisted_session.last_used_at = datetime.now()
        persisted_session.closed_at = persisted_session.last_used_at
        session.commit()


def prompt_sam2_box(
    *,
    session: Session,
    video_id: str,
    session_id: str,
    frame_idx: int,
    object_id: str,
    box_xyxy_px: Sequence[int],
    sam2_service: Sam2Service,
) -> StoredFrameAnnotation:
    """Run same-frame SAM2 prompt-box and persist resulting annotation metadata.

    Args:
        session: Open database session.
        video_id: Indexed video identifier.
        session_id: Persisted SAM2 session identifier.
        frame_idx: Canonical zero-based frame index.
        object_id: Logical object identifier.
        box_xyxy_px: Pixel box coordinates on backend-decoded frame image.
        sam2_service: Isolated SAM2 adapter implementation.

    Raises:
        Sam2VideoNotFoundError: If indexed video metadata does not exist.
        Sam2SessionNotFoundError: If session does not belong to requested video or is closed.
        FrameIndexOutOfRangeError: If frame index does not fit indexed metadata.
    """
    video = _get_video_or_raise(session=session, video_id=video_id)

    if frame_idx < 0 or frame_idx >= video.frame_count:
        raise FrameIndexOutOfRangeError(frame_count=video.frame_count)

    _get_open_sam2_session(session=session, video_id=video_id, session_id=session_id)
    if not sam2_service.has_session(session_id=session_id):
        sam2_service.create_session(
            session_id=session_id,
            video_path=_get_local_video_path(session=session, video_id=video_id),
        )

    resolved_box_xyxy_px = (
        box_xyxy_px[0],
        box_xyxy_px[1],
        box_xyxy_px[2],
        box_xyxy_px[3],
    )
    prompt_result = sam2_service.prompt_box(
        session_id=session_id,
        frame_idx=frame_idx,
        object_id=object_id,
        box_xyxy_px=resolved_box_xyxy_px,
    )

    stored_annotation = upsert_sam2_frame_annotation(
        session=session,
        video_id=video_id,
        frame_idx=frame_idx,
        object_id=object_id,
        video_width=video.width,
        video_height=video.height,
        box_xyxy_px=resolved_box_xyxy_px,
        mask_png_bytes=prompt_result.mask_png_bytes,
        mask_confidence=prompt_result.mask_confidence,
        commit=False,
    )
    persisted_session = _get_open_sam2_session(
        session=session,
        video_id=video_id,
        session_id=session_id,
    )
    persisted_session.last_used_at = datetime.now()
    session.commit()
    return stored_annotation


def start_sam2_propagation_job(
    *,
    session: Session,
    video_id: str,
    session_id: str,
    start_frame_idx: int,
    end_frame_idx: int | None,
    direction: str,
    object_ids: Sequence[str],
    sam2_service: Sam2Service,
    session_factory: sessionmaker[Session] | None = None,
) -> Sam2PropagationJobResult:
    """Create and launch one background propagation job."""
    video = _get_video_or_raise(session=session, video_id=video_id)
    _validate_frame_idx(frame_idx=start_frame_idx, frame_count=video.frame_count)
    if end_frame_idx is not None:
        _validate_frame_idx(frame_idx=end_frame_idx, frame_count=video.frame_count)

    persisted_session = _get_open_sam2_session(
        session=session,
        video_id=video_id,
        session_id=session_id,
    )
    target_frame_indices = _resolve_target_frame_indices(
        frame_count=video.frame_count,
        start_frame_idx=start_frame_idx,
        end_frame_idx=end_frame_idx,
        direction=direction,
    )
    now = datetime.now()
    job_id = f"job-{uuid4().hex}"
    persisted_job = Job(
        id=job_id,
        type="sam2_propagation",
        video_id=video_id,
        object_id=object_ids[0] if len(object_ids) == 1 else None,
        session_id=session_id,
        status="queued",
        progress_current=0,
        progress_total=len(target_frame_indices),
        payload_json={
            "start_frame_idx": start_frame_idx,
            "end_frame_idx": end_frame_idx,
            "direction": direction,
            "object_ids": list(object_ids),
            "target_frame_indices": target_frame_indices,
        },
        result_json=None,
        error_message=None,
        cancel_requested_at=None,
        started_at=None,
        completed_at=None,
    )
    persisted_session.last_used_at = now
    session.add(persisted_job)
    session.commit()

    if not target_frame_indices:
        persisted_job.status = "completed"
        persisted_job.started_at = now
        persisted_job.completed_at = now
        persisted_job.result_json = _build_job_result_json(
            object_ids=object_ids,
            persisted_frame_indices=[],
        )
        session.commit()
        return Sam2PropagationJobResult(
            job_id=job_id,
            status=persisted_job.status,
            progress_current=persisted_job.progress_current,
            progress_total=persisted_job.progress_total,
        )

    if not sam2_service.has_session(session_id=session_id):
        sam2_service.create_session(
            session_id=session_id,
            video_path=_get_local_video_path(session=session, video_id=video_id),
        )

    resolved_session_factory = session_factory or get_session_factory()
    worker = Thread(
        target=_run_sam2_propagation_job,
        kwargs={
            "job_id": job_id,
            "video_id": video_id,
            "session_id": session_id,
            "start_frame_idx": start_frame_idx,
            "end_frame_idx": end_frame_idx,
            "direction": direction,
            "object_ids": tuple(object_ids),
            "target_frame_indices": tuple(target_frame_indices),
            "sam2_service": sam2_service,
            "session_factory": resolved_session_factory,
        },
        daemon=True,
    )
    worker.start()
    return Sam2PropagationJobResult(
        job_id=job_id,
        status="queued",
        progress_current=0,
        progress_total=len(target_frame_indices),
    )


def get_job_status(*, session: Session, job_id: str) -> JobStatusResult:
    """Return one persisted job payload by id."""
    persisted_job = session.get(Job, job_id)
    if persisted_job is None:
        raise JobNotFoundError(job_id)

    return JobStatusResult(
        job_id=persisted_job.id,
        type=persisted_job.type,
        status=persisted_job.status,
        progress_current=persisted_job.progress_current,
        progress_total=persisted_job.progress_total,
        result_json=persisted_job.result_json,
        error_message=persisted_job.error_message,
    )


def request_job_cancellation(*, session: Session, job_id: str) -> JobCancelResult:
    """Request cancellation for one persisted background job."""
    persisted_job = session.get(Job, job_id)
    if persisted_job is None:
        raise JobNotFoundError(job_id)

    if persisted_job.status in {"queued", "running"} and persisted_job.cancel_requested_at is None:
        persisted_job.cancel_requested_at = datetime.now()
        session.commit()

    if persisted_job.status in {"queued", "running"}:
        return JobCancelResult(job_id=job_id, status="cancelling")

    return JobCancelResult(job_id=job_id, status=persisted_job.status)


def _run_sam2_propagation_job(
    *,
    job_id: str,
    video_id: str,
    session_id: str,
    start_frame_idx: int,
    end_frame_idx: int | None,
    direction: str,
    object_ids: Sequence[str],
    target_frame_indices: Sequence[int],
    sam2_service: Sam2Service,
    session_factory: sessionmaker[Session],
) -> None:
    """Run one propagation job in a background thread with fresh DB sessions."""
    persisted_frame_indices: list[int] = []
    target_frame_index_set = set(target_frame_indices)

    try:
        with session_factory() as session:
            persisted_job = _get_job_or_raise(session=session, job_id=job_id)
            persisted_job.status = "running"
            persisted_job.started_at = datetime.now()
            session.commit()

        propagation_iterator = sam2_service.propagate(
            session_id=session_id,
            start_frame_idx=start_frame_idx,
            end_frame_idx=end_frame_idx,
            direction=direction,
            object_ids=tuple(object_ids),
        )

        while True:
            if _job_cancel_requested(session_factory=session_factory, job_id=job_id):
                _finish_job(
                    session_factory=session_factory,
                    job_id=job_id,
                    status="cancelled",
                    persisted_frame_indices=persisted_frame_indices,
                    object_ids=object_ids,
                )
                return

            try:
                frame_result = next(propagation_iterator)
            except StopIteration:
                _finish_job(
                    session_factory=session_factory,
                    job_id=job_id,
                    status="completed",
                    persisted_frame_indices=persisted_frame_indices,
                    object_ids=object_ids,
                )
                return

            if _job_cancel_requested(session_factory=session_factory, job_id=job_id):
                _finish_job(
                    session_factory=session_factory,
                    job_id=job_id,
                    status="cancelled",
                    persisted_frame_indices=persisted_frame_indices,
                    object_ids=object_ids,
                )
                return

            if frame_result.frame_idx not in target_frame_index_set:
                continue

            with session_factory() as session:
                for object_result in frame_result.object_results:
                    if object_result.object_id not in object_ids:
                        continue

                    upsert_sam2_propagated_frame_annotation(
                        session=session,
                        video_id=video_id,
                        frame_idx=frame_result.frame_idx,
                        object_id=object_result.object_id,
                        mask_png_bytes=object_result.mask_png_bytes,
                        mask_confidence=object_result.mask_confidence,
                        commit=False,
                    )

                if frame_result.frame_idx not in persisted_frame_indices:
                    persisted_frame_indices.append(frame_result.frame_idx)

                persisted_job = _get_job_or_raise(session=session, job_id=job_id)
                persisted_job.progress_current = len(persisted_frame_indices)
                persisted_job.result_json = _build_job_result_json(
                    object_ids=object_ids,
                    persisted_frame_indices=persisted_frame_indices,
                )
                session.commit()
    except Exception as error:
        with session_factory() as session:
            persisted_job = _get_job_or_raise(session=session, job_id=job_id)
            persisted_job.status = "failed"
            persisted_job.error_message = str(error)
            persisted_job.result_json = _build_job_result_json(
                object_ids=object_ids,
                persisted_frame_indices=persisted_frame_indices,
            )
            persisted_job.completed_at = datetime.now()
            session.commit()


def _finish_job(
    *,
    session_factory: sessionmaker[Session],
    job_id: str,
    status: str,
    persisted_frame_indices: Sequence[int],
    object_ids: Sequence[str],
) -> None:
    """Persist one terminal job state."""
    with session_factory() as session:
        persisted_job = _get_job_or_raise(session=session, job_id=job_id)
        persisted_job.status = status
        persisted_job.progress_current = len(persisted_frame_indices)
        persisted_job.result_json = _build_job_result_json(
            object_ids=object_ids,
            persisted_frame_indices=persisted_frame_indices,
        )
        persisted_job.completed_at = datetime.now()
        session.commit()


def _job_cancel_requested(*, session_factory: sessionmaker[Session], job_id: str) -> bool:
    """Return whether cancellation has been requested for one job id."""
    with session_factory() as session:
        persisted_job = _get_job_or_raise(session=session, job_id=job_id)
        return persisted_job.cancel_requested_at is not None


def _get_video_or_raise(*, session: Session, video_id: str) -> Video:
    """Return indexed video metadata or raise the service-level not-found error."""
    video = get_indexed_video_by_id(session=session, video_id=video_id)
    if video is None:
        raise Sam2VideoNotFoundError(video_id)

    return video


def _get_local_video_path(*, session: Session, video_id: str) -> Path:
    """Return the local source path for one indexed video or raise."""
    video = _get_video_or_raise(session=session, video_id=video_id)
    video_path = Path(video.source_path)
    if not video_path.is_file():
        raise Sam2VideoSourceNotAvailableError(video.source_path)

    return video_path


def _get_open_sam2_session(
    *,
    session: Session,
    video_id: str,
    session_id: str,
    allow_closed: bool = False,
) -> Sam2Session:
    """Return one persisted session scoped to the requested video."""
    conditions = [Sam2Session.id == session_id, Sam2Session.video_id == video_id]
    if not allow_closed:
        conditions.append(Sam2Session.closed_at.is_(None))

    persisted_session = session.scalar(select(Sam2Session).where(*conditions))
    if persisted_session is None:
        raise Sam2SessionNotFoundError(session_id)

    return persisted_session


def _get_job_or_raise(*, session: Session, job_id: str) -> Job:
    """Return one persisted job row or raise."""
    persisted_job = session.get(Job, job_id)
    if persisted_job is None:
        raise JobNotFoundError(job_id)

    return persisted_job


def _validate_frame_idx(*, frame_idx: int, frame_count: int) -> None:
    """Raise if a frame index falls outside persisted video bounds."""
    if frame_idx < 0 or frame_idx >= frame_count:
        raise FrameIndexOutOfRangeError(frame_count=frame_count)


def _resolve_target_frame_indices(
    *,
    frame_count: int,
    start_frame_idx: int,
    end_frame_idx: int | None,
    direction: str,
) -> list[int]:
    """Resolve deterministic target frames for propagation progress."""
    if direction == "forward":
        last_frame_idx = end_frame_idx if end_frame_idx is not None else frame_count - 1
        if last_frame_idx < start_frame_idx:
            raise InvalidPropagationRangeError(
                "Forward propagation end frame must be greater than or equal to start frame"
            )

        return list(range(start_frame_idx + 1, last_frame_idx + 1))

    if direction == "backward":
        first_frame_idx = end_frame_idx if end_frame_idx is not None else 0
        if first_frame_idx > start_frame_idx:
            raise InvalidPropagationRangeError(
                "Backward propagation end frame must be less than or equal to start frame"
            )

        return list(range(start_frame_idx - 1, first_frame_idx - 1, -1))

    if direction == "both":
        if end_frame_idx is None:
            backward_limit = 0
            forward_limit = frame_count - 1
        elif end_frame_idx >= start_frame_idx:
            backward_limit = 0
            forward_limit = end_frame_idx
        else:
            backward_limit = end_frame_idx
            forward_limit = frame_count - 1

        return [
            *range(start_frame_idx + 1, forward_limit + 1),
            *range(start_frame_idx - 1, backward_limit - 1, -1),
        ]

    raise InvalidPropagationRangeError(f"Unsupported propagation direction: {direction}")


def _build_job_result_json(
    *,
    object_ids: Sequence[str],
    persisted_frame_indices: Sequence[int],
) -> dict[str, object]:
    """Build deterministic result metadata for propagation jobs."""
    return {
        "object_ids": list(object_ids),
        "persisted_frame_count": len(persisted_frame_indices),
        "persisted_frame_indices": list(persisted_frame_indices),
    }
