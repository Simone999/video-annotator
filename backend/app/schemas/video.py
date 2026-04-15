"""Schema definitions for video catalog and manifest payloads."""

from typing import Annotated

from pydantic import BaseModel, ConfigDict, StringConstraints


class VideoResponse(BaseModel):
    """Indexed video payload returned by milestone-01 catalog APIs."""

    model_config = ConfigDict(from_attributes=True)

    id: str
    source_path: str
    display_name: str
    frame_count: int
    fps: float
    width: int
    height: int
    duration_seconds: float | None


class ObjectTrackSummaryResponse(BaseModel):
    """Persisted object summary payload returned by milestone-02 APIs."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    label: str
    color: str | None
    status: str


class VideoManifestResponse(BaseModel):
    """Video-scoped manifest payload for box CRUD workspace bootstrap."""

    video: VideoResponse
    objects: list[ObjectTrackSummaryResponse]
    annotated_frame_indices: list[int]
    keyframe_indices: list[int]


class CreateObjectTrackRequest(BaseModel):
    """Payload for creating one persisted video-scoped object track."""

    label: Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=255)]
