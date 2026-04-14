"""Schema definitions for milestone-01 video catalog payloads."""

from pydantic import BaseModel, ConfigDict


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
