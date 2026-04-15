"""Schema definitions for SAM2 lifecycle payloads."""

from pydantic import BaseModel


class Sam2SessionResponse(BaseModel):
    """Create-or-reuse response for one SAM2 session."""

    session_id: str
    reused: bool
