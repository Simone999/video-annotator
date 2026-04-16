"""Schema package for backend data models."""

from .health import HealthResponse
from .video import (
    AnnotationMaskSummary,
    CreateObjectTrackRequest,
    ManifestVideoSummary,
    ManualFrameAnnotationRequest,
    ManualFrameAnnotationResponse,
    ObjectTrackSummary,
    VideoManifestResponse,
    VideoResponse,
)

__all__ = [
    "AnnotationMaskSummary",
    "CreateObjectTrackRequest",
    "HealthResponse",
    "ManifestVideoSummary",
    "ManualFrameAnnotationRequest",
    "ManualFrameAnnotationResponse",
    "ObjectTrackSummary",
    "VideoManifestResponse",
    "VideoResponse",
]
