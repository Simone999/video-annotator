"""Schema definitions for video catalog, object, and manifest payloads."""

from typing import Annotated

from pydantic import BaseModel, ConfigDict, Field

type NormalizedBoxCoordinate = Annotated[float, Field(ge=0.0, le=1.0)]


class CreateObjectTrackRequest(BaseModel):
    """Payload for creating one stable object track for a selected video."""

    label: str


class AnnotationMaskSummary(BaseModel):
    """Serialized persisted mask metadata for one annotation."""

    path: str | None


class ManualFrameAnnotationRequest(BaseModel):
    """Payload for one manual annotation upsert on one canonical frame."""

    object_id: str
    is_keyframe: bool
    box_xywh_norm: list[NormalizedBoxCoordinate] = Field(min_length=4, max_length=4)


class ManualFrameAnnotationResponse(BaseModel):
    """Serialized manual annotation payload returned after one upsert."""

    video_id: str
    frame_idx: int
    object_id: str
    is_keyframe: bool
    source: str
    box_xywh_norm: list[float]
    mask: AnnotationMaskSummary


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
