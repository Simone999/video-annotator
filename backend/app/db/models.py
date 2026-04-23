"""Persisted SQLAlchemy models for annotation and SAM2 backend data."""

from datetime import datetime

from sqlalchemy import (
    JSON,
    Boolean,
    CheckConstraint,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
)
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


class ExportRecord(Base):
    """Persisted export snapshot for one video's saved review state."""

    __tablename__ = "export_records"

    id: Mapped[str] = mapped_column(String(255), primary_key=True)
    video_id: Mapped[str] = mapped_column(
        String(255),
        ForeignKey("videos.id"),
        nullable=False,
        index=True,
    )
    review_output_updated_at: Mapped[datetime] = mapped_column(DateTime(), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(), nullable=False, default=datetime.now)


class Sam2Session(Base):
    """Persisted SAM2 session metadata for one indexed video."""

    __tablename__ = "sam2_sessions"

    id: Mapped[str] = mapped_column(String(255), primary_key=True)
    video_id: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    status: Mapped[str] = mapped_column(String(64), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(), nullable=False, default=datetime.now)
    last_used_at: Mapped[datetime] = mapped_column(DateTime(), nullable=False, default=datetime.now)
    closed_at: Mapped[datetime | None] = mapped_column(DateTime(), nullable=True)


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
        index=True,
    )
    frame_idx: Mapped[int] = mapped_column(Integer, nullable=False, index=True)
    object_id: Mapped[str] = mapped_column(
        String(255),
        ForeignKey("object_tracks.id"),
        nullable=False,
        index=True,
    )
    is_keyframe: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    source: Mapped[str] = mapped_column(String(64), nullable=False)
    box_x: Mapped[float | None] = mapped_column(Float, nullable=True)
    box_y: Mapped[float | None] = mapped_column(Float, nullable=True)
    box_w: Mapped[float | None] = mapped_column(Float, nullable=True)
    box_h: Mapped[float | None] = mapped_column(Float, nullable=True)
    mask_path: Mapped[str | None] = mapped_column(String, nullable=True)
    mask_confidence: Mapped[float | None] = mapped_column(Float, nullable=True)
    mask_rle: Mapped[dict[str, object] | None] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(), nullable=False, default=datetime.now)
    updated_at: Mapped[datetime] = mapped_column(DateTime(), nullable=False, default=datetime.now)


class Job(Base):
    """Persisted background-job metadata for deterministic async work."""

    __tablename__ = "jobs"
    __table_args__ = (
        CheckConstraint("progress_current >= 0", name="jobs_progress_current_nonnegative"),
        CheckConstraint("progress_total >= 0", name="jobs_progress_total_nonnegative"),
        CheckConstraint("progress_current <= progress_total", name="jobs_progress_within_total"),
    )

    id: Mapped[str] = mapped_column(String(255), primary_key=True)
    type: Mapped[str] = mapped_column(String(64), nullable=False)
    video_id: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    object_id: Mapped[str | None] = mapped_column(String(255), nullable=True, index=True)
    session_id: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    status: Mapped[str] = mapped_column(String(64), nullable=False)
    progress_current: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    progress_total: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    payload_json: Mapped[dict[str, object]] = mapped_column(JSON, nullable=False)
    result_json: Mapped[dict[str, object] | None] = mapped_column(JSON, nullable=True)
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)
    cancel_requested_at: Mapped[datetime | None] = mapped_column(DateTime(), nullable=True)
    started_at: Mapped[datetime | None] = mapped_column(DateTime(), nullable=True)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(), nullable=True)
