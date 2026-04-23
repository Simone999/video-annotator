"""Unit tests for deterministic native export manifest generation."""

from pathlib import Path

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from app.db import FrameAnnotation, ObjectTrack, Video
from app.db.base import Base
from app.services.exports import ExportVideoNotFoundError, build_native_json_export_payload


def _open_session(database_path: Path) -> Session:
    engine = create_engine(f"sqlite:///{database_path}")
    Base.metadata.create_all(engine)
    return Session(engine, expire_on_commit=False)


def _seed_export_fixture(session: Session) -> None:
    session.add(
        Video(
            id="video-export",
            source_path="/tmp/video-export.mp4",
            display_name="video-export.mp4",
            frame_count=24,
            fps=24.0,
            width=400,
            height=200,
            duration_seconds=1.0,
        )
    )
    session.add_all(
        [
            ObjectTrack(
                id="object-b",
                video_id="video-export",
                label="right",
                color="#22aaee",
                status="active",
            ),
            ObjectTrack(
                id="object-a",
                video_id="video-export",
                label="left",
                color="#ffaa22",
                status="active",
            ),
        ]
    )
    session.add_all(
        [
            FrameAnnotation(
                id="annotation-object-b-frame-9",
                video_id="video-export",
                frame_idx=9,
                object_id="object-b",
                is_keyframe=False,
                source="sam2",
                box_x=None,
                box_y=None,
                box_w=None,
                box_h=None,
                mask_path="masks/video-export/object-b/frame_000009.png",
                mask_confidence=0.73,
                mask_rle=None,
            ),
            FrameAnnotation(
                id="annotation-object-a-frame-7",
                video_id="video-export",
                frame_idx=7,
                object_id="object-a",
                is_keyframe=False,
                source="sam2_edited",
                box_x=None,
                box_y=None,
                box_w=None,
                box_h=None,
                mask_path="masks/video-export/object-a/frame_000007.png",
                mask_confidence=None,
                mask_rle=None,
            ),
            FrameAnnotation(
                id="annotation-object-a-frame-2",
                video_id="video-export",
                frame_idx=2,
                object_id="object-a",
                is_keyframe=True,
                source="manual",
                box_x=0.25,
                box_y=0.10,
                box_w=0.20,
                box_h=0.30,
                mask_path=None,
                mask_confidence=None,
                mask_rle=None,
            ),
        ]
    )
    session.commit()


def test_build_native_json_export_payload_emits_expected_manifest_shape(tmp_path: Path) -> None:
    """Build native manifest with deterministic ordering and honest field omission."""
    with _open_session(tmp_path / "export.sqlite3") as session:
        _seed_export_fixture(session)

        payload = build_native_json_export_payload(
            session=session,
            video_id="video-export",
        )

    assert payload == {
        "version": 1,
        "videos": [
            {
                "video_id": "video-export",
                "filepath": "/tmp/video-export.mp4",
                "fps": 24.0,
                "frame_count": 24,
                "objects": [
                    {
                        "id": "object-a",
                        "label": "left",
                        "frames": {
                            "2": {
                                "is_keyframe": True,
                                "source": "manual",
                                "box_xywh_norm": [0.25, 0.1, 0.2, 0.3],
                            },
                            "7": {
                                "is_keyframe": False,
                                "source": "sam2_edited",
                                "mask_path": "masks/video-export/object-a/frame_000007.png",
                            },
                        },
                    },
                    {
                        "id": "object-b",
                        "label": "right",
                        "frames": {
                            "9": {
                                "is_keyframe": False,
                                "source": "sam2",
                                "mask_path": "masks/video-export/object-b/frame_000009.png",
                            }
                        },
                    },
                ],
            }
        ],
    }


def test_build_native_json_export_payload_is_repeatable_for_same_persisted_state(
    tmp_path: Path,
) -> None:
    """Return exact same JSON-ready payload on repeated builds."""
    with _open_session(tmp_path / "export-repeat.sqlite3") as session:
        _seed_export_fixture(session)

        first_payload = build_native_json_export_payload(
            session=session,
            video_id="video-export",
        )
        second_payload = build_native_json_export_payload(
            session=session,
            video_id="video-export",
        )

    assert first_payload == second_payload


def test_build_native_json_export_payload_rejects_missing_video(tmp_path: Path) -> None:
    """Raise explicit error when export targets unknown video id."""
    with (
        _open_session(tmp_path / "export-missing.sqlite3") as session,
        pytest.raises(
            ExportVideoNotFoundError,
            match="missing-video",
        ),
    ):
        build_native_json_export_payload(
            session=session,
            video_id="missing-video",
        )
