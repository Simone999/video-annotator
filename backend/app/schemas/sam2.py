"""Schema definitions for SAM2 lifecycle and prompt-box payloads."""

from typing import Annotated

from pydantic import BaseModel, Field, field_validator


class Sam2SessionResponse(BaseModel):
    """Create-or-reuse response for one SAM2 session."""

    session_id: str
    reused: bool


class Sam2MaskReference(BaseModel):
    """Persisted mask metadata returned to frontend."""

    path: str


class Sam2FrameAnnotationResponse(BaseModel):
    """Persisted same-frame annotation payload for prompt-box requests."""

    object_id: str
    source: str
    box_xywh_norm: tuple[float, float, float, float]
    mask: Sam2MaskReference


class Sam2PromptBoxRequest(BaseModel):
    """Input payload for same-frame prompt-box generation."""

    session_id: str
    frame_idx: int = Field(ge=0)
    object_id: str
    box_xyxy_px: Annotated[list[int], Field(min_length=4, max_length=4)]

    @field_validator("box_xyxy_px")
    @classmethod
    def validate_box_xyxy_px(cls, value: list[int]) -> list[int]:
        """Reject malformed pixel boxes at request boundary."""
        if value[2] <= value[0] or value[3] <= value[1]:
            raise ValueError("Prompt box must define a positive in-frame area")

        return value


class Sam2PromptBoxResponse(BaseModel):
    """Response payload for persisted same-frame SAM2 prompt-box results."""

    frame_idx: int
    annotation: Sam2FrameAnnotationResponse


class FrameAnnotationResponse(BaseModel):
    """Persisted annotation payload returned by read APIs."""

    object_id: str
    source: str
    box_xywh_norm: tuple[float, float, float, float] | None
    mask: Sam2MaskReference


class FrameAnnotationsForFrameResponse(BaseModel):
    """Read response for one frame's persisted annotations."""

    frame_idx: int
    annotations: list[FrameAnnotationResponse]


class Sam2PropagationRequest(BaseModel):
    """Input payload for one background SAM2 propagation job."""

    session_id: str
    start_frame_idx: int = Field(ge=0)
    end_frame_idx: int | None = Field(default=None, ge=0)
    direction: str
    object_ids: Annotated[list[str], Field(min_length=1)]

    @field_validator("direction")
    @classmethod
    def validate_direction(cls, value: str) -> str:
        """Reject unsupported propagation directions at request boundary."""
        if value not in {"forward", "backward", "both"}:
            raise ValueError("Propagation direction must be forward, backward, or both")

        return value


class Sam2PropagationJobResponse(BaseModel):
    """Create-job response for SAM2 propagation."""

    job_id: str
    status: str
    progress_current: int
    progress_total: int


class JobStatusResponse(BaseModel):
    """Status payload for one persisted background job."""

    job_id: str
    type: str
    status: str
    progress_current: int
    progress_total: int
    result: dict[str, object] | None
    error_message: str | None


class JobCancelResponse(BaseModel):
    """Response payload for one job-cancel request."""

    job_id: str
    status: str
