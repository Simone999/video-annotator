"""Unit tests for explicit database prepare and legacy repair helpers."""

import sqlite3
from pathlib import Path

from app.db.migrations import (
    _copy_table_if_present,
    _database_needs_legacy_repair,
    _normalize_legacy_mask_rle,
    _resolve_sqlite_database_path,
    repair_legacy_local_sqlite_database,
)


def test_resolve_sqlite_database_path_rejects_non_sqlite_and_memory_urls() -> None:
    """Return `None` for URLs that do not point at a SQLite file."""
    assert _resolve_sqlite_database_path("postgresql://localhost/video_annotator") is None
    assert _resolve_sqlite_database_path("sqlite:///:memory:") is None


def test_database_needs_legacy_repair_is_false_without_object_tracks(tmp_path: Path) -> None:
    """Do not flag unrelated SQLite files as legacy manifest DBs."""
    database_path = tmp_path / "plain.sqlite3"

    with sqlite3.connect(database_path) as connection:
        connection.execute("CREATE TABLE videos (id TEXT PRIMARY KEY)")
        connection.commit()

    assert _database_needs_legacy_repair(database_path) is False


def test_repair_legacy_local_sqlite_database_skips_missing_and_nonlegacy_files(
    tmp_path: Path,
) -> None:
    """Return early for missing SQLite files and current-shaped files without versioning."""
    missing_path = tmp_path / "missing.sqlite3"

    repair_legacy_local_sqlite_database(database_url=f"sqlite:///{missing_path}")

    current_like_path = tmp_path / "current-like.sqlite3"
    with sqlite3.connect(current_like_path) as connection:
        connection.executescript(
            """
            CREATE TABLE object_tracks (
                id VARCHAR(255) NOT NULL PRIMARY KEY,
                video_id VARCHAR(255) NOT NULL,
                label VARCHAR(255) NOT NULL,
                color VARCHAR(32) NOT NULL,
                status VARCHAR(32) NOT NULL
            );

            CREATE TABLE frame_annotations (
                id VARCHAR(255) NOT NULL PRIMARY KEY,
                video_id VARCHAR(255) NOT NULL,
                frame_idx INTEGER NOT NULL,
                object_id VARCHAR(255) NOT NULL,
                is_keyframe BOOLEAN NOT NULL,
                source VARCHAR(64) NOT NULL,
                box_x FLOAT,
                box_y FLOAT,
                box_w FLOAT,
                box_h FLOAT,
                mask_path VARCHAR,
                mask_confidence FLOAT,
                mask_rle JSON,
                created_at DATETIME NOT NULL,
                updated_at DATETIME NOT NULL
            );
            """
        )
        connection.commit()

    repair_legacy_local_sqlite_database(database_url=f"sqlite:///{current_like_path}")

    assert missing_path.exists() is False
    assert current_like_path.with_suffix(".sqlite3.bak").exists() is False


def test_repair_legacy_local_sqlite_database_replaces_stale_repaired_file(
    tmp_path: Path,
) -> None:
    """Drop stale repaired temp file before rebuilding the database."""
    database_path = tmp_path / "legacy.sqlite3"
    repaired_path = tmp_path / "legacy.sqlite3.repaired"
    _write_legacy_manifest_database(database_path)
    repaired_path.write_text("stale", encoding="utf-8")

    repair_legacy_local_sqlite_database(database_url=f"sqlite:///{database_path}")

    with sqlite3.connect(database_path) as connection:
        rows = connection.execute("SELECT id, color FROM object_tracks").fetchall()

    assert repaired_path.exists() is False
    assert database_path.with_suffix(".sqlite3.bak").exists()
    assert rows == [("4", "#00ffaa")]


def test_copy_table_if_present_skips_missing_table_and_copies_existing_rows(
    tmp_path: Path,
) -> None:
    """Leave missing tables alone and copy same-shaped rows when present."""
    source_path = tmp_path / "source.sqlite3"
    target_path = tmp_path / "target.sqlite3"

    with (
        sqlite3.connect(source_path) as source_connection,
        sqlite3.connect(target_path) as target_connection,
    ):
        source_connection.execute(
            """
            CREATE TABLE sam2_sessions (
                id TEXT NOT NULL PRIMARY KEY,
                video_id TEXT NOT NULL,
                status TEXT NOT NULL,
                created_at TEXT NOT NULL,
                last_used_at TEXT NOT NULL,
                closed_at TEXT
            )
            """
        )
        target_connection.execute(
            """
            CREATE TABLE sam2_sessions (
                id TEXT NOT NULL PRIMARY KEY,
                video_id TEXT NOT NULL,
                status TEXT NOT NULL,
                created_at TEXT NOT NULL,
                last_used_at TEXT NOT NULL,
                closed_at TEXT
            )
            """
        )
        source_connection.execute(
            """
            INSERT INTO sam2_sessions (
                id,
                video_id,
                status,
                created_at,
                last_used_at,
                closed_at
            ) VALUES (?, ?, ?, ?, ?, ?)
            """,
            ("session-1", "video-1", "open", "2026-04-22 10:00:00", "2026-04-22 10:00:00", None),
        )
        source_connection.commit()

        _copy_table_if_present("jobs", source_connection, target_connection)
        _copy_table_if_present("sam2_sessions", source_connection, target_connection)

        copied_rows = target_connection.execute(
            "SELECT id, video_id, status FROM sam2_sessions"
        ).fetchall()

    assert copied_rows == [("session-1", "video-1", "open")]


def test_normalize_legacy_mask_rle_keeps_supported_json_and_drops_the_rest() -> None:
    """Preserve JSON object-or-array payloads and drop invalid or scalar inputs."""
    assert _normalize_legacy_mask_rle(None) is None
    assert _normalize_legacy_mask_rle("") is None
    assert _normalize_legacy_mask_rle({"counts": [1, 2]}) == '{"counts": [1, 2]}'
    assert _normalize_legacy_mask_rle("[1, 2]") == "[1, 2]"
    assert _normalize_legacy_mask_rle("{bad json") is None
    assert _normalize_legacy_mask_rle("42") is None
    assert _normalize_legacy_mask_rle(42) is None


def _write_legacy_manifest_database(database_path: Path) -> None:
    """Create one minimal legacy DB that needs repair."""
    with sqlite3.connect(database_path) as connection:
        connection.executescript(
            """
            CREATE TABLE videos (
                id VARCHAR(255) NOT NULL,
                source_path VARCHAR NOT NULL,
                display_name VARCHAR(255) NOT NULL,
                frame_count INTEGER NOT NULL,
                fps FLOAT NOT NULL,
                width INTEGER NOT NULL,
                height INTEGER NOT NULL,
                duration_seconds FLOAT,
                PRIMARY KEY (id)
            );

            CREATE TABLE object_tracks (
                id INTEGER NOT NULL,
                video_id VARCHAR(255) NOT NULL,
                label VARCHAR(255) NOT NULL,
                color VARCHAR(32),
                status VARCHAR(64) NOT NULL,
                PRIMARY KEY (id)
            );

            CREATE TABLE frame_annotations (
                id INTEGER NOT NULL,
                video_id VARCHAR(255) NOT NULL,
                frame_idx INTEGER NOT NULL,
                object_id INTEGER NOT NULL,
                is_keyframe BOOLEAN NOT NULL,
                source VARCHAR(64) NOT NULL,
                box_x FLOAT NOT NULL,
                box_y FLOAT NOT NULL,
                box_w FLOAT NOT NULL,
                box_h FLOAT NOT NULL,
                mask_path VARCHAR,
                mask_rle VARCHAR,
                PRIMARY KEY (id)
            );
            """
        )
        connection.execute(
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
            ("video-legacy", "/tmp/video.mp4", "video.mp4", 24, 24.0, 1920, 1080, 1.0),
        )
        connection.execute(
            """
            INSERT INTO object_tracks (
                id,
                video_id,
                label,
                color,
                status
            ) VALUES (?, ?, ?, ?, ?)
            """,
            (4, "video-legacy", "legacy", None, "active"),
        )
        connection.execute(
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
                mask_rle
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (2, "video-legacy", 0, 4, 1, "manual", 0.1, 0.2, 0.3, 0.4, None, None),
        )
        connection.commit()
