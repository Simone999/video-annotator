"""Schema package for backend data models."""

from .annotation import (
    FrameAnnotationPayload,
    FrameAnnotationsResponse,
    UpsertFrameAnnotationsRequest,
    VideoAnnotationsResponse,
    VideoFrameAnnotationPayload,
)
from .health import HealthResponse
from .video import (
    CreateObjectTrackRequest,
    ObjectTrackSummaryResponse,
    VideoManifestResponse,
    VideoResponse,
)

__all__ = [
    "CreateObjectTrackRequest",
    "FrameAnnotationPayload",
    "FrameAnnotationsResponse",
    "HealthResponse",
    "ObjectTrackSummaryResponse",
    "UpsertFrameAnnotationsRequest",
    "VideoAnnotationsResponse",
    "VideoFrameAnnotationPayload",
    "VideoManifestResponse",
    "VideoResponse",
]
