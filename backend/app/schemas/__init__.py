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
from .video import (
    AnnotationMaskSummary,
    CreateObjectTrackRequest,
    ManifestVideoSummary,
    ManualFrameAnnotationRequest,
    ManualFrameAnnotationResponse,
    ObjectTrackSummary,
    SelectedObjectSummaryResponse,
    SelectedObjectTrackSummary,
    VideoManifestResponse,
    VideoResponse,
    VideoReviewSummary,
)

__all__ = [
    "AnnotationMaskSummary",
    "CreateObjectTrackRequest",
    "FrameAnnotationResponse",
    "FrameAnnotationsForFrameResponse",
    "HealthResponse",
    "JobCancelResponse",
    "JobStatusResponse",
    "ManifestVideoSummary",
    "ManualFrameAnnotationRequest",
    "ManualFrameAnnotationResponse",
    "ObjectTrackSummary",
    "Sam2PromptBoxRequest",
    "Sam2PromptBoxResponse",
    "Sam2PropagationJobResponse",
    "Sam2PropagationRequest",
    "Sam2SessionResponse",
    "SelectedObjectSummaryResponse",
    "SelectedObjectTrackSummary",
    "VideoManifestResponse",
    "VideoResponse",
    "VideoReviewSummary",
]
