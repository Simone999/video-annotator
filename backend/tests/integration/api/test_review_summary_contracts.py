"""Backend API integration tests for review-summary contracts."""

from collections.abc import Callable
from datetime import datetime
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

import app.main as main_module
from app.db import ExportRecord, FrameAnnotation, Job, ObjectTrack
from app.db.migrations import upgrade_database
from app.db.seeds.baseline import seed_baseline
from app.db.session import get_engine, get_session_factory
from app.services.video_metadata import VideoMetadata

type VideoInspector = Callable[[Path], VideoMetadata]


def test_video_routes_derive_review_summary_fields_from_persisted_state(
    monkeypatch: pytest.MonkeyPatch,
    tmp_path: Path,
) -> None:
    """Expose honest review-state and summary fields for library-driven routes."""
    database_path = tmp_path / "review-summary.sqlite3"
    source_dir = tmp_path / "videos"
    source_dir.mkdir()
    _write_video_stub(source_dir / "not_started.mp4")
    _write_video_stub(source_dir / "started.mp4")
    _write_video_stub(source_dir / "ready.mp4")
    _write_video_stub(source_dir / "in_progress.mp4")

    _configure_backend_for_test(
        monkeypatch=monkeypatch,
        database_path=database_path,
        source_dir=source_dir,
        inspect_video=_build_video_inspector(
            {
                "not_started.mp4": VideoMetadata(
                    frame_count=120,
                    fps=24.0,
                    width=640,
                    height=360,
                    duration_seconds=5.0,
                ),
                "started.mp4": VideoMetadata(
                    frame_count=120,
                    fps=24.0,
                    width=640,
                    height=360,
                    duration_seconds=5.0,
                ),
                "ready.mp4": VideoMetadata(
                    frame_count=120,
                    fps=24.0,
                    width=640,
                    height=360,
                    duration_seconds=5.0,
                ),
                "in_progress.mp4": VideoMetadata(
                    frame_count=120,
                    fps=24.0,
                    width=640,
                    height=360,
                    duration_seconds=5.0,
                ),
            }
        ),
    )

    try:
        with TestClient(main_module.create_app()) as client:
            initial_videos_response = client.get("/api/videos")
            video_ids_by_name = {
                video["display_name"]: video["id"] for video in initial_videos_response.json()
            }
            _seed_review_summary_state(video_ids_by_name=video_ids_by_name)

            list_response = client.get("/api/videos")
            ready_detail_response = client.get(f"/api/videos/{video_ids_by_name['ready.mp4']}")
            in_progress_detail_response = client.get(
                f"/api/videos/{video_ids_by_name['in_progress.mp4']}"
            )
    finally:
        _clear_database_caches()

    assert initial_videos_response.status_code == 200
    assert list_response.status_code == 200
    assert ready_detail_response.status_code == 200
    assert in_progress_detail_response.status_code == 200

    videos_by_name = {video["display_name"]: video for video in list_response.json()}
    assert videos_by_name["not_started.mp4"]["review_state"] == "not_started"
    assert videos_by_name["not_started.mp4"]["propagation_progress_percent"] is None
    assert videos_by_name["not_started.mp4"]["review_summary"] == {
        "annotated_frame_count": 0,
        "imported_frame_count": 0,
        "keyframe_count": 0,
        "last_annotated_frame_idx": None,
        "last_reviewed_frame_idx": None,
        "manual_frame_count": 0,
        "object_count": 0,
        "propagated_frame_count": 0,
    }

    assert videos_by_name["started.mp4"]["review_state"] == "started"
    assert videos_by_name["started.mp4"]["review_summary"] == {
        "annotated_frame_count": 1,
        "imported_frame_count": 1,
        "keyframe_count": 1,
        "last_annotated_frame_idx": 11,
        "last_reviewed_frame_idx": None,
        "manual_frame_count": 0,
        "object_count": 1,
        "propagated_frame_count": 0,
    }

    assert videos_by_name["ready.mp4"]["review_state"] == "ready"
    assert videos_by_name["ready.mp4"]["propagation_progress_percent"] is None
    assert videos_by_name["ready.mp4"]["review_summary"] == {
        "annotated_frame_count": 2,
        "imported_frame_count": 0,
        "keyframe_count": 1,
        "last_annotated_frame_idx": 6,
        "last_reviewed_frame_idx": None,
        "manual_frame_count": 0,
        "object_count": 1,
        "propagated_frame_count": 1,
    }
    assert videos_by_name["ready.mp4"]["review_state"] != "exported"

    assert videos_by_name["in_progress.mp4"]["review_state"] == "in_progress"
    assert videos_by_name["in_progress.mp4"]["propagation_progress_percent"] == 50
    assert videos_by_name["in_progress.mp4"]["review_summary"] == {
        "annotated_frame_count": 1,
        "imported_frame_count": 0,
        "keyframe_count": 1,
        "last_annotated_frame_idx": 7,
        "last_reviewed_frame_idx": 7,
        "manual_frame_count": 1,
        "object_count": 1,
        "propagated_frame_count": 0,
    }

    assert ready_detail_response.json()["review_summary"] == {
        "annotated_frame_count": 2,
        "imported_frame_count": 0,
        "keyframe_count": 1,
        "last_annotated_frame_idx": 6,
        "last_reviewed_frame_idx": None,
        "manual_frame_count": 0,
        "object_count": 1,
        "propagated_frame_count": 1,
    }
    assert in_progress_detail_response.json()["propagation_progress_percent"] == 50


def test_video_routes_flip_ready_video_to_exported_then_back_to_ready_after_later_edit(
    monkeypatch: pytest.MonkeyPatch,
    tmp_path: Path,
) -> None:
    """Treat export state as fresh snapshot truth, not sticky terminal state."""
    database_path = tmp_path / "export-state.sqlite3"
    source_dir = tmp_path / "videos"
    source_dir.mkdir()
    _write_video_stub(source_dir / "ready.mp4")

    _configure_backend_for_test(
        monkeypatch=monkeypatch,
        database_path=database_path,
        source_dir=source_dir,
        inspect_video=_build_video_inspector(
            {
                "ready.mp4": VideoMetadata(
                    frame_count=120,
                    fps=24.0,
                    width=640,
                    height=360,
                    duration_seconds=5.0,
                ),
            }
        ),
    )

    try:
        with TestClient(main_module.create_app()) as client:
            initial_videos_response = client.get("/api/videos")
            video_id = initial_videos_response.json()[0]["id"]
            ready_object_id = _seed_ready_video_export_state(video_id=video_id)

            ready_before_export_response = client.get(f"/api/videos/{video_id}")

            _record_export_snapshot(video_id=video_id)
            exported_list_response = client.get("/api/videos")
            exported_detail_response = client.get(f"/api/videos/{video_id}")

            _append_later_manual_edit(video_id=video_id, object_id=ready_object_id)
            ready_after_edit_list_response = client.get("/api/videos")
            ready_after_edit_detail_response = client.get(f"/api/videos/{video_id}")
    finally:
        _clear_database_caches()

    assert initial_videos_response.status_code == 200
    assert ready_before_export_response.status_code == 200
    assert exported_list_response.status_code == 200
    assert exported_detail_response.status_code == 200
    assert ready_after_edit_list_response.status_code == 200
    assert ready_after_edit_detail_response.status_code == 200

    assert ready_before_export_response.json()["review_state"] == "ready"
    assert exported_list_response.json()[0]["review_state"] == "exported"
    assert exported_detail_response.json()["review_state"] == "exported"
    assert ready_after_edit_list_response.json()[0]["review_state"] == "ready"
    assert ready_after_edit_detail_response.json()["review_state"] == "ready"


def test_selected_object_summary_route_returns_bbox_confidence_and_corrected_range_counters(
    monkeypatch: pytest.MonkeyPatch,
    tmp_path: Path,
) -> None:
    """Return current-frame object display data plus corrected-range counters from source truth."""
    database_path = tmp_path / "selected-object-summary.sqlite3"
    source_dir = tmp_path / "videos"
    source_dir.mkdir()
    _write_video_stub(source_dir / "ready.mp4")
    _write_video_stub(source_dir / "other.mp4")

    _configure_backend_for_test(
        monkeypatch=monkeypatch,
        database_path=database_path,
        source_dir=source_dir,
        inspect_video=_build_video_inspector(
            {
                "ready.mp4": VideoMetadata(
                    frame_count=120,
                    fps=24.0,
                    width=640,
                    height=360,
                    duration_seconds=5.0,
                ),
                "other.mp4": VideoMetadata(
                    frame_count=120,
                    fps=24.0,
                    width=640,
                    height=360,
                    duration_seconds=5.0,
                ),
            }
        ),
    )

    try:
        with TestClient(main_module.create_app()) as client:
            initial_videos_response = client.get("/api/videos")
            video_ids_by_name = {
                video["display_name"]: video["id"] for video in initial_videos_response.json()
            }
            ready_object_id = _seed_selected_object_summary_state(
                ready_video_id=video_ids_by_name["ready.mp4"],
                other_video_id=video_ids_by_name["other.mp4"],
            )

            summary_response = client.get(
                f"/api/videos/{video_ids_by_name['ready.mp4']}/objects/{ready_object_id}/summary",
                params={
                    "end_frame_idx": 7,
                    "frame_idx": 5,
                    "start_frame_idx": 4,
                },
            )
            propagated_current_response = client.get(
                f"/api/videos/{video_ids_by_name['ready.mp4']}/objects/{ready_object_id}/summary",
                params={
                    "end_frame_idx": 7,
                    "frame_idx": 6,
                    "start_frame_idx": 4,
                },
            )
            corrected_current_response = client.get(
                f"/api/videos/{video_ids_by_name['ready.mp4']}/objects/{ready_object_id}/summary",
                params={
                    "end_frame_idx": 7,
                    "frame_idx": 4,
                    "start_frame_idx": 4,
                },
            )
            corrected_keyframe_response = client.get(
                f"/api/videos/{video_ids_by_name['ready.mp4']}/objects/{ready_object_id}/summary",
                params={
                    "end_frame_idx": 7,
                    "frame_idx": 7,
                    "start_frame_idx": 4,
                },
            )
            wrong_video_response = client.get(
                f"/api/videos/{video_ids_by_name['other.mp4']}/objects/{ready_object_id}/summary",
                params={
                    "end_frame_idx": 7,
                    "frame_idx": 5,
                    "start_frame_idx": 4,
                },
            )
    finally:
        _clear_database_caches()

    assert initial_videos_response.status_code == 200
    assert summary_response.status_code == 200
    assert propagated_current_response.status_code == 200
    assert corrected_current_response.status_code == 200
    assert corrected_keyframe_response.status_code == 200
    assert wrong_video_response.status_code == 404

    assert summary_response.json() == {
        "bbox_xyxy_px": [64, 72, 192, 180],
        "label": "pedestrian",
        "mask_confidence": None,
        "object_id": ready_object_id,
        "track_summary": {
            "corrected": 1,
            "frames": 4,
            "manual": 3,
            "missing": 0,
            "propagated": 1,
        },
        "video_id": video_ids_by_name["ready.mp4"],
    }
    assert propagated_current_response.json() == {
        "bbox_xyxy_px": None,
        "label": "pedestrian",
        "mask_confidence": 0.81,
        "object_id": ready_object_id,
        "track_summary": {
            "corrected": 1,
            "frames": 4,
            "manual": 3,
            "missing": 0,
            "propagated": 1,
        },
        "video_id": video_ids_by_name["ready.mp4"],
    }
    assert corrected_current_response.json() == {
        "bbox_xyxy_px": None,
        "label": "pedestrian",
        "mask_confidence": None,
        "object_id": ready_object_id,
        "track_summary": {
            "corrected": 1,
            "frames": 4,
            "manual": 3,
            "missing": 0,
            "propagated": 1,
        },
        "video_id": video_ids_by_name["ready.mp4"],
    }
    assert corrected_keyframe_response.json() == {
        "bbox_xyxy_px": [256, 54, 384, 126],
        "label": "pedestrian",
        "mask_confidence": None,
        "object_id": ready_object_id,
        "track_summary": {
            "corrected": 1,
            "frames": 4,
            "manual": 3,
            "missing": 0,
            "propagated": 1,
        },
        "video_id": video_ids_by_name["ready.mp4"],
    }
    assert wrong_video_response.json() == {"detail": "Object track not found"}


def _seed_review_summary_state(*, video_ids_by_name: dict[str, str]) -> None:
    """Persist deterministic rows that exercise review-summary derivation rules."""
    session_factory = get_session_factory()
    with session_factory() as session:
        started_object = ObjectTrack(
            id="object-started",
            video_id=video_ids_by_name["started.mp4"],
            label="crate",
            color="#00ffaa",
            status="active",
        )
        ready_object = ObjectTrack(
            id="object-ready",
            video_id=video_ids_by_name["ready.mp4"],
            label="pedestrian",
            color="#00ffaa",
            status="active",
        )
        in_progress_object = ObjectTrack(
            id="object-in-progress",
            video_id=video_ids_by_name["in_progress.mp4"],
            label="forklift",
            color="#00ffaa",
            status="active",
        )
        session.add_all([started_object, ready_object, in_progress_object])
        session.add_all(
            [
                FrameAnnotation(
                    id="annotation-started",
                    video_id=video_ids_by_name["started.mp4"],
                    frame_idx=11,
                    object_id=started_object.id,
                    is_keyframe=True,
                    source="imported",
                    box_x=0.1,
                    box_y=0.2,
                    box_w=0.2,
                    box_h=0.2,
                    mask_path=None,
                    mask_rle=None,
                    created_at=datetime(2026, 4, 24, 9, 0, 0),
                    updated_at=datetime(2026, 4, 24, 9, 0, 0),
                ),
                FrameAnnotation(
                    id="annotation-ready-keyframe",
                    video_id=video_ids_by_name["ready.mp4"],
                    frame_idx=5,
                    object_id=ready_object.id,
                    is_keyframe=True,
                    source="sam2",
                    box_x=0.1,
                    box_y=0.2,
                    box_w=0.2,
                    box_h=0.3,
                    mask_path="masks/ready/object-ready/frame_000005.png",
                    mask_rle=None,
                    created_at=datetime(2026, 4, 24, 9, 0, 0),
                    updated_at=datetime(2026, 4, 24, 9, 0, 0),
                ),
                FrameAnnotation(
                    id="annotation-ready-propagated",
                    video_id=video_ids_by_name["ready.mp4"],
                    frame_idx=6,
                    object_id=ready_object.id,
                    is_keyframe=False,
                    source="sam2",
                    box_x=None,
                    box_y=None,
                    box_w=None,
                    box_h=None,
                    mask_path="masks/ready/object-ready/frame_000006.png",
                    mask_rle=None,
                    created_at=datetime(2026, 4, 24, 9, 1, 0),
                    updated_at=datetime(2026, 4, 24, 9, 1, 0),
                ),
                FrameAnnotation(
                    id="annotation-in-progress-manual",
                    video_id=video_ids_by_name["in_progress.mp4"],
                    frame_idx=7,
                    object_id=in_progress_object.id,
                    is_keyframe=True,
                    source="manual",
                    box_x=0.25,
                    box_y=0.3,
                    box_w=0.15,
                    box_h=0.2,
                    mask_path=None,
                    mask_rle=None,
                    created_at=datetime(2026, 4, 24, 9, 2, 0),
                    updated_at=datetime(2026, 4, 24, 9, 2, 0),
                ),
                Job(
                    id="job-in-progress",
                    type="sam2_propagation",
                    video_id=video_ids_by_name["in_progress.mp4"],
                    object_id=in_progress_object.id,
                    session_id="session-in-progress",
                    status="running",
                    progress_current=2,
                    progress_total=4,
                    payload_json={
                        "direction": "forward",
                        "end_frame_idx": 10,
                        "object_ids": [in_progress_object.id],
                        "start_frame_idx": 7,
                    },
                    result_json=None,
                    error_message=None,
                    cancel_requested_at=None,
                    started_at=datetime(2026, 4, 21, 10, 0, 0),
                    completed_at=None,
                ),
            ]
        )
        session.commit()


def _seed_ready_video_export_state(*, video_id: str) -> str:
    """Persist one ready video with explicit review-output timestamps."""
    ready_object_id = "object-ready-export"
    session_factory = get_session_factory()
    with session_factory() as session:
        ready_object = ObjectTrack(
            id=ready_object_id,
            video_id=video_id,
            label="pedestrian",
            color="#00ffaa",
            status="active",
        )
        session.add(ready_object)
        session.add_all(
            [
                FrameAnnotation(
                    id="annotation-ready-export-keyframe",
                    video_id=video_id,
                    frame_idx=5,
                    object_id=ready_object.id,
                    is_keyframe=True,
                    source="manual",
                    box_x=0.1,
                    box_y=0.2,
                    box_w=0.2,
                    box_h=0.3,
                    mask_path=None,
                    mask_rle=None,
                    created_at=datetime(2026, 4, 24, 9, 0, 0),
                    updated_at=datetime(2026, 4, 24, 9, 0, 0),
                ),
                FrameAnnotation(
                    id="annotation-ready-export-propagated",
                    video_id=video_id,
                    frame_idx=6,
                    object_id=ready_object.id,
                    is_keyframe=False,
                    source="sam2",
                    box_x=None,
                    box_y=None,
                    box_w=None,
                    box_h=None,
                    mask_path="masks/ready/object-ready-export/frame_000006.png",
                    mask_rle=None,
                    created_at=datetime(2026, 4, 24, 9, 1, 0),
                    updated_at=datetime(2026, 4, 24, 9, 1, 0),
                ),
            ]
        )
        session.commit()

    return ready_object_id


def _record_export_snapshot(*, video_id: str) -> None:
    """Persist one export record that matches current review-output freshness."""
    session_factory = get_session_factory()
    with session_factory() as session:
        session.add(
            ExportRecord(
                id="export-ready-current",
                video_id=video_id,
                review_output_updated_at=datetime(2026, 4, 24, 9, 1, 0),
                created_at=datetime(2026, 4, 24, 9, 5, 0),
            )
        )
        session.commit()


def _append_later_manual_edit(*, video_id: str, object_id: str) -> None:
    """Persist one later edit that should make the last export stale."""
    session_factory = get_session_factory()
    with session_factory() as session:
        session.add(
            FrameAnnotation(
                id="annotation-ready-export-later-manual",
                video_id=video_id,
                frame_idx=8,
                object_id=object_id,
                is_keyframe=True,
                source="manual",
                box_x=0.2,
                box_y=0.25,
                box_w=0.15,
                box_h=0.2,
                mask_path=None,
                mask_rle=None,
                created_at=datetime(2026, 4, 24, 9, 10, 0),
                updated_at=datetime(2026, 4, 24, 9, 10, 0),
            )
        )
        session.commit()


def _seed_selected_object_summary_state(
    *,
    ready_video_id: str,
    other_video_id: str,
) -> str:
    """Persist one selected-object workflow state and return its object id."""
    ready_object_id = "object-ready"
    session_factory = get_session_factory()
    with session_factory() as session:
        ready_object = ObjectTrack(
            id=ready_object_id,
            video_id=ready_video_id,
            label="pedestrian",
            color="#00ffaa",
            status="active",
        )
        other_object = ObjectTrack(
            id="object-other",
            video_id=other_video_id,
            label="other",
            color="#00ffaa",
            status="active",
        )
        session.add_all([ready_object, other_object])
        session.add_all(
            [
                FrameAnnotation(
                    id="annotation-ready-corrected-propagated",
                    video_id=ready_video_id,
                    frame_idx=4,
                    object_id=ready_object.id,
                    is_keyframe=False,
                    source="sam2_edited",
                    box_x=None,
                    box_y=None,
                    box_w=None,
                    box_h=None,
                    mask_path="masks/ready/object-ready/frame_000004.png",
                    mask_confidence=0.63,
                    mask_rle=None,
                ),
                FrameAnnotation(
                    id="annotation-ready-keyframe",
                    video_id=ready_video_id,
                    frame_idx=5,
                    object_id=ready_object.id,
                    is_keyframe=True,
                    source="manual",
                    box_x=0.1,
                    box_y=0.2,
                    box_w=0.2,
                    box_h=0.3,
                    mask_path=None,
                    mask_rle=None,
                ),
                FrameAnnotation(
                    id="annotation-ready-propagated",
                    video_id=ready_video_id,
                    frame_idx=6,
                    object_id=ready_object.id,
                    is_keyframe=False,
                    source="sam2",
                    box_x=None,
                    box_y=None,
                    box_w=None,
                    box_h=None,
                    mask_path="masks/ready/object-ready/frame_000006.png",
                    mask_confidence=0.81,
                    mask_rle=None,
                ),
                FrameAnnotation(
                    id="annotation-ready-corrected-keyframe",
                    video_id=ready_video_id,
                    frame_idx=7,
                    object_id=ready_object.id,
                    is_keyframe=True,
                    source="sam2_edited",
                    box_x=0.4,
                    box_y=0.15,
                    box_w=0.2,
                    box_h=0.2,
                    mask_path="masks/ready/object-ready/frame_000007.png",
                    mask_confidence=0.92,
                    mask_rle=None,
                ),
            ]
        )
        session.commit()

    return ready_object_id


def _configure_backend_for_test(
    *,
    monkeypatch: pytest.MonkeyPatch,
    database_path: Path,
    source_dir: Path,
    inspect_video: VideoInspector,
) -> None:
    """Point cached backend globals at temp storage for one integration test."""
    monkeypatch.setenv("APP_DB_URL", f"sqlite:///{database_path}")
    _clear_database_caches()
    upgrade_database(database_url=f"sqlite:///{database_path}")
    seed_baseline(
        database_url=f"sqlite:///{database_path}",
        source_dir=source_dir,
        inspect_video=inspect_video,
    )


def _clear_database_caches() -> None:
    """Reset cached engine and session factory between isolated backend tests."""
    get_session_factory.cache_clear()
    get_engine.cache_clear()


def _write_video_stub(video_path: Path) -> None:
    """Create one local video-path placeholder for indexing tests."""
    video_path.write_bytes(b"fake-video-file")


def _build_video_inspector(
    metadata_by_name: dict[str, VideoMetadata],
) -> VideoInspector:
    """Return a metadata inspector that maps file name to fixed metadata."""

    def inspect_video(video_path: Path) -> VideoMetadata:
        """Return fixed metadata for known test video paths."""
        return metadata_by_name[video_path.name]

    return inspect_video
