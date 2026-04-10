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


class IndexedVideo(VideoMetadata):
    """Persisted video metadata returned by Milestone 0 APIs.

    Attributes:
        video_id: Stable backend video identifier.
        filepath: Canonical local filepath for the indexed video.
    """

    video_id: str
    filepath: str


class VideoIndexResponse(BaseModel):
    """Response body for the Milestone 0 indexing endpoint.

    Attributes:
        video: Persisted indexed video metadata.
    """

    video: IndexedVideo


class VideoListResponse(BaseModel):
    """Response body for the indexed video catalog endpoint.

    Attributes:
        videos: Persisted indexed video metadata records.
    """

    videos: list[IndexedVideo]
