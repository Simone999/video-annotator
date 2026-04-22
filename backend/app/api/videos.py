"""Video catalog API routes for milestone-01 review."""

from mimetypes import guess_type
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Response, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.db import get_db_session
from app.schemas import (
    AnnotationMaskSummary,
    CreateObjectTrackRequest,
    FrameAnnotationsForFrameResponse,
    ManifestVideoSummary,
    ManualFrameAnnotationRequest,
    ManualFrameAnnotationResponse,
    ObjectTrackSummary,
    Sam2PromptBoxRequest,
    Sam2PromptBoxResponse,
    Sam2PropagationJobResponse,
    Sam2PropagationRequest,
    Sam2SessionResponse,
    SelectedObjectSummaryResponse,
    SelectedObjectTrackSummary,
    VideoManifestResponse,
    VideoResponse,
    VideoReviewSummary,
)
from app.services import (
    FrameAnnotationNotFoundError,
    FrameIndexOutOfRangeError,
    IndexedVideoNotFoundError,
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
    VideoWithReviewSummaryRecord,
    close_sam2_session,
    create_object_track,
    create_or_reuse_sam2_session,
    delete_manual_frame_annotation,
    get_frame_annotation_mask_path,
    get_indexed_video_by_id,
    get_indexed_video_with_review_summary,
    get_sam2_service,
    get_selected_object_summary,
    get_video_manifest,
    list_frame_annotations,
    list_indexed_videos_with_review_summary,
    load_exact_video_frame,
    prompt_sam2_box,
    start_sam2_propagation_job,
    upsert_manual_frame_annotation,
)

router = APIRouter(prefix="/videos")

type DbSession = Annotated[Session, Depends(get_db_session)]


@router.get("", response_model=list[VideoResponse])
def get_videos(session: DbSession) -> list[VideoResponse]:
    """Return indexed milestone-01 videos for review selection."""
    videos = list_indexed_videos_with_review_summary(session=session)
    return [_serialize_video_response(video) for video in videos]


@router.get("/{video_id}", response_model=VideoResponse)
def get_video(video_id: str, session: DbSession) -> VideoResponse:
    """Return one indexed video by stable backend identifier."""
    video = get_indexed_video_with_review_summary(session=session, video_id=video_id)
    if video is None:
        raise HTTPException(status_code=404, detail="Indexed video not found")

    return _serialize_video_response(video)


@router.get("/{video_id}/manifest", response_model=VideoManifestResponse)
def get_video_manifest_summary(video_id: str, session: DbSession) -> VideoManifestResponse:
    """Return manifest summary for exact-frame review bootstrap."""
    manifest = get_video_manifest(session=session, video_id=video_id)
    if manifest is None:
        raise HTTPException(status_code=404, detail="Indexed video not found")
    video_summary = get_indexed_video_with_review_summary(session=session, video_id=video_id)
    if video_summary is None:
        raise HTTPException(status_code=404, detail="Indexed video not found")

    object_summaries = [
        ObjectTrackSummary.model_validate(object_track) for object_track in manifest.objects
    ]

    return VideoManifestResponse(
        video=ManifestVideoSummary(
            id=video_summary.video.id,
            frame_count=video_summary.video.frame_count,
            fps=video_summary.video.fps,
            width=video_summary.video.width,
            height=video_summary.video.height,
            duration_seconds=video_summary.video.duration_seconds,
            review_state=video_summary.review_state,
            propagation_progress_percent=video_summary.propagation_progress_percent,
            review_summary=_serialize_video_review_summary(video_summary),
        ),
        objects=object_summaries,
        annotated_frames=manifest.annotated_frames,
        keyframes=manifest.keyframes,
    )


@router.post("/{video_id}/objects", response_model=ObjectTrackSummary, status_code=201)
def create_video_object(
    video_id: str,
    payload: CreateObjectTrackRequest,
    session: DbSession,
) -> ObjectTrackSummary:
    """Create one stable object track for a selected indexed video."""
    object_track = create_object_track(
        session=session,
        video_id=video_id,
        label=payload.label,
    )
    if object_track is None:
        raise HTTPException(status_code=404, detail="Indexed video not found")

    return ObjectTrackSummary.model_validate(object_track)


@router.get(
    "/{video_id}/objects/{object_id}/summary",
    response_model=SelectedObjectSummaryResponse,
)
def get_video_object_summary(
    video_id: str,
    object_id: str,
    frame_idx: int,
    start_frame_idx: int,
    end_frame_idx: int,
    session: DbSession,
) -> SelectedObjectSummaryResponse:
    """Return selected-object summary data for current frame and selected range."""
    try:
        summary = get_selected_object_summary(
            session=session,
            video_id=video_id,
            object_id=object_id,
            frame_idx=frame_idx,
            start_frame_idx=start_frame_idx,
            end_frame_idx=end_frame_idx,
        )
    except ObjectTrackSummaryNotFoundError as error:
        raise HTTPException(status_code=404, detail="Object track not found") from error
    except FrameIndexOutOfRangeError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error
    except InvalidReviewSummaryRangeError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error

    if summary is None:
        raise HTTPException(status_code=404, detail="Indexed video not found")

    return SelectedObjectSummaryResponse(
        video_id=summary.video_id,
        object_id=summary.object_id,
        label=summary.label,
        bbox_xyxy_px=summary.bbox_xyxy_px,
        mask_confidence=summary.mask_confidence,
        track_summary=SelectedObjectTrackSummary(
            frames=summary.track_summary.frames,
            propagated=summary.track_summary.propagated,
            corrected=summary.track_summary.corrected,
        ),
    )


@router.put(
    "/{video_id}/annotations/frame/{frame_idx}",
    response_model=ManualFrameAnnotationResponse,
)
def put_video_frame_manual_annotation(
    video_id: str,
    frame_idx: int,
    payload: ManualFrameAnnotationRequest,
    session: DbSession,
) -> ManualFrameAnnotationResponse:
    """Upsert one manual annotation for one canonical frame."""
    try:
        annotation = upsert_manual_frame_annotation(
            session=session,
            video_id=video_id,
            frame_idx=frame_idx,
            object_id=payload.object_id,
            is_keyframe=payload.is_keyframe,
            box_xywh_norm=payload.box_xywh_norm,
        )
    except ManualFrameAnnotationVideoNotFoundError as error:
        raise HTTPException(status_code=404, detail="Indexed video not found") from error
    except ManualFrameAnnotationObjectTrackNotFoundError as error:
        raise HTTPException(status_code=404, detail="Object track not found") from error
    except FrameIndexOutOfRangeError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error

    if (
        annotation.box_x is None
        or annotation.box_y is None
        or annotation.box_w is None
        or annotation.box_h is None
    ):
        raise RuntimeError("Manual annotation response requires persisted box coordinates")

    return ManualFrameAnnotationResponse(
        video_id=annotation.video_id,
        frame_idx=annotation.frame_idx,
        object_id=annotation.object_id,
        is_keyframe=annotation.is_keyframe,
        source=annotation.source,
        box_xywh_norm=[
            annotation.box_x,
            annotation.box_y,
            annotation.box_w,
            annotation.box_h,
        ],
        mask=AnnotationMaskSummary(path=annotation.mask_path),
    )


@router.get(
    "/{video_id}/annotations/frame/{frame_idx}",
    response_model=FrameAnnotationsForFrameResponse,
)
def get_video_frame_annotations(
    video_id: str,
    frame_idx: int,
    session: DbSession,
) -> FrameAnnotationsForFrameResponse:
    """Return persisted annotations for one canonical frame."""
    video = get_indexed_video_by_id(session=session, video_id=video_id)
    if video is None:
        raise HTTPException(status_code=404, detail="Indexed video not found")

    if frame_idx < 0 or frame_idx >= video.frame_count:
        raise HTTPException(
            status_code=400,
            detail=str(FrameIndexOutOfRangeError(frame_count=video.frame_count)),
        )

    annotations = list_frame_annotations(
        session=session,
        video_id=video_id,
        frame_idx=frame_idx,
    )

    return FrameAnnotationsForFrameResponse.model_validate(
        {
            "frame_idx": frame_idx,
            "annotations": [
                {
                    "object_id": annotation.object_id,
                    "source": annotation.source,
                    "box_xywh_norm": annotation.box_xywh_norm,
                    "mask_confidence": annotation.mask_confidence,
                    "mask": (
                        None if annotation.mask_path is None else {"path": annotation.mask_path}
                    ),
                }
                for annotation in annotations
            ],
        }
    )


@router.delete("/{video_id}/annotations/frame/{frame_idx}/object/{object_id}", status_code=204)
def delete_video_frame_manual_annotation(
    video_id: str,
    frame_idx: int,
    object_id: str,
    session: DbSession,
) -> Response:
    """Delete one persisted manual annotation for one canonical frame."""
    try:
        delete_manual_frame_annotation(
            session=session,
            video_id=video_id,
            frame_idx=frame_idx,
            object_id=object_id,
        )
    except ManualFrameAnnotationVideoNotFoundError as error:
        raise HTTPException(status_code=404, detail="Indexed video not found") from error
    except ManualFrameAnnotationNotFoundError as error:
        raise HTTPException(status_code=404, detail="Frame annotation not found") from error
    except FrameIndexOutOfRangeError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error

    return Response(status_code=204)


@router.get("/{video_id}/source")
def get_video_source(video_id: str, session: DbSession) -> FileResponse:
    """Return the indexed local source video for contextual browser playback."""
    video = get_indexed_video_by_id(session=session, video_id=video_id)
    if video is None:
        raise HTTPException(status_code=404, detail="Indexed video not found")

    media_type = guess_type(video.source_path)[0] or "application/octet-stream"
    return FileResponse(path=video.source_path, media_type=media_type)


@router.get("/{video_id}/frame/{frame_idx}")
def get_video_frame(video_id: str, frame_idx: int, session: DbSession) -> Response:
    """Return one backend-decoded exact frame for canonical review."""
    try:
        frame = load_exact_video_frame(session=session, video_id=video_id, frame_idx=frame_idx)
    except IndexedVideoNotFoundError as error:
        raise HTTPException(status_code=404, detail="Indexed video not found") from error
    except FrameIndexOutOfRangeError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error

    return Response(content=frame.content, media_type=frame.media_type)


def _serialize_video_response(video: VideoWithReviewSummaryRecord) -> VideoResponse:
    """Convert one service-layer video summary record into API schema."""
    return VideoResponse(
        id=video.video.id,
        source_path=video.video.source_path,
        display_name=video.video.display_name,
        frame_count=video.video.frame_count,
        fps=video.video.fps,
        width=video.video.width,
        height=video.video.height,
        duration_seconds=video.video.duration_seconds,
        review_state=video.review_state,
        propagation_progress_percent=video.propagation_progress_percent,
        review_summary=_serialize_video_review_summary(video),
    )


def _serialize_video_review_summary(video: VideoWithReviewSummaryRecord) -> VideoReviewSummary:
    """Convert one service-layer review summary into API schema."""
    return VideoReviewSummary(
        object_count=video.review_summary.object_count,
        annotated_frame_count=video.review_summary.annotated_frame_count,
        imported_frame_count=video.review_summary.imported_frame_count,
        keyframe_count=video.review_summary.keyframe_count,
        manual_frame_count=video.review_summary.manual_frame_count,
        propagated_frame_count=video.review_summary.propagated_frame_count,
        last_annotated_frame_idx=video.review_summary.last_annotated_frame_idx,
        last_reviewed_frame_idx=video.review_summary.last_reviewed_frame_idx,
    )


@router.get("/{video_id}/annotations/frame/{frame_idx}/object/{object_id}/mask")
def get_video_frame_annotation_mask(
    video_id: str,
    frame_idx: int,
    object_id: str,
    session: DbSession,
) -> FileResponse:
    """Return one persisted annotation mask PNG for overlay rendering."""
    video = get_indexed_video_by_id(session=session, video_id=video_id)
    if video is None:
        raise HTTPException(status_code=404, detail="Indexed video not found")

    if frame_idx < 0 or frame_idx >= video.frame_count:
        raise HTTPException(
            status_code=400,
            detail=str(FrameIndexOutOfRangeError(frame_count=video.frame_count)),
        )

    try:
        mask_path = get_frame_annotation_mask_path(
            session=session,
            video_id=video_id,
            frame_idx=frame_idx,
            object_id=object_id,
        )
    except FrameAnnotationNotFoundError as error:
        raise HTTPException(status_code=404, detail="Frame annotation not found") from error

    media_type = guess_type(mask_path.name)[0] or "application/octet-stream"
    return FileResponse(path=mask_path, media_type=media_type)


@router.post("/{video_id}/sam2/session", response_model=Sam2SessionResponse)
def create_video_sam2_session(video_id: str, session: DbSession) -> Sam2SessionResponse:
    """Create or reuse one SAM2 session for one indexed local video."""
    try:
        session_result = create_or_reuse_sam2_session(
            session=session,
            video_id=video_id,
            sam2_service=get_sam2_service(),
        )
    except Sam2VideoNotFoundError as error:
        raise HTTPException(status_code=404, detail="Indexed video not found") from error
    except Sam2VideoSourceNotAvailableError as error:
        raise HTTPException(
            status_code=409,
            detail="Indexed video source is not available",
        ) from error

    return Sam2SessionResponse(
        session_id=session_result.session_id,
        reused=session_result.reused,
    )


@router.delete("/{video_id}/sam2/session/{session_id}", status_code=204)
def delete_video_sam2_session(video_id: str, session_id: str, session: DbSession) -> Response:
    """Close one persisted SAM2 session for one indexed video."""
    try:
        close_sam2_session(
            session=session,
            video_id=video_id,
            session_id=session_id,
            sam2_service=get_sam2_service(),
        )
    except Sam2SessionNotFoundError as error:
        raise HTTPException(status_code=404, detail="SAM2 session not found") from error

    return Response(status_code=204)


@router.post("/{video_id}/sam2/prompt-box", response_model=Sam2PromptBoxResponse)
def create_video_sam2_prompt_box(
    video_id: str,
    request: Sam2PromptBoxRequest,
    session: DbSession,
) -> Sam2PromptBoxResponse:
    """Run same-frame SAM2 prompt-box and persist stored annotation metadata."""
    try:
        stored_annotation = prompt_sam2_box(
            session=session,
            video_id=video_id,
            session_id=request.session_id,
            frame_idx=request.frame_idx,
            object_id=request.object_id,
            box_xyxy_px=request.box_xyxy_px,
            sam2_service=get_sam2_service(),
        )
    except Sam2VideoNotFoundError as error:
        raise HTTPException(status_code=404, detail="Indexed video not found") from error
    except Sam2SessionNotFoundError as error:
        raise HTTPException(status_code=404, detail="SAM2 session not found") from error
    except FrameIndexOutOfRangeError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error
    except InvalidBoxCoordinatesError as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error),
        ) from error

    return Sam2PromptBoxResponse.model_validate(
        {
            "frame_idx": stored_annotation.frame_idx,
            "annotation": {
                "object_id": stored_annotation.object_id,
                "source": stored_annotation.source,
                "box_xywh_norm": stored_annotation.box_xywh_norm,
                "mask": {"path": stored_annotation.mask_path},
            },
        }
    )


@router.post(
    "/{video_id}/sam2/propagate",
    response_model=Sam2PropagationJobResponse,
    status_code=status.HTTP_202_ACCEPTED,
)
def create_video_sam2_propagation_job(
    video_id: str,
    request: Sam2PropagationRequest,
    session: DbSession,
) -> Sam2PropagationJobResponse:
    """Create one background SAM2 propagation job."""
    try:
        job_result = start_sam2_propagation_job(
            session=session,
            video_id=video_id,
            session_id=request.session_id,
            start_frame_idx=request.start_frame_idx,
            end_frame_idx=request.end_frame_idx,
            direction=request.direction,
            object_ids=request.object_ids,
            sam2_service=get_sam2_service(),
        )
    except Sam2VideoNotFoundError as error:
        raise HTTPException(status_code=404, detail="Indexed video not found") from error
    except Sam2SessionNotFoundError as error:
        raise HTTPException(status_code=404, detail="SAM2 session not found") from error
    except FrameIndexOutOfRangeError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error
    except InvalidPropagationRangeError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error

    return Sam2PropagationJobResponse(
        job_id=job_result.job_id,
        status=job_result.status,
        progress_current=job_result.progress_current,
        progress_total=job_result.progress_total,
    )
