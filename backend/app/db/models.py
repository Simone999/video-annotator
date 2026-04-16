"""Persisted SQLAlchemy models for annotation-foundation backend data."""

from sqlalchemy import Boolean, Float, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from .base import Base


class Video(Base):
    """Persisted metadata for an indexed video review target."""

    __tablename__ = "videos"

    id: Mapped[str] = mapped_column(String(255), primary_key=True)
    source_path: Mapped[str] = mapped_column(String, nullable=False)
    display_name: Mapped[str] = mapped_column(String(255), nullable=False)
    frame_count: Mapped[int] = mapped_column(Integer, nullable=False)
    fps: Mapped[float] = mapped_column(Float, nullable=False)
    width: Mapped[int] = mapped_column(Integer, nullable=False)
    height: Mapped[int] = mapped_column(Integer, nullable=False)
    duration_seconds: Mapped[float | None] = mapped_column(Float, nullable=True)


class ObjectTrack(Base):
    """Persisted stable object identity for one indexed video."""

    __tablename__ = "object_tracks"

    id: Mapped[str] = mapped_column(String(255), primary_key=True)
    video_id: Mapped[str] = mapped_column(
        String(255),
        ForeignKey("videos.id"),
        nullable=False,
    )
    label: Mapped[str] = mapped_column(String(255), nullable=False)
    color: Mapped[str] = mapped_column(String(32), nullable=False)
    status: Mapped[str] = mapped_column(String(32), nullable=False)


class FrameAnnotation(Base):
    """Persisted per-frame annotation state for one stable object."""

    __tablename__ = "frame_annotations"
    __table_args__ = (
        UniqueConstraint(
            "video_id",
            "frame_idx",
            "object_id",
            name="frame_annotations_video_frame_object_unique",
        ),
    )

    id: Mapped[str] = mapped_column(String(255), primary_key=True)
    video_id: Mapped[str] = mapped_column(
        String(255),
        ForeignKey("videos.id"),
        nullable=False,
    )
    frame_idx: Mapped[int] = mapped_column(Integer, nullable=False)
    object_id: Mapped[str] = mapped_column(
        String(255),
        ForeignKey("object_tracks.id"),
        nullable=False,
    )
    is_keyframe: Mapped[bool] = mapped_column(Boolean, nullable=False)
    source: Mapped[str] = mapped_column(String(32), nullable=False)
    box_x: Mapped[float] = mapped_column(Float, nullable=False)
    box_y: Mapped[float] = mapped_column(Float, nullable=False)
    box_w: Mapped[float] = mapped_column(Float, nullable=False)
    box_h: Mapped[float] = mapped_column(Float, nullable=False)
    mask_path: Mapped[str | None] = mapped_column(String, nullable=True)
    mask_rle: Mapped[str | None] = mapped_column(String, nullable=True)
