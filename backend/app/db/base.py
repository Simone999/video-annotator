"""Shared SQLAlchemy metadata for backend persistence models."""

from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    """Base class for persisted backend models."""
