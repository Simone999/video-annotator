"""Schema definitions for video catalog, object, and manifest payloads."""

from pydantic import BaseModel, ConfigDict


class CreateObjectTrackRequest(BaseModel):
    """Payload for creating one stable object track for a selected video."""

    label: str


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


class ManifestVideoSummary(BaseModel):
    """Top-level video metadata included in manifest responses."""

    model_config = ConfigDict(from_attributes=True)

    id: str
    frame_count: int
    fps: float
    width: int
    height: int
    duration_seconds: float | None


class ObjectTrackSummary(BaseModel):
    """Stable object summary returned in a manifest response."""

    model_config = ConfigDict(from_attributes=True)

    id: str
    label: str
    color: str
    status: str


class VideoManifestResponse(BaseModel):
    """Manifest summary for exact-frame review bootstrap."""

    video: ManifestVideoSummary
    objects: list[ObjectTrackSummary]
    annotated_frames: list[int]
    keyframes: list[int]
