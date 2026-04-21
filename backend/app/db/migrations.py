"""Explicit database migration helpers."""

from pathlib import Path

from alembic.config import Config

from alembic import command
from app.core.config import get_database_url

BACKEND_ROOT = Path(__file__).resolve().parents[2]
ALEMBIC_CONFIG_PATH = BACKEND_ROOT / "alembic.ini"


def upgrade_database(*, database_url: str | None = None) -> None:
    """Upgrade backend schema to the current head revision."""
    config = Config(str(ALEMBIC_CONFIG_PATH))
    config.set_main_option("sqlalchemy.url", database_url or get_database_url())
    command.upgrade(config, "head")
