"""Video catalog API routes for milestone-01 review."""

from mimetypes import guess_type
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Response
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.db import get_db_session
from app.schemas import (
    AnnotationMaskSummary,
    CreateObjectTrackRequest,
    ManifestVideoSummary,
    ManualFrameAnnotationRequest,
    ManualFrameAnnotationResponse,
    ObjectTrackSummary,
    VideoManifestResponse,
    VideoResponse,
)
from app.services import (
    FrameIndexOutOfRangeError,
    IndexedVideoNotFoundError,
    ManualFrameAnnotationNotFoundError,
    ManualFrameAnnotationObjectTrackNotFoundError,
    ManualFrameAnnotationVideoNotFoundError,
    create_object_track,
    delete_manual_frame_annotation,
    get_indexed_video_by_id,
    get_video_manifest,
    list_indexed_videos,
    load_exact_video_frame,
    upsert_manual_frame_annotation,
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


@router.get("/{video_id}/manifest", response_model=VideoManifestResponse)
def get_video_manifest_summary(video_id: str, session: DbSession) -> VideoManifestResponse:
    """Return manifest summary for exact-frame review bootstrap."""
    manifest = get_video_manifest(session=session, video_id=video_id)
    if manifest is None:
        raise HTTPException(status_code=404, detail="Indexed video not found")

    object_summaries = [
        ObjectTrackSummary.model_validate(object_track) for object_track in manifest.objects
    ]

    return VideoManifestResponse(
        video=ManifestVideoSummary.model_validate(manifest.video),
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
