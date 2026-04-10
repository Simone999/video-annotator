"""Video metadata API routes for Milestone 0."""

import sqlite3
from pathlib import Path

from fastapi import APIRouter, HTTPException

from app.db import (
    create_indexed_video,
    get_indexed_video_by_filepath,
    get_indexed_video_by_id,
    list_indexed_videos,
)
from app.schemas import IndexedVideo, VideoIndexResponse, VideoListResponse
from app.services import extract_video_metadata

router = APIRouter(prefix="/videos")


@router.post("/index", response_model=VideoIndexResponse)
def index_video(payload: dict[str, object]) -> VideoIndexResponse:
    """Index a local video file and persist its metadata.

    Args:
        payload: Raw request body expected to contain a filepath string.

    Returns:
        Persisted indexed video record for the target filepath.
    """
    filepath = payload.get("filepath")
    if not isinstance(filepath, str) or not filepath.strip():
        raise HTTPException(status_code=400, detail="filepath must be a non-empty string")

    canonical_path = str(Path(filepath).expanduser().resolve())
    if not Path(canonical_path).is_file():
        raise HTTPException(status_code=404, detail="Video file does not exist")

    existing_video = get_indexed_video_by_filepath(canonical_path)
    if existing_video is not None:
        return VideoIndexResponse(video=existing_video)

    try:
        metadata = extract_video_metadata(Path(canonical_path))
    except RuntimeError as error:
        raise HTTPException(status_code=422, detail=str(error)) from error

    try:
        indexed_video = create_indexed_video(canonical_path, metadata)
    except sqlite3.IntegrityError as error:
        existing_video = get_indexed_video_by_filepath(canonical_path)
        if existing_video is not None:
            return VideoIndexResponse(video=existing_video)
        raise HTTPException(status_code=500, detail="Failed to persist indexed video") from error
    except sqlite3.DatabaseError as error:
        raise HTTPException(status_code=500, detail="Failed to persist indexed video") from error

    return VideoIndexResponse(video=indexed_video)


@router.get("", response_model=VideoListResponse)
def list_videos() -> VideoListResponse:
    """Return all indexed videos.

    Returns:
        Current indexed video catalog.
    """
    try:
        videos = list_indexed_videos()
    except sqlite3.DatabaseError as error:
        raise HTTPException(status_code=500, detail="Failed to read indexed videos") from error

    return VideoListResponse(videos=videos)


@router.get("/{video_id}", response_model=IndexedVideo)
def get_video(video_id: str) -> IndexedVideo:
    """Return one indexed video by stable identifier.

    Args:
        video_id: Stable backend video identifier.

    Returns:
        Persisted indexed video metadata.
    """
    try:
        video = get_indexed_video_by_id(video_id)
    except sqlite3.DatabaseError as error:
        raise HTTPException(status_code=500, detail="Failed to read indexed video") from error

    if video is None:
        raise HTTPException(status_code=404, detail="Indexed video not found")

    return video
