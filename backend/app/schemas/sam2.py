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
