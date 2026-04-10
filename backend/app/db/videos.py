"""SQLite access helpers for indexed videos."""

import sqlite3
from collections.abc import Iterator
from contextlib import contextmanager
from pathlib import Path

from app.core import DATABASE_PATH
from app.db.init_db import initialize_database
from app.schemas import IndexedVideo, VideoMetadata


@contextmanager
def _open_connection(database_path: Path = DATABASE_PATH) -> Iterator[sqlite3.Connection]:
    initialize_database(database_path)

    connection = sqlite3.connect(database_path)
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA foreign_keys = ON")

    try:
        yield connection
    except Exception:
        connection.rollback()
        raise
    else:
        connection.commit()
    finally:
        connection.close()


def list_indexed_videos(database_path: Path = DATABASE_PATH) -> list[IndexedVideo]:
    """Return all indexed videos ordered by stable identifier.

    Args:
        database_path: Repository-owned SQLite database path.

    Returns:
        Indexed videos currently persisted in the local database.
    """
    with _open_connection(database_path) as connection:
        rows = connection.execute(
            """
            SELECT
              video_id,
              filepath,
              fps,
              frame_count,
              width,
              height,
              duration_seconds
            FROM videos
            ORDER BY video_id
            """
        ).fetchall()

    return [_row_to_indexed_video(row) for row in rows]


def get_indexed_video_by_filepath(
    filepath: str,
    database_path: Path = DATABASE_PATH,
) -> IndexedVideo | None:
    """Return an indexed video by canonical filepath.

    Args:
        filepath: Canonical local filepath for the indexed video.
        database_path: Repository-owned SQLite database path.

    Returns:
        Persisted indexed video metadata, if present.
    """
    with _open_connection(database_path) as connection:
        row = connection.execute(
            """
            SELECT
              video_id,
              filepath,
              fps,
              frame_count,
              width,
              height,
              duration_seconds
            FROM videos
            WHERE filepath = ?
            """,
            (filepath,),
        ).fetchone()

    if row is None:
        return None

    return _row_to_indexed_video(row)


def get_indexed_video_by_id(
    video_id: str,
    database_path: Path = DATABASE_PATH,
) -> IndexedVideo | None:
    """Return an indexed video by stable identifier.

    Args:
        video_id: Stable backend video identifier.
        database_path: Repository-owned SQLite database path.

    Returns:
        Persisted indexed video metadata, if present.
    """
    with _open_connection(database_path) as connection:
        row = connection.execute(
            """
            SELECT
              video_id,
              filepath,
              fps,
              frame_count,
              width,
              height,
              duration_seconds
            FROM videos
            WHERE video_id = ?
            """,
            (video_id,),
        ).fetchone()

    if row is None:
        return None

    return _row_to_indexed_video(row)


def create_indexed_video(
    filepath: str,
    metadata: VideoMetadata,
    database_path: Path = DATABASE_PATH,
) -> IndexedVideo:
    """Persist a new indexed video record.

    Args:
        filepath: Canonical local filepath for the indexed video.
        metadata: Canonical backend-owned metadata for the video.
        database_path: Repository-owned SQLite database path.

    Returns:
        Persisted indexed video record.
    """
    with _open_connection(database_path) as connection:
        video_id = _next_video_id(connection)
        connection.execute(
            """
            INSERT INTO videos (
              video_id,
              filepath,
              fps,
              frame_count,
              width,
              height,
              duration_seconds
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (
                video_id,
                filepath,
                metadata.fps,
                metadata.frame_count,
                metadata.width,
                metadata.height,
                metadata.duration_seconds,
            ),
        )

    return IndexedVideo(video_id=video_id, filepath=filepath, **metadata.model_dump())


def _next_video_id(connection: sqlite3.Connection) -> str:
    rows = connection.execute("SELECT video_id FROM videos").fetchall()
    max_index = 0

    for row in rows:
        raw_video_id = row["video_id"]
        if not isinstance(raw_video_id, str) or not raw_video_id.startswith("vid_"):
            continue

        suffix = raw_video_id.removeprefix("vid_")
        if not suffix.isdigit():
            continue

        max_index = max(max_index, int(suffix))

    return f"vid_{max_index + 1:03d}"


def _row_to_indexed_video(row: sqlite3.Row) -> IndexedVideo:
    return IndexedVideo(
        video_id=_get_str(row, "video_id"),
        filepath=_get_str(row, "filepath"),
        fps=float(row["fps"]),
        frame_count=int(row["frame_count"]),
        width=int(row["width"]),
        height=int(row["height"]),
        duration_seconds=float(row["duration_seconds"]),
    )


def _get_str(row: sqlite3.Row, column_name: str) -> str:
    value = row[column_name]
    if not isinstance(value, str):
        raise RuntimeError(f"SQLite column {column_name} must be a string")
    return value
