"""Schema definitions for backend health responses."""

from pydantic import BaseModel


class HealthResponse(BaseModel):
    """Response body for the backend health endpoint.

    Attributes:
        status: Stable health marker for local smoke checks.
    """

    status: str
