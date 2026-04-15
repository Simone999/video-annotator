"""Backend service modules for milestone-01 local workflows."""

from .frame_annotations import (
    FrameAnnotationsData,
    ObjectTrackNotFoundError,
    VideoAnnotationsData,
    delete_frame_annotation,
    get_frame_annotations,
    list_video_annotations,
    upsert_frame_annotations,
)
from .video_catalog import (
    create_object_track,
    get_indexed_video_by_id,
    get_video_manifest,
    list_indexed_videos,
)
from .video_frames import (
    ExactFrameDecodeError,
    ExactFramePayload,
    FrameIndexOutOfRangeError,
    IndexedVideoNotFoundError,
    decode_exact_video_frame,
    load_exact_video_frame,
)
from .video_indexing import VideoMetadata, index_videos
from .video_metadata import extract_video_metadata

__all__ = [
    "ExactFrameDecodeError",
    "ExactFramePayload",
    "FrameAnnotationsData",
    "FrameIndexOutOfRangeError",
    "IndexedVideoNotFoundError",
    "ObjectTrackNotFoundError",
    "VideoAnnotationsData",
    "VideoMetadata",
    "create_object_track",
    "decode_exact_video_frame",
    "delete_frame_annotation",
    "extract_video_metadata",
    "get_frame_annotations",
    "get_indexed_video_by_id",
    "get_video_manifest",
    "index_videos",
    "list_indexed_videos",
    "list_video_annotations",
    "load_exact_video_frame",
    "upsert_frame_annotations",
]
