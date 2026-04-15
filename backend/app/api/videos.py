"""Video catalog API routes for milestone-01 review."""

from mimetypes import guess_type
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Response, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.db import get_db_session
from app.schemas import (
    Sam2PromptBoxRequest,
    Sam2PromptBoxResponse,
    Sam2PropagationJobResponse,
    Sam2PropagationRequest,
    Sam2SessionResponse,
    VideoResponse,
)
from app.services import (
    FrameIndexOutOfRangeError,
    IndexedVideoNotFoundError,
    InvalidBoxCoordinatesError,
    InvalidPropagationRangeError,
    Sam2SessionNotFoundError,
    Sam2VideoNotFoundError,
    Sam2VideoSourceNotAvailableError,
    close_sam2_session,
    create_or_reuse_sam2_session,
    get_indexed_video_by_id,
    get_sam2_service,
    list_indexed_videos,
    load_exact_video_frame,
    prompt_sam2_box,
    start_sam2_propagation_job,
)

router = APIRouter(prefix="/videos")

type DbSession = Annotated[Session, Depends(get_db_session)]


@router.get("", response_model=list[VideoResponse])
def get_videos(session: DbSession) -> list[VideoResponse]:
    """Return indexed milestone-01 videos for review selection."""
    videos = list_indexed_videos(session=session)
    return [VideoResponse.model_validate(video) for video in videos]


@router.get("/{video_id}", response_model=VideoResponse)
def get_video(video_id: str, session: DbSession) -> VideoResponse:
    """Return one indexed video by stable backend identifier."""
    video = get_indexed_video_by_id(session=session, video_id=video_id)
    if video is None:
        raise HTTPException(status_code=404, detail="Indexed video not found")

    return VideoResponse.model_validate(video)


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
