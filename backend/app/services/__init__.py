"""Backend service modules for milestone-01 local workflows."""

from .frame_annotations import InvalidBoxCoordinatesError
from .sam2 import (
    Sam2PromptResult,
    Sam2Service,
    Sam2SessionNotFoundError,
    Sam2SessionResult,
    Sam2VideoNotFoundError,
    Sam2VideoSourceNotAvailableError,
    close_sam2_session,
    create_or_reuse_sam2_session,
    get_sam2_service,
    prompt_sam2_box,
)
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
from .video_metadata import extract_video_metadata

__all__ = [
    "ExactFrameDecodeError",
    "ExactFramePayload",
    "FrameIndexOutOfRangeError",
    "IndexedVideoNotFoundError",
    "InvalidBoxCoordinatesError",
    "Sam2PromptResult",
    "Sam2Service",
    "Sam2SessionNotFoundError",
    "Sam2SessionResult",
    "Sam2VideoNotFoundError",
    "Sam2VideoSourceNotAvailableError",
    "VideoMetadata",
    "close_sam2_session",
    "create_or_reuse_sam2_session",
    "decode_exact_video_frame",
    "extract_video_metadata",
    "get_indexed_video_by_id",
    "get_sam2_service",
    "index_videos",
    "list_indexed_videos",
    "load_exact_video_frame",
    "prompt_sam2_box",
]
