"""Schema definitions for indexed video metadata."""

from pydantic import BaseModel


class VideoMetadata(BaseModel):
    """Canonical backend-owned video metadata.

    Attributes:
        fps: Frames per second for the inspected video.
        frame_count: Total decoded frame count.
        width: Frame width in pixels.
        height: Frame height in pixels.
        duration_seconds: Total video duration in seconds.
    """

    fps: float
    frame_count: int
    width: int
    height: int
    duration_seconds: float
