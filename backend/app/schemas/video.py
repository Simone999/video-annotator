"""Schema definitions for video catalog, object, and manifest payloads."""

from typing import Annotated, Literal

from pydantic import BaseModel, ConfigDict, Field

type NormalizedBoxCoordinate = Annotated[float, Field(ge=0.0, le=1.0)]
type VideoReviewState = Literal[
    "not_started",
    "started",
    "in_progress",
    "ready",
    "exported",
]


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


class VideoReviewSummary(BaseModel):
    """Derived library-card facts returned with indexed video metadata."""

    object_count: int
    annotated_frame_count: int
    imported_frame_count: int
    keyframe_count: int
    manual_frame_count: int
    propagated_frame_count: int
    last_annotated_frame_idx: int | None
    last_reviewed_frame_idx: int | None


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
    review_state: VideoReviewState
    propagation_progress_percent: int | None
    review_summary: VideoReviewSummary


class ManifestVideoSummary(BaseModel):
    """Top-level video metadata included in manifest responses."""

    model_config = ConfigDict(from_attributes=True)

    id: str
    frame_count: int
    fps: float
    width: int
    height: int
    duration_seconds: float | None
    review_state: VideoReviewState
    propagation_progress_percent: int | None
    review_summary: VideoReviewSummary


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


class SelectedObjectTrackSummary(BaseModel):
    """Selected-range counters for one object summary response."""

    frames: int
    propagated: int
    corrected: int | None


class SelectedObjectSummaryResponse(BaseModel):
    """Current-frame and selected-range summary for one object."""

    video_id: str
    object_id: str
    label: str
    bbox_xyxy_px: tuple[int, int, int, int] | None
    mask_confidence: float | None
    track_summary: SelectedObjectTrackSummary
