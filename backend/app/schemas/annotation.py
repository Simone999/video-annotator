"""Schema definitions for persisted frame-annotation payloads."""

from typing import Annotated

from pydantic import BaseModel, Field, StringConstraints

type NormalizedBoxValue = Annotated[float, Field(ge=0.0, le=1.0)]


class FrameAnnotationPayload(BaseModel):
    """One persisted annotation payload at the API boundary."""

    object_id: Annotated[int, Field(gt=0)]
    is_keyframe: bool
    source: Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=64)]
    box_xywh_norm: Annotated[list[NormalizedBoxValue], Field(min_length=4, max_length=4)]


class VideoFrameAnnotationPayload(FrameAnnotationPayload):
    """One persisted annotation payload with explicit canonical frame index."""

    frame_idx: Annotated[int, Field(ge=0)]


class UpsertFrameAnnotationsRequest(BaseModel):
    """Request body for frame-scoped annotation upsert."""

    annotations: Annotated[list[FrameAnnotationPayload], Field(min_length=1)]


class FrameAnnotationsResponse(BaseModel):
    """Response body for one frame's persisted annotations."""

    video_id: str
    frame_idx: Annotated[int, Field(ge=0)]
    annotations: list[FrameAnnotationPayload]


class VideoAnnotationsResponse(BaseModel):
    """Response body for all persisted annotations in one video."""

    video_id: str
    annotations: list[VideoFrameAnnotationPayload]
