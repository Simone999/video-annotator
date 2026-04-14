"""Schema package for backend data models."""

from .health import HealthResponse
from .video import VideoResponse

__all__ = [
    "HealthResponse",
    "VideoResponse",
]
