"""Integration tests for explicit local database prepare and legacy repair."""

import sqlite3
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

import app.main as main_module
from app.db.migrations import prepare_database, upgrade_database
from app.db.session import get_engine, get_session_factory


def test_prepare_database_repairs_legacy_local_sqlite_manifest_data(
    monkeypatch: pytest.MonkeyPatch,
    tmp_path: Path,
) -> None:
    """Repair known pre-Alembic local SQLite shape before manifest reads."""
    database_path = tmp_path / "video-annotator.sqlite3"
    backup_path = tmp_path / "video-annotator.sqlite3.bak"
    _write_legacy_database(database_path)
    _configure_backend_for_test(
        monkeypatch=monkeypatch,
        database_path=database_path,
    )

    try:
        prepare_database(database_url=f"sqlite:///{database_path}")

        with TestClient(main_module.create_app()) as client:
            response = client.get("/api/videos/video-legacy/manifest")
    finally:
        _clear_database_caches()

    assert backup_path.exists()
    assert response.status_code == 200
    assert response.json() == {
        "video": {
            "id": "video-legacy",
            "frame_count": 240,
            "fps": 24.0,
            "width": 1920,
            "height": 1080,
            "duration_seconds": 10.0,
            "review_state": "ready",
            "propagation_progress_percent": None,
            "review_summary": {
                "object_count": 1,
                "annotated_frame_count": 1,
                "imported_frame_count": 0,
                "keyframe_count": 1,
                "manual_frame_count": 1,
                "propagated_frame_count": 0,
                "last_annotated_frame_idx": 0,
                "last_reviewed_frame_idx": 0,
            },
        },
        "objects": [
            {
                "id": "4",
                "label": "legacy-box",
                "color": "#00ffaa",
                "status": "active",
            }
        ],
        "annotated_frames": [0],
        "keyframes": [0],
    }


def test_prepare_database_is_noop_for_current_alembic_database(
    monkeypatch: pytest.MonkeyPatch,
    tmp_path: Path,
) -> None:
    """Leave already-versioned databases alone."""
    database_path = tmp_path / "video-current.sqlite3"
    backup_path = tmp_path / "video-current.sqlite3.bak"
    _configure_backend_for_test(
        monkeypatch=monkeypatch,
        database_path=database_path,
    )

    try:
        upgrade_database(database_url=f"sqlite:///{database_path}")
        with sqlite3.connect(database_path) as connection:
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
                (
                    "video-current",
                    "/tmp/video-current.mp4",
                    "video-current.mp4",
                    120,
                    30.0,
                    1280,
                    720,
                    4.0,
                ),
            )
            connection.commit()

        prepare_database(database_url=f"sqlite:///{database_path}")

        with sqlite3.connect(database_path) as connection:
            rows = connection.execute("SELECT id FROM videos").fetchall()
    finally:
        _clear_database_caches()

    assert backup_path.exists() is False
    assert rows == [("video-current",)]


def _write_legacy_database(database_path: Path) -> None:
    """Create one pre-Alembic database shaped like the broken local DB."""
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
                PRIMARY KEY (id),
                FOREIGN KEY(video_id) REFERENCES videos (id)
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
                PRIMARY KEY (id),
                CONSTRAINT uq_frame_annotations_video_frame_object
                    UNIQUE (video_id, frame_idx, object_id),
                FOREIGN KEY(video_id) REFERENCES videos (id),
                FOREIGN KEY(object_id) REFERENCES object_tracks (id)
            );

            CREATE TABLE sam2_sessions (
                id VARCHAR(255) NOT NULL,
                video_id VARCHAR(255) NOT NULL,
                status VARCHAR(64) NOT NULL,
                created_at DATETIME NOT NULL,
                last_used_at DATETIME NOT NULL,
                closed_at DATETIME,
                PRIMARY KEY (id)
            );

            CREATE TABLE jobs (
                id VARCHAR(255) NOT NULL,
                type VARCHAR(64) NOT NULL,
                video_id VARCHAR(255) NOT NULL,
                object_id VARCHAR(255),
                session_id VARCHAR(255) NOT NULL,
                status VARCHAR(64) NOT NULL,
                progress_current INTEGER NOT NULL,
                progress_total INTEGER NOT NULL,
                payload_json JSON NOT NULL,
                result_json JSON,
                error_message TEXT,
                cancel_requested_at DATETIME,
                started_at DATETIME,
                completed_at DATETIME,
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
            (
                "video-legacy",
                "/tmp/video-legacy.mp4",
                "video-legacy.mp4",
                240,
                24.0,
                1920,
                1080,
                10.0,
            ),
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
            (4, "video-legacy", "legacy-box", None, "active"),
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
            (
                2,
                "video-legacy",
                0,
                4,
                1,
                "manual",
                0.1,
                0.2,
                0.3,
                0.4,
                None,
                None,
            ),
        )
        connection.commit()


def _configure_backend_for_test(
    *,
    monkeypatch: pytest.MonkeyPatch,
    database_path: Path,
) -> None:
    """Point cached backend globals at temp storage for one integration test."""
    monkeypatch.setenv("APP_DB_URL", f"sqlite:///{database_path}")
    _clear_database_caches()


def _clear_database_caches() -> None:
    """Reset cached engine and session factory between isolated backend tests."""
    get_session_factory.cache_clear()
    get_engine.cache_clear()
