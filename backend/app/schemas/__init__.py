"""Schema package for backend data models."""

from .health import HealthResponse
from .sam2 import (
    FrameAnnotationResponse,
    FrameAnnotationsForFrameResponse,
    JobCancelResponse,
    JobStatusResponse,
    Sam2PromptBoxRequest,
    Sam2PromptBoxResponse,
    Sam2PropagationJobResponse,
    Sam2PropagationRequest,
    Sam2SessionResponse,
)
from .video import VideoResponse

__all__ = [
    "FrameAnnotationResponse",
    "FrameAnnotationsForFrameResponse",
    "HealthResponse",
    "JobCancelResponse",
    "JobStatusResponse",
    "Sam2PromptBoxRequest",
    "Sam2PromptBoxResponse",
    "Sam2PropagationJobResponse",
    "Sam2PropagationRequest",
    "Sam2SessionResponse",
    "VideoResponse",
]
