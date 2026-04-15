"""Video catalog API routes for milestone-01 review."""

from mimetypes import guess_type
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Response, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.db import get_db_session
from app.schemas import (
    CreateObjectTrackRequest,
    FrameAnnotationsResponse,
    ObjectTrackSummaryResponse,
    UpsertFrameAnnotationsRequest,
    VideoAnnotationsResponse,
    VideoManifestResponse,
    VideoResponse,
)
from app.services import (
    FrameIndexOutOfRangeError,
    IndexedVideoNotFoundError,
    ObjectTrackNotFoundError,
    create_object_track,
    delete_frame_annotation,
    get_frame_annotations,
    get_indexed_video_by_id,
    get_video_manifest,
    list_indexed_videos,
    list_video_annotations,
    load_exact_video_frame,
    upsert_frame_annotations,
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
def get_video_manifest_payload(video_id: str, session: DbSession) -> VideoManifestResponse:
    """Return persisted video, object, and frame index manifest data."""
    manifest = get_video_manifest(session=session, video_id=video_id)
    if manifest is None:
        raise HTTPException(status_code=404, detail="Indexed video not found")

    return VideoManifestResponse(
        video=VideoResponse.model_validate(manifest.video),
        objects=[
            ObjectTrackSummaryResponse.model_validate(object_track)
            for object_track in manifest.objects
        ],
        annotated_frame_indices=manifest.annotated_frame_indices,
        keyframe_indices=manifest.keyframe_indices,
    )


@router.post(
    "/{video_id}/objects",
    response_model=ObjectTrackSummaryResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_video_object(
    video_id: str,
    payload: CreateObjectTrackRequest,
    session: DbSession,
) -> ObjectTrackSummaryResponse:
    """Create one persisted object track for selected video."""
    object_track = create_object_track(
        session=session,
        video_id=video_id,
        label=payload.label,
    )
    if object_track is None:
        raise HTTPException(status_code=404, detail="Indexed video not found")

    return ObjectTrackSummaryResponse.model_validate(object_track)


@router.get("/{video_id}/annotations", response_model=VideoAnnotationsResponse)
def get_video_annotations(video_id: str, session: DbSession) -> VideoAnnotationsResponse:
    """Return all persisted annotations for one indexed video."""
    try:
        annotations = list_video_annotations(session=session, video_id=video_id)
    except IndexedVideoNotFoundError as error:
        raise HTTPException(status_code=404, detail="Indexed video not found") from error

    return VideoAnnotationsResponse(
        video_id=annotations.video_id,
        annotations=annotations.annotations,
    )


@router.get(
    "/{video_id}/annotations/frame/{frame_idx}",
    response_model=FrameAnnotationsResponse,
)
def get_video_frame_annotations(
    video_id: str,
    frame_idx: int,
    session: DbSession,
) -> FrameAnnotationsResponse:
    """Return persisted annotations for one canonical frame."""
    try:
        annotations = get_frame_annotations(
            session=session,
            video_id=video_id,
            frame_idx=frame_idx,
        )
    except IndexedVideoNotFoundError as error:
        raise HTTPException(status_code=404, detail="Indexed video not found") from error
    except FrameIndexOutOfRangeError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error

    return FrameAnnotationsResponse(
        video_id=annotations.video_id,
        frame_idx=annotations.frame_idx,
        annotations=annotations.annotations,
    )


@router.put(
    "/{video_id}/annotations/frame/{frame_idx}",
    response_model=FrameAnnotationsResponse,
)
def put_video_frame_annotations(
    video_id: str,
    frame_idx: int,
    payload: UpsertFrameAnnotationsRequest,
    session: DbSession,
) -> FrameAnnotationsResponse:
    """Create or update persisted annotations for one canonical frame."""
    try:
        annotations = upsert_frame_annotations(
            session=session,
            video_id=video_id,
            frame_idx=frame_idx,
            annotations=payload.annotations,
        )
    except IndexedVideoNotFoundError as error:
        raise HTTPException(status_code=404, detail="Indexed video not found") from error
    except FrameIndexOutOfRangeError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error
    except ObjectTrackNotFoundError as error:
        raise HTTPException(
            status_code=404,
            detail=f"Object track not found for video: {error}",
        ) from error

    return FrameAnnotationsResponse(
        video_id=annotations.video_id,
        frame_idx=annotations.frame_idx,
        annotations=annotations.annotations,
    )


@router.delete(
    "/{video_id}/annotations/frame/{frame_idx}/object/{object_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_video_frame_annotation(
    video_id: str,
    frame_idx: int,
    object_id: int,
    session: DbSession,
) -> Response:
    """Delete one object's persisted annotation from one canonical frame."""
    try:
        deleted = delete_frame_annotation(
            session=session,
            video_id=video_id,
            frame_idx=frame_idx,
            object_id=object_id,
        )
    except IndexedVideoNotFoundError as error:
        raise HTTPException(status_code=404, detail="Indexed video not found") from error
    except FrameIndexOutOfRangeError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error

    if not deleted:
        raise HTTPException(status_code=404, detail="Frame annotation not found")

    return Response(status_code=status.HTTP_204_NO_CONTENT)


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
