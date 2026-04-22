"""Unit tests for video API route error mapping and serialization."""

from collections.abc import Callable
from pathlib import Path
from types import SimpleNamespace
from typing import cast

import pytest
from fastapi import HTTPException, Response
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

import app.api.videos as videos_api_module
from app.schemas.sam2 import Sam2PromptBoxRequest, Sam2PropagationRequest
from app.schemas.video import CreateObjectTrackRequest, ManualFrameAnnotationRequest
from app.services import (
    FrameAnnotationNotFoundError,
    FrameIndexOutOfRangeError,
    InvalidBoxCoordinatesError,
    InvalidPropagationRangeError,
    InvalidReviewSummaryRangeError,
    ManualFrameAnnotationNotFoundError,
    ManualFrameAnnotationObjectTrackNotFoundError,
    ManualFrameAnnotationVideoNotFoundError,
    ObjectTrackSummaryNotFoundError,
    Sam2SessionNotFoundError,
    Sam2VideoNotFoundError,
    Sam2VideoSourceNotAvailableError,
)
from app.services.sam2 import (
    Sam2PropagationJobResult,
    Sam2RuntimeNotConfiguredError,
    Sam2SessionResult,
)
from app.services.video_frames import ExactFramePayload, IndexedVideoNotFoundError


def _build_video_record() -> SimpleNamespace:
    return SimpleNamespace(
        propagation_progress_percent=50,
        review_state="in_progress",
        review_summary=SimpleNamespace(
            annotated_frame_count=4,
            imported_frame_count=1,
            keyframe_count=2,
            last_annotated_frame_idx=7,
            last_reviewed_frame_idx=5,
            manual_frame_count=2,
            object_count=3,
            propagated_frame_count=2,
        ),
        video=SimpleNamespace(
            display_name="sample.bin",
            duration_seconds=1.5,
            fps=24.0,
            frame_count=12,
            height=200,
            id="video-1",
            source_path="/tmp/sample.bin",
            width=400,
        ),
    )


def _raise(error: Exception) -> None:
    raise error


def _raiser(error: Exception) -> Callable[..., None]:
    return lambda **_kwargs: _raise(error)


def test_get_video_and_manifest_routes_serialize_records_and_map_not_found(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """Serialize video records and reject unknown video or manifest lookups."""
    video_record = _build_video_record()
    manifest = SimpleNamespace(
        annotated_frames=[3, 7],
        keyframes=[7],
        objects=[
            SimpleNamespace(
                color="#00ffaa",
                id="object-1",
                label="left hand",
                status="active",
            )
        ],
    )
    session = cast(Session, object())

    monkeypatch.setattr(
        videos_api_module,
        "get_indexed_video_with_review_summary",
        lambda **_kwargs: video_record,
    )
    monkeypatch.setattr(videos_api_module, "get_video_manifest", lambda **_kwargs: manifest)

    video_response = videos_api_module.get_video("video-1", session=session)
    manifest_response = videos_api_module.get_video_manifest_summary(
        "video-1",
        session=session,
    )

    assert video_response.id == "video-1"
    assert video_response.review_summary.object_count == 3
    assert manifest_response.video.id == "video-1"
    assert manifest_response.objects[0].label == "left hand"

    monkeypatch.setattr(
        videos_api_module,
        "get_indexed_video_with_review_summary",
        lambda **_kwargs: None,
    )
    with pytest.raises(HTTPException, match="Indexed video not found") as video_error:
        videos_api_module.get_video("missing-video", session=session)
    assert video_error.value.status_code == 404

    monkeypatch.setattr(videos_api_module, "get_video_manifest", lambda **_kwargs: None)
    with pytest.raises(HTTPException, match="Indexed video not found") as manifest_error:
        videos_api_module.get_video_manifest_summary("missing-video", session=session)
    assert manifest_error.value.status_code == 404


def test_create_object_and_selected_summary_routes_map_service_errors(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """Map object-create and selected-summary service errors to HTTP contracts."""
    session = cast(Session, object())
    object_request = CreateObjectTrackRequest(label="left hand")

    monkeypatch.setattr(videos_api_module, "create_object_track", lambda **_kwargs: None)
    with pytest.raises(HTTPException, match="Indexed video not found") as create_error:
        videos_api_module.create_video_object("missing-video", object_request, session=session)
    assert create_error.value.status_code == 404

    monkeypatch.setattr(
        videos_api_module,
        "create_object_track",
        lambda **_kwargs: SimpleNamespace(
            color="#00ffaa",
            id="object-1",
            label="left hand",
            status="active",
        ),
    )
    created_object = videos_api_module.create_video_object(
        "video-1",
        object_request,
        session=session,
    )
    assert created_object.id == "object-1"

    summary_request = {
        "video_id": "video-1",
        "object_id": "object-1",
        "frame_idx": 7,
        "start_frame_idx": 7,
        "end_frame_idx": 9,
        "session": session,
    }

    monkeypatch.setattr(
        videos_api_module,
        "get_selected_object_summary",
        lambda **_kwargs: (_ for _ in ()).throw(ObjectTrackSummaryNotFoundError("object-1")),
    )
    with pytest.raises(HTTPException, match="Object track not found") as summary_error:
        videos_api_module.get_video_object_summary(**summary_request)
    assert summary_error.value.status_code == 404

    monkeypatch.setattr(
        videos_api_module,
        "get_selected_object_summary",
        lambda **_kwargs: (_ for _ in ()).throw(FrameIndexOutOfRangeError(frame_count=12)),
    )
    with pytest.raises(HTTPException, match="between 0 and 11") as frame_error:
        videos_api_module.get_video_object_summary(**summary_request)
    assert frame_error.value.status_code == 400

    monkeypatch.setattr(
        videos_api_module,
        "get_selected_object_summary",
        lambda **_kwargs: (_ for _ in ()).throw(
            InvalidReviewSummaryRangeError("bad selected range")
        ),
    )
    with pytest.raises(HTTPException, match="bad selected range") as range_error:
        videos_api_module.get_video_object_summary(**summary_request)
    assert range_error.value.status_code == 400

    monkeypatch.setattr(videos_api_module, "get_selected_object_summary", lambda **_kwargs: None)
    with pytest.raises(HTTPException, match="Indexed video not found") as missing_video_error:
        videos_api_module.get_video_object_summary(**summary_request)
    assert missing_video_error.value.status_code == 404

    monkeypatch.setattr(
        videos_api_module,
        "get_selected_object_summary",
        lambda **_kwargs: SimpleNamespace(
            bbox_xyxy_px=(12, 24, 96, 144),
            label="left hand",
            mask_confidence=None,
            object_id="object-1",
            track_summary=SimpleNamespace(corrected=None, frames=3, propagated=2),
            video_id="video-1",
        ),
    )
    summary_response = videos_api_module.get_video_object_summary(**summary_request)
    assert summary_response.track_summary.frames == 3
    assert summary_response.bbox_xyxy_px == (12, 24, 96, 144)


def test_manual_annotation_routes_map_errors_and_serialize_success(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """Map manual-annotation route errors and serialize successful payloads."""
    session = cast(Session, object())
    request = ManualFrameAnnotationRequest(
        object_id="object-1",
        is_keyframe=True,
        box_xywh_norm=[0.1, 0.2, 0.3, 0.4],
    )
    route_args = {
        "video_id": "video-1",
        "frame_idx": 7,
        "payload": request,
        "session": session,
    }

    monkeypatch.setattr(
        videos_api_module,
        "upsert_manual_frame_annotation",
        lambda **_kwargs: (_ for _ in ()).throw(ManualFrameAnnotationVideoNotFoundError("video-1")),
    )
    with pytest.raises(HTTPException, match="Indexed video not found") as video_error:
        videos_api_module.put_video_frame_manual_annotation(**route_args)
    assert video_error.value.status_code == 404

    monkeypatch.setattr(
        videos_api_module,
        "upsert_manual_frame_annotation",
        lambda **_kwargs: (_ for _ in ()).throw(
            ManualFrameAnnotationObjectTrackNotFoundError("object-1")
        ),
    )
    with pytest.raises(HTTPException, match="Object track not found") as object_error:
        videos_api_module.put_video_frame_manual_annotation(**route_args)
    assert object_error.value.status_code == 404

    monkeypatch.setattr(
        videos_api_module,
        "upsert_manual_frame_annotation",
        lambda **_kwargs: (_ for _ in ()).throw(FrameIndexOutOfRangeError(frame_count=12)),
    )
    with pytest.raises(HTTPException, match="between 0 and 11") as frame_error:
        videos_api_module.put_video_frame_manual_annotation(**route_args)
    assert frame_error.value.status_code == 400

    monkeypatch.setattr(
        videos_api_module,
        "upsert_manual_frame_annotation",
        lambda **_kwargs: SimpleNamespace(
            box_h=None,
            box_w=0.3,
            box_x=0.1,
            box_y=0.2,
            frame_idx=7,
            is_keyframe=True,
            mask_path=None,
            object_id="object-1",
            source="manual",
            video_id="video-1",
        ),
    )
    with pytest.raises(RuntimeError, match="persisted box coordinates"):
        videos_api_module.put_video_frame_manual_annotation(**route_args)

    monkeypatch.setattr(
        videos_api_module,
        "upsert_manual_frame_annotation",
        lambda **_kwargs: SimpleNamespace(
            box_h=0.4,
            box_w=0.3,
            box_x=0.1,
            box_y=0.2,
            frame_idx=7,
            is_keyframe=True,
            mask_path=None,
            object_id="object-1",
            source="manual",
            video_id="video-1",
        ),
    )
    annotation_response = videos_api_module.put_video_frame_manual_annotation(**route_args)
    assert annotation_response.box_xywh_norm == [0.1, 0.2, 0.3, 0.4]

    delete_args = {
        "video_id": "video-1",
        "frame_idx": 7,
        "object_id": "object-1",
        "session": session,
    }
    monkeypatch.setattr(
        videos_api_module,
        "delete_manual_frame_annotation",
        lambda **_kwargs: (_ for _ in ()).throw(ManualFrameAnnotationVideoNotFoundError("video-1")),
    )
    with pytest.raises(HTTPException, match="Indexed video not found") as delete_video_error:
        videos_api_module.delete_video_frame_manual_annotation(**delete_args)
    assert delete_video_error.value.status_code == 404

    monkeypatch.setattr(
        videos_api_module,
        "delete_manual_frame_annotation",
        lambda **_kwargs: (_ for _ in ()).throw(ManualFrameAnnotationNotFoundError("object-1")),
    )
    with pytest.raises(HTTPException, match="Frame annotation not found") as delete_missing_error:
        videos_api_module.delete_video_frame_manual_annotation(**delete_args)
    assert delete_missing_error.value.status_code == 404

    monkeypatch.setattr(
        videos_api_module,
        "delete_manual_frame_annotation",
        lambda **_kwargs: (_ for _ in ()).throw(FrameIndexOutOfRangeError(frame_count=12)),
    )
    with pytest.raises(HTTPException, match="between 0 and 11") as delete_frame_error:
        videos_api_module.delete_video_frame_manual_annotation(**delete_args)
    assert delete_frame_error.value.status_code == 400

    monkeypatch.setattr(videos_api_module, "delete_manual_frame_annotation", lambda **_kwargs: None)
    delete_response = videos_api_module.delete_video_frame_manual_annotation(**delete_args)
    assert isinstance(delete_response, Response)
    assert delete_response.status_code == 204


def test_annotation_read_source_frame_and_mask_routes_map_errors_and_success(
    monkeypatch: pytest.MonkeyPatch,
    tmp_path: Path,
) -> None:
    """Map annotation read, source, frame, and mask route errors to HTTP contracts."""
    session = cast(Session, object())
    indexed_video = SimpleNamespace(frame_count=12, source_path=str(tmp_path / "sample.bin"))

    monkeypatch.setattr(videos_api_module, "get_indexed_video_by_id", lambda **_kwargs: None)
    with pytest.raises(HTTPException, match="Indexed video not found") as read_video_error:
        videos_api_module.get_video_frame_annotations("video-1", 7, session=session)
    assert read_video_error.value.status_code == 404

    monkeypatch.setattr(
        videos_api_module,
        "get_indexed_video_by_id",
        lambda **_kwargs: indexed_video,
    )
    with pytest.raises(HTTPException, match="between 0 and 11") as read_frame_error:
        videos_api_module.get_video_frame_annotations("video-1", 12, session=session)
    assert read_frame_error.value.status_code == 400

    monkeypatch.setattr(
        videos_api_module,
        "list_frame_annotations",
        lambda **_kwargs: [
            SimpleNamespace(
                box_xywh_norm=None,
                mask_confidence=0.71,
                mask_path=None,
                object_id="object-1",
                source="sam2",
            ),
            SimpleNamespace(
                box_xywh_norm=(0.1, 0.2, 0.3, 0.4),
                mask_confidence=None,
                mask_path="masks/video-1/object-2/frame_000007.png",
                object_id="object-2",
                source="manual",
            ),
        ],
    )
    frame_annotations_response = videos_api_module.get_video_frame_annotations(
        "video-1",
        7,
        session=session,
    )
    assert len(frame_annotations_response.annotations) == 2
    assert frame_annotations_response.annotations[0].mask_confidence == 0.71
    second_mask = frame_annotations_response.annotations[1].mask
    assert second_mask is not None
    assert second_mask.path == "masks/video-1/object-2/frame_000007.png"
    assert frame_annotations_response.annotations[1].mask_confidence is None

    monkeypatch.setattr(videos_api_module, "get_indexed_video_by_id", lambda **_kwargs: None)
    with pytest.raises(HTTPException, match="Indexed video not found") as source_error:
        videos_api_module.get_video_source(
            "missing-video",
            session=cast(Session, object()),
        )
    assert source_error.value.status_code == 404

    source_path = tmp_path / "sample.bin"
    source_path.write_bytes(b"video")
    monkeypatch.setattr(
        videos_api_module,
        "get_indexed_video_by_id",
        lambda **_kwargs: SimpleNamespace(source_path=str(source_path), frame_count=12),
    )
    source_response = videos_api_module.get_video_source("video-1", session=session)
    assert isinstance(source_response, FileResponse)
    assert source_response.media_type == "application/octet-stream"

    monkeypatch.setattr(
        videos_api_module,
        "load_exact_video_frame",
        lambda **_kwargs: (_ for _ in ()).throw(IndexedVideoNotFoundError("video-1")),
    )
    with pytest.raises(HTTPException, match="Indexed video not found") as frame_video_error:
        videos_api_module.get_video_frame("video-1", 7, session=session)
    assert frame_video_error.value.status_code == 404

    monkeypatch.setattr(
        videos_api_module,
        "load_exact_video_frame",
        lambda **_kwargs: (_ for _ in ()).throw(FrameIndexOutOfRangeError(frame_count=12)),
    )
    with pytest.raises(HTTPException, match="between 0 and 11") as frame_range_error:
        videos_api_module.get_video_frame("video-1", 12, session=session)
    assert frame_range_error.value.status_code == 400

    monkeypatch.setattr(
        videos_api_module,
        "load_exact_video_frame",
        lambda **_kwargs: ExactFramePayload(content=b"png-bytes", media_type="image/png"),
    )
    exact_frame_response = videos_api_module.get_video_frame("video-1", 7, session=session)
    assert exact_frame_response.media_type == "image/png"
    assert exact_frame_response.body == b"png-bytes"

    monkeypatch.setattr(videos_api_module, "get_indexed_video_by_id", lambda **_kwargs: None)
    with pytest.raises(HTTPException, match="Indexed video not found") as mask_video_error:
        videos_api_module.get_video_frame_annotation_mask(
            "video-1",
            7,
            "object-1",
            session=session,
        )
    assert mask_video_error.value.status_code == 404

    monkeypatch.setattr(
        videos_api_module,
        "get_indexed_video_by_id",
        lambda **_kwargs: indexed_video,
    )
    with pytest.raises(HTTPException, match="between 0 and 11") as mask_range_error:
        videos_api_module.get_video_frame_annotation_mask(
            "video-1",
            12,
            "object-1",
            session=session,
        )
    assert mask_range_error.value.status_code == 400

    monkeypatch.setattr(
        videos_api_module,
        "get_frame_annotation_mask_path",
        lambda **_kwargs: (_ for _ in ()).throw(FrameAnnotationNotFoundError("object-1")),
    )
    with pytest.raises(HTTPException, match="Frame annotation not found") as mask_missing_error:
        videos_api_module.get_video_frame_annotation_mask(
            "video-1",
            7,
            "object-1",
            session=session,
        )
    assert mask_missing_error.value.status_code == 404

    mask_path = tmp_path / "mask.data"
    mask_path.write_bytes(b"mask")
    monkeypatch.setattr(
        videos_api_module,
        "get_frame_annotation_mask_path",
        lambda **_kwargs: mask_path,
    )
    mask_response = videos_api_module.get_video_frame_annotation_mask(
        "video-1",
        7,
        "object-1",
        session=session,
    )
    assert isinstance(mask_response, FileResponse)
    assert mask_response.media_type == "application/octet-stream"


def test_sam2_routes_map_errors_and_serialize_success(monkeypatch: pytest.MonkeyPatch) -> None:
    """Map SAM2 route service errors and serialize successful responses."""
    session = cast(Session, object())

    monkeypatch.setattr(
        videos_api_module,
        "create_or_reuse_sam2_session",
        lambda **_kwargs: (_ for _ in ()).throw(Sam2VideoNotFoundError("video-1")),
    )
    with pytest.raises(HTTPException, match="Indexed video not found") as session_error:
        videos_api_module.create_video_sam2_session("video-1", session=session)
    assert session_error.value.status_code == 404

    monkeypatch.setattr(
        videos_api_module,
        "create_or_reuse_sam2_session",
        lambda **_kwargs: (_ for _ in ()).throw(Sam2VideoSourceNotAvailableError("video-1")),
    )
    with pytest.raises(HTTPException, match="source is not available") as source_error:
        videos_api_module.create_video_sam2_session("video-1", session=session)
    assert source_error.value.status_code == 409

    monkeypatch.setattr(
        videos_api_module,
        "create_or_reuse_sam2_session",
        lambda **_kwargs: Sam2SessionResult(session_id="sam2-session-1", reused=True),
    )
    session_response = videos_api_module.create_video_sam2_session("video-1", session=session)
    assert session_response.session_id == "sam2-session-1"
    assert session_response.reused is True

    monkeypatch.setattr(
        videos_api_module,
        "close_sam2_session",
        lambda **_kwargs: (_ for _ in ()).throw(Sam2SessionNotFoundError("sam2-session-1")),
    )
    with pytest.raises(HTTPException, match="SAM2 session not found") as close_error:
        videos_api_module.delete_video_sam2_session(
            "video-1",
            "sam2-session-1",
            session=session,
        )
    assert close_error.value.status_code == 404

    monkeypatch.setattr(videos_api_module, "close_sam2_session", lambda **_kwargs: None)
    close_response = videos_api_module.delete_video_sam2_session(
        "video-1",
        "sam2-session-1",
        session=session,
    )
    assert close_response.status_code == 204

    prompt_request = Sam2PromptBoxRequest(
        session_id="sam2-session-1",
        frame_idx=7,
        object_id="object-1",
        box_xyxy_px=[10, 20, 30, 40],
    )
    route_prompt_args = {"video_id": "video-1", "request": prompt_request, "session": session}

    for error, message, status_code in [
        (Sam2VideoNotFoundError("video-1"), "Indexed video not found", 404),
        (Sam2VideoSourceNotAvailableError("video-1"), "source is not available", 409),
        (Sam2SessionNotFoundError("sam2-session-1"), "SAM2 session not found", 404),
        (FrameIndexOutOfRangeError(frame_count=12), "between 0 and 11", 400),
        (InvalidBoxCoordinatesError("bad box"), "bad box", 400),
        (
            Sam2RuntimeNotConfiguredError("SAM2 runtime not configured"),
            "SAM2 runtime not configured",
            503,
        ),
    ]:
        monkeypatch.setattr(
            videos_api_module,
            "prompt_sam2_box",
            _raiser(error),
        )
        with pytest.raises(HTTPException, match=message) as prompt_error:
            videos_api_module.create_video_sam2_prompt_box(**route_prompt_args)
        assert prompt_error.value.status_code == status_code

    monkeypatch.setattr(
        videos_api_module,
        "prompt_sam2_box",
        lambda **_kwargs: SimpleNamespace(
            box_xywh_norm=(0.1, 0.2, 0.3, 0.4),
            frame_idx=7,
            mask_path="masks/video-1/object-1/frame_000007.png",
            object_id="object-1",
            source="sam2",
        ),
    )
    prompt_response = videos_api_module.create_video_sam2_prompt_box(**route_prompt_args)
    assert prompt_response.annotation.mask.path == "masks/video-1/object-1/frame_000007.png"

    propagation_request = Sam2PropagationRequest(
        session_id="sam2-session-1",
        start_frame_idx=7,
        end_frame_idx=9,
        direction="forward",
        object_ids=["object-1"],
    )
    route_propagation_args = {
        "video_id": "video-1",
        "request": propagation_request,
        "session": session,
    }
    for error, message, status_code in [
        (Sam2VideoNotFoundError("video-1"), "Indexed video not found", 404),
        (Sam2SessionNotFoundError("sam2-session-1"), "SAM2 session not found", 404),
        (FrameIndexOutOfRangeError(frame_count=12), "between 0 and 11", 400),
        (InvalidPropagationRangeError("bad range"), "bad range", 400),
    ]:
        monkeypatch.setattr(
            videos_api_module,
            "start_sam2_propagation_job",
            _raiser(error),
        )
        with pytest.raises(HTTPException, match=message) as propagation_error:
            videos_api_module.create_video_sam2_propagation_job(**route_propagation_args)
        assert propagation_error.value.status_code == status_code

    monkeypatch.setattr(
        videos_api_module,
        "start_sam2_propagation_job",
        lambda **_kwargs: Sam2PropagationJobResult(
            job_id="job-1",
            status="queued",
            progress_current=0,
            progress_total=2,
        ),
    )
    propagation_response = videos_api_module.create_video_sam2_propagation_job(
        **route_propagation_args
    )
    assert propagation_response.job_id == "job-1"
    assert propagation_response.progress_total == 2
