"""Database bootstrap helpers for backend persistence."""

from .base import Base
from .session import get_engine


def initialize_database() -> None:
    """Create backend tables when local storage starts up."""
    Base.metadata.create_all(bind=get_engine())
