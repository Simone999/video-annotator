"""SQLite bootstrap helpers for the backend."""

import sqlite3
from pathlib import Path

from app.core import DATABASE_PATH
from app.models import CREATE_VIDEOS_TABLE_SQL


def initialize_database(database_path: Path = DATABASE_PATH) -> None:
    """Create or open the local SQLite database and apply the base schema.

    Args:
        database_path: Repository-owned SQLite database path.
    """
    database_path.parent.mkdir(parents=True, exist_ok=True)

    with sqlite3.connect(database_path) as connection:
        connection.execute("PRAGMA foreign_keys = ON")
        connection.executescript(CREATE_VIDEOS_TABLE_SQL)
