"""Create initial backend schema."""

import sqlalchemy as sa

from alembic import op

revision = "20260421_0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Create the initial backend tables."""
    op.create_table(
        "videos",
        sa.Column("id", sa.String(length=255), nullable=False),
        sa.Column("source_path", sa.String(), nullable=False),
        sa.Column("display_name", sa.String(length=255), nullable=False),
        sa.Column("frame_count", sa.Integer(), nullable=False),
        sa.Column("fps", sa.Float(), nullable=False),
        sa.Column("width", sa.Integer(), nullable=False),
        sa.Column("height", sa.Integer(), nullable=False),
        sa.Column("duration_seconds", sa.Float(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_table(
        "sam2_sessions",
        sa.Column("id", sa.String(length=255), nullable=False),
        sa.Column("video_id", sa.String(length=255), nullable=False),
        sa.Column("status", sa.String(length=64), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("last_used_at", sa.DateTime(), nullable=False),
        sa.Column("closed_at", sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_sam2_sessions_video_id"),
        "sam2_sessions",
        ["video_id"],
        unique=False,
    )
    op.create_table(
        "object_tracks",
        sa.Column("id", sa.String(length=255), nullable=False),
        sa.Column("video_id", sa.String(length=255), nullable=False),
        sa.Column("label", sa.String(length=255), nullable=False),
        sa.Column("color", sa.String(length=32), nullable=False),
        sa.Column("status", sa.String(length=32), nullable=False),
        sa.ForeignKeyConstraint(["video_id"], ["videos.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_table(
        "frame_annotations",
        sa.Column("id", sa.String(length=255), nullable=False),
        sa.Column("video_id", sa.String(length=255), nullable=False),
        sa.Column("frame_idx", sa.Integer(), nullable=False),
        sa.Column("object_id", sa.String(length=255), nullable=False),
        sa.Column("is_keyframe", sa.Boolean(), nullable=False),
        sa.Column("source", sa.String(length=64), nullable=False),
        sa.Column("box_x", sa.Float(), nullable=True),
        sa.Column("box_y", sa.Float(), nullable=True),
        sa.Column("box_w", sa.Float(), nullable=True),
        sa.Column("box_h", sa.Float(), nullable=True),
        sa.Column("mask_path", sa.String(), nullable=True),
        sa.Column("mask_rle", sa.JSON(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["object_id"], ["object_tracks.id"]),
        sa.ForeignKeyConstraint(["video_id"], ["videos.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint(
            "video_id",
            "frame_idx",
            "object_id",
            name="frame_annotations_video_frame_object_unique",
        ),
    )
    op.create_index(
        op.f("ix_frame_annotations_frame_idx"),
        "frame_annotations",
        ["frame_idx"],
        unique=False,
    )
    op.create_index(
        op.f("ix_frame_annotations_object_id"),
        "frame_annotations",
        ["object_id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_frame_annotations_video_id"),
        "frame_annotations",
        ["video_id"],
        unique=False,
    )
    op.create_table(
        "jobs",
        sa.Column("id", sa.String(length=255), nullable=False),
        sa.Column("type", sa.String(length=64), nullable=False),
        sa.Column("video_id", sa.String(length=255), nullable=False),
        sa.Column("object_id", sa.String(length=255), nullable=True),
        sa.Column("session_id", sa.String(length=255), nullable=False),
        sa.Column("status", sa.String(length=64), nullable=False),
        sa.Column("progress_current", sa.Integer(), nullable=False),
        sa.Column("progress_total", sa.Integer(), nullable=False),
        sa.Column("payload_json", sa.JSON(), nullable=False),
        sa.Column("result_json", sa.JSON(), nullable=True),
        sa.Column("error_message", sa.Text(), nullable=True),
        sa.Column("cancel_requested_at", sa.DateTime(), nullable=True),
        sa.Column("started_at", sa.DateTime(), nullable=True),
        sa.Column("completed_at", sa.DateTime(), nullable=True),
        sa.CheckConstraint(
            "progress_current >= 0",
            name="jobs_progress_current_nonnegative",
        ),
        sa.CheckConstraint(
            "progress_total >= 0",
            name="jobs_progress_total_nonnegative",
        ),
        sa.CheckConstraint(
            "progress_current <= progress_total",
            name="jobs_progress_within_total",
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_jobs_object_id"), "jobs", ["object_id"], unique=False)
    op.create_index(op.f("ix_jobs_session_id"), "jobs", ["session_id"], unique=False)
    op.create_index(op.f("ix_jobs_video_id"), "jobs", ["video_id"], unique=False)


def downgrade() -> None:
    """Drop the initial backend tables."""
    op.drop_index(op.f("ix_jobs_video_id"), table_name="jobs")
    op.drop_index(op.f("ix_jobs_session_id"), table_name="jobs")
    op.drop_index(op.f("ix_jobs_object_id"), table_name="jobs")
    op.drop_table("jobs")
    op.drop_index(op.f("ix_frame_annotations_video_id"), table_name="frame_annotations")
    op.drop_index(op.f("ix_frame_annotations_object_id"), table_name="frame_annotations")
    op.drop_index(op.f("ix_frame_annotations_frame_idx"), table_name="frame_annotations")
    op.drop_table("frame_annotations")
    op.drop_table("object_tracks")
    op.drop_index(op.f("ix_sam2_sessions_video_id"), table_name="sam2_sessions")
    op.drop_table("sam2_sessions")
    op.drop_table("videos")
