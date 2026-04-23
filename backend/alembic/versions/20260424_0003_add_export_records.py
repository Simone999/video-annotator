"""Add export record persistence for exported-state derivation."""

import sqlalchemy as sa

from alembic import op

revision = "20260424_0003"
down_revision = "20260422_0002"
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Create export record table."""
    op.create_table(
        "export_records",
        sa.Column("id", sa.String(length=255), nullable=False),
        sa.Column("video_id", sa.String(length=255), nullable=False),
        sa.Column("review_output_updated_at", sa.DateTime(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["video_id"], ["videos.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_export_records_video_id"),
        "export_records",
        ["video_id"],
        unique=False,
    )


def downgrade() -> None:
    """Drop export record table."""
    op.drop_index(op.f("ix_export_records_video_id"), table_name="export_records")
    op.drop_table("export_records")
