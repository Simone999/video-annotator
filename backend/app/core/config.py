"""Static configuration values for the backend."""

import os
from pathlib import Path

REPOSITORY_ROOT = Path(__file__).resolve().parents[3]
DATA_DIR = REPOSITORY_ROOT / "data"
VIDEO_SOURCE_DIR = DATA_DIR / "videos"
DATABASE_PATH = DATA_DIR / "video_annotator.db"


def get_database_url() -> str:
    """Return the configured backend database URL."""
    configured_database_url = os.environ.get("APP_DB_URL")
    if configured_database_url is not None:
        return configured_database_url

    return f"sqlite:///{DATABASE_PATH}"
