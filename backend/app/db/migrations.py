"""Explicit database migration helpers."""

import json
import shutil
import sqlite3
from datetime import datetime
from pathlib import Path

from alembic.config import Config
from sqlalchemy.engine import make_url

from alembic import command
from app.core.config import get_database_url

BACKEND_ROOT = Path(__file__).resolve().parents[2]
ALEMBIC_CONFIG_PATH = BACKEND_ROOT / "alembic.ini"
LEGACY_DEFAULT_OBJECT_COLOR = "#00ffaa"
LEGACY_DEFAULT_OBJECT_STATUS = "active"


def upgrade_database(*, database_url: str | None = None) -> None:
    """Upgrade backend schema to the current head revision."""
    config = Config(str(ALEMBIC_CONFIG_PATH))
    config.set_main_option("sqlalchemy.url", database_url or get_database_url())
    command.upgrade(config, "head")


def prepare_database(*, database_url: str | None = None) -> None:
    """Repair known legacy local SQLite state, then upgrade to current schema."""
    resolved_database_url = database_url or get_database_url()
    repair_legacy_local_sqlite_database(database_url=resolved_database_url)
    upgrade_database(database_url=resolved_database_url)


def repair_legacy_local_sqlite_database(*, database_url: str) -> None:
    """Repair known pre-Alembic SQLite layout by rewriting it into fresh schema."""
    database_path = _resolve_sqlite_database_path(database_url)
    if database_path is None or database_path.exists() is False:
        return

    if _database_has_alembic_version(database_path):
        return

    if _database_needs_legacy_repair(database_path) is False:
        return

    backup_path = database_path.with_suffix(f"{database_path.suffix}.bak")
    shutil.copy2(database_path, backup_path)

    repaired_path = database_path.with_suffix(f"{database_path.suffix}.repaired")
    if repaired_path.exists():
        repaired_path.unlink()

    upgrade_database(database_url=f"sqlite:///{repaired_path}")
    _copy_legacy_sqlite_data(source_path=database_path, target_path=repaired_path)
    shutil.move(repaired_path, database_path)


def _resolve_sqlite_database_path(database_url: str) -> Path | None:
    """Return filesystem path for SQLite URLs and `None` for other database kinds."""
    url = make_url(database_url)
    if url.drivername != "sqlite" or url.database in (None, ":memory:"):
        return None

    return Path(url.database).resolve()


def _database_has_alembic_version(database_path: Path) -> bool:
    """Return whether the database is already Alembic-managed."""
    with sqlite3.connect(database_path) as connection:
        return _table_exists(connection, "alembic_version")


def _database_needs_legacy_repair(database_path: Path) -> bool:
    """Detect the known pre-Alembic schema drift that breaks current code."""
    with sqlite3.connect(database_path) as connection:
        if _table_exists(connection, "object_tracks") is False:
            return False

        object_track_columns = _read_table_info(connection, "object_tracks")
        frame_annotation_columns = _read_table_info(connection, "frame_annotations")

    object_track_id = object_track_columns.get("id")
    object_track_color = object_track_columns.get("color")
    frame_annotation_id = frame_annotation_columns.get("id")
    frame_annotation_object_id = frame_annotation_columns.get("object_id")

    return (
        object_track_id is not None
        and str(object_track_id["type"]).upper() == "INTEGER"
        and object_track_color is not None
        and object_track_color["notnull"] == 0
        and frame_annotation_id is not None
        and str(frame_annotation_id["type"]).upper() == "INTEGER"
        and frame_annotation_object_id is not None
        and str(frame_annotation_object_id["type"]).upper() == "INTEGER"
    )


def _read_table_info(
    connection: sqlite3.Connection,
    table_name: str,
) -> dict[str, dict[str, int | str]]:
    """Return SQLite pragma info keyed by column name."""
    rows = connection.execute(f"PRAGMA table_info({table_name})").fetchall()
    return {
        str(row[1]): {
            "type": str(row[2]),
            "notnull": int(row[3]),
        }
        for row in rows
    }


def _table_exists(connection: sqlite3.Connection, table_name: str) -> bool:
    """Return whether one SQLite table exists."""
    row = connection.execute(
        "SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = ?",
        (table_name,),
    ).fetchone()
    return row is not None


def _copy_legacy_sqlite_data(*, source_path: Path, target_path: Path) -> None:
    """Copy known legacy tables into the fresh Alembic schema."""
    repaired_at = datetime.now().isoformat(sep=" ")

    with (
        sqlite3.connect(source_path) as source_connection,
        sqlite3.connect(target_path) as target_connection,
    ):
        _copy_videos(source_connection, target_connection)
        _copy_object_tracks(source_connection, target_connection)
        _copy_frame_annotations(
            source_connection,
            target_connection,
            repaired_at=repaired_at,
        )
        _copy_table_if_present("export_records", source_connection, target_connection)
        _copy_table_if_present("sam2_sessions", source_connection, target_connection)
        _copy_table_if_present("jobs", source_connection, target_connection)
        target_connection.commit()


def _copy_videos(
    source_connection: sqlite3.Connection,
    target_connection: sqlite3.Connection,
) -> None:
    """Copy indexed videos unchanged."""
    rows = source_connection.execute(
        """
        SELECT
            id,
            source_path,
            display_name,
            frame_count,
            fps,
            width,
            height,
            duration_seconds
        FROM videos
        """
    ).fetchall()
    target_connection.executemany(
        """
        INSERT INTO videos (
            id,
            source_path,
            display_name,
            frame_count,
            fps,
            width,
            height,
            duration_seconds
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """,
        rows,
    )


def _copy_object_tracks(
    source_connection: sqlite3.Connection,
    target_connection: sqlite3.Connection,
) -> None:
    """Normalize legacy object-track rows into current schema."""
    rows = source_connection.execute(
        """
        SELECT id, video_id, label, color, status
        FROM object_tracks
        ORDER BY id
        """
    ).fetchall()
    target_connection.executemany(
        """
        INSERT INTO object_tracks (
            id,
            video_id,
            label,
            color,
            status
        ) VALUES (?, ?, ?, ?, ?)
        """,
        [
            (
                str(row[0]),
                row[1],
                row[2],
                row[3] or LEGACY_DEFAULT_OBJECT_COLOR,
                row[4] or LEGACY_DEFAULT_OBJECT_STATUS,
            )
            for row in rows
        ],
    )


def _copy_frame_annotations(
    source_connection: sqlite3.Connection,
    target_connection: sqlite3.Connection,
    *,
    repaired_at: str,
) -> None:
    """Normalize legacy frame-annotation rows into current schema."""
    rows = source_connection.execute(
        """
        SELECT
            id,
            video_id,
            frame_idx,
            object_id,
            is_keyframe,
            source,
            box_x,
            box_y,
            box_w,
            box_h,
            mask_path,
            mask_rle
        FROM frame_annotations
        ORDER BY frame_idx, object_id
        """
    ).fetchall()
    target_connection.executemany(
        """
        INSERT INTO frame_annotations (
            id,
            video_id,
            frame_idx,
            object_id,
            is_keyframe,
            source,
            box_x,
            box_y,
            box_w,
            box_h,
            mask_path,
            mask_confidence,
            mask_rle,
            created_at,
            updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        [
            (
                str(row[0]),
                row[1],
                row[2],
                str(row[3]),
                row[4],
                row[5],
                row[6],
                row[7],
                row[8],
                row[9],
                row[10],
                None,
                _normalize_legacy_mask_rle(row[11]),
                repaired_at,
                repaired_at,
            )
            for row in rows
        ],
    )


def _copy_table_if_present(
    table_name: str,
    source_connection: sqlite3.Connection,
    target_connection: sqlite3.Connection,
) -> None:
    """Copy same-shaped tables unchanged when they exist in legacy DB."""
    if _table_exists(source_connection, table_name) is False:
        return

    pragma_rows = source_connection.execute(f"PRAGMA table_info({table_name})")
    column_names = [str(row[1]) for row in pragma_rows]
    if not column_names:
        return

    quoted_columns = ", ".join(column_names)
    placeholders = ", ".join("?" for _ in column_names)
    rows = source_connection.execute(f"SELECT {quoted_columns} FROM {table_name}").fetchall()
    if not rows:
        return

    target_connection.executemany(
        f"INSERT INTO {table_name} ({quoted_columns}) VALUES ({placeholders})",
        rows,
    )


def _normalize_legacy_mask_rle(mask_rle: object) -> str | None:
    """Preserve valid JSON object-or-array mask payloads and drop the rest."""
    if mask_rle in (None, ""):
        return None

    if isinstance(mask_rle, (dict, list)):
        return json.dumps(mask_rle)

    if isinstance(mask_rle, str):
        try:
            parsed_payload = json.loads(mask_rle)
        except json.JSONDecodeError:
            return None

        if isinstance(parsed_payload, (dict, list)):
            return json.dumps(parsed_payload)

    return None
