"""Backend service modules for milestone-01 local workflows."""

from .object_tracks import create_object_track
from .video_catalog import get_indexed_video_by_id, list_indexed_videos
from .video_frames import (
    ExactFrameDecodeError,
    ExactFramePayload,
    FrameIndexOutOfRangeError,
    IndexedVideoNotFoundError,
    decode_exact_video_frame,
    load_exact_video_frame,
)
from .video_indexing import VideoMetadata, index_videos
from .video_manifest import VideoManifestRecord, get_video_manifest
from .video_metadata import extract_video_metadata

__all__ = [
    "ExactFrameDecodeError",
    "ExactFramePayload",
    "FrameIndexOutOfRangeError",
    "IndexedVideoNotFoundError",
    "VideoManifestRecord",
    "VideoMetadata",
    "create_object_track",
    "decode_exact_video_frame",
    "extract_video_metadata",
    "get_indexed_video_by_id",
    "get_video_manifest",
    "index_videos",
    "list_indexed_videos",
    "load_exact_video_frame",
]
