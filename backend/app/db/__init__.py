"""Database bootstrap helpers for the backend."""

from .init_db import initialize_database
from .videos import (
    create_indexed_video,
    get_indexed_video_by_filepath,
    get_indexed_video_by_id,
    list_indexed_videos,
)

__all__ = [
    "create_indexed_video",
    "get_indexed_video_by_filepath",
    "get_indexed_video_by_id",
    "initialize_database",
    "list_indexed_videos",
]
