"""Add nullable SAM2 confidence to frame annotations."""

import sqlalchemy as sa

from alembic import op

revision = "20260422_0002"
down_revision = "20260421_0001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Add nullable confidence storage for persisted frame annotations."""
    op.add_column(
        "frame_annotations",
        sa.Column("mask_confidence", sa.Float(), nullable=True),
    )


def downgrade() -> None:
    """Drop nullable confidence storage from persisted frame annotations."""
    op.drop_column("frame_annotations", "mask_confidence")
