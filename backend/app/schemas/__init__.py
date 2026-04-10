"""Schema package for backend data models."""

from .health import HealthResponse
from .video import VideoMetadata

__all__ = ["HealthResponse", "VideoMetadata"]
