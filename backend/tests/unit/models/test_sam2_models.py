"""Tests for persisted SAM2 session and job metadata models."""

from datetime import datetime
from pathlib import Path

from sqlalchemy import create_engine, inspect
from sqlalchemy.orm import Session

from app.db import models
from app.db.base import Base


def test_sam2_session_model_persists_reusable_session_metadata(tmp_path: Path) -> None:
    """Create the SAM2 session table and persist reusable session metadata."""
    database_path = tmp_path / "video-annotator.sqlite3"
    engine = create_engine(f"sqlite:///{database_path}")

    Base.metadata.create_all(engine)

    sam2_session_model = getattr(models, "Sam2Session", None)
    assert sam2_session_model is not None

    inspector = inspect(engine)
    columns = {column["name"]: column for column in inspector.get_columns("sam2_sessions")}

    assert set(columns) == {
        "id",
        "video_id",
        "status",
        "created_at",
        "last_used_at",
        "closed_at",
    }
    assert columns["id"]["nullable"] is False
    assert columns["video_id"]["nullable"] is False
    assert columns["status"]["nullable"] is False
    assert columns["created_at"]["nullable"] is False
    assert columns["last_used_at"]["nullable"] is False
    assert columns["closed_at"]["nullable"] is True

    session_metadata = sam2_session_model(
        id="sam2-session-001",
        video_id="video-001",
        status="active",
        created_at=datetime(2026, 4, 16, 0, 0, 0),
        last_used_at=datetime(2026, 4, 16, 0, 5, 0),
    )

    with Session(engine) as session:
        session.add(session_metadata)
        session.commit()
        loaded_metadata = session.get(sam2_session_model, "sam2-session-001")

    assert loaded_metadata is not None
    assert loaded_metadata.video_id == "video-001"
    assert loaded_metadata.status == "active"
    assert loaded_metadata.created_at == datetime(2026, 4, 16, 0, 0, 0)
    assert loaded_metadata.last_used_at == datetime(2026, 4, 16, 0, 5, 0)
    assert loaded_metadata.closed_at is None


def test_job_model_persists_sam2_propagation_tracking_metadata(tmp_path: Path) -> None:
    """Create the job table and persist deterministic SAM2 propagation metadata."""
    database_path = tmp_path / "video-annotator.sqlite3"
    engine = create_engine(f"sqlite:///{database_path}")

    Base.metadata.create_all(engine)

    job_model = getattr(models, "Job", None)
    assert job_model is not None

    inspector = inspect(engine)
    columns = {column["name"]: column for column in inspector.get_columns("jobs")}

    assert set(columns) == {
        "id",
        "type",
        "video_id",
        "object_id",
        "session_id",
        "status",
        "progress_current",
        "progress_total",
        "payload_json",
        "result_json",
        "error_message",
        "cancel_requested_at",
        "started_at",
        "completed_at",
    }
    assert columns["id"]["nullable"] is False
    assert columns["type"]["nullable"] is False
    assert columns["video_id"]["nullable"] is False
    assert columns["object_id"]["nullable"] is True
    assert columns["session_id"]["nullable"] is False
    assert columns["status"]["nullable"] is False
    assert columns["progress_current"]["nullable"] is False
    assert columns["progress_total"]["nullable"] is False
    assert columns["payload_json"]["nullable"] is False
    assert columns["result_json"]["nullable"] is True
    assert columns["error_message"]["nullable"] is True
    assert columns["cancel_requested_at"]["nullable"] is True
    assert columns["started_at"]["nullable"] is True
    assert columns["completed_at"]["nullable"] is True

    job = job_model(
        id="job-001",
        type="sam2_propagation",
        video_id="video-001",
        object_id=None,
        session_id="sam2-session-001",
        status="queued",
        progress_current=0,
        progress_total=12,
        payload_json={
            "direction": "forward",
            "start_frame_idx": 10,
            "end_frame_idx": 21,
            "object_ids": ["object-1"],
        },
        result_json=None,
        error_message=None,
    )

    with Session(engine) as session:
        session.add(job)
        session.commit()
        loaded_job = session.get(job_model, "job-001")

    assert loaded_job is not None
    assert loaded_job.type == "sam2_propagation"
    assert loaded_job.video_id == "video-001"
    assert loaded_job.object_id is None
    assert loaded_job.session_id == "sam2-session-001"
    assert loaded_job.status == "queued"
    assert loaded_job.progress_current == 0
    assert loaded_job.progress_total == 12
    assert loaded_job.payload_json == {
        "direction": "forward",
        "start_frame_idx": 10,
        "end_frame_idx": 21,
        "object_ids": ["object-1"],
    }
    assert loaded_job.result_json is None
    assert loaded_job.error_message is None
    assert loaded_job.cancel_requested_at is None
    assert loaded_job.started_at is None
    assert loaded_job.completed_at is None
