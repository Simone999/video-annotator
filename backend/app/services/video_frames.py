"""Exact-frame loading for indexed milestone-01 videos."""

import subprocess
from dataclasses import dataclass
from pathlib import Path

from sqlalchemy.orm import Session

from app.services.video_catalog import get_indexed_video_by_id


class IndexedVideoNotFoundError(Exception):
    """Raised when an exact-frame request references an unknown indexed video."""


class FrameIndexOutOfRangeError(Exception):
    """Raised when a requested frame index falls outside the indexed range."""

    def __init__(self, *, frame_count: int) -> None:
        """Build a clear client-facing error message for canonical frame bounds.

        Args:
            frame_count: Total indexed frames available for this video.
        """
        max_frame_index = frame_count - 1
        super().__init__(f"Frame index must be between 0 and {max_frame_index}")


class ExactFrameDecodeError(RuntimeError):
    """Raised when backend frame decoding fails."""


@dataclass(frozen=True)
class ExactFramePayload:
    """Binary exact-frame image returned by backend decoder."""

    content: bytes
    media_type: str


def load_exact_video_frame(*, session: Session, video_id: str, frame_idx: int) -> ExactFramePayload:
    """Load one exact frame using backend-owned canonical metadata.

    Args:
        session: Database session for indexed video lookup.
        video_id: Stable indexed video identifier.
        frame_idx: Zero-based canonical frame index.

    Returns:
        Exact-frame binary image payload.

    Raises:
        IndexedVideoNotFoundError: If the video id is unknown.
        FrameIndexOutOfRangeError: If the frame index is negative or exceeds indexed bounds.
        ExactFrameDecodeError: If backend decoding fails.
    """
    video = get_indexed_video_by_id(session=session, video_id=video_id)
    if video is None:
        raise IndexedVideoNotFoundError(video_id)

    if frame_idx < 0 or frame_idx >= video.frame_count:
        raise FrameIndexOutOfRangeError(frame_count=video.frame_count)

    return decode_exact_video_frame(video_path=Path(video.source_path), frame_idx=frame_idx)


def decode_exact_video_frame(*, video_path: Path, frame_idx: int) -> ExactFramePayload:
    """Decode one exact frame from local video storage as PNG bytes.

    Args:
        video_path: Absolute local path to indexed video file.
        frame_idx: Zero-based canonical frame index.

    Returns:
        PNG payload for requested exact frame.

    Raises:
        ExactFrameDecodeError: If `ffmpeg` fails or does not emit frame bytes.
    """
    command = [
        "ffmpeg",
        "-v",
        "error",
        "-i",
        str(video_path),
        "-vf",
        f"select=eq(n\\,{frame_idx})",
        "-frames:v",
        "1",
        "-f",
        "image2pipe",
        "-vcodec",
        "png",
        "pipe:1",
    ]

    completed_process = subprocess.run(
        command,
        check=False,
        capture_output=True,
    )
    if completed_process.returncode != 0:
        stderr_text = completed_process.stderr.decode("utf-8", errors="replace").strip()
        message = stderr_text or "ffmpeg did not return an error message"
        raise ExactFrameDecodeError(f"Failed to decode exact frame: {message}")

    if not completed_process.stdout:
        raise ExactFrameDecodeError("Failed to decode exact frame: no frame bytes returned")

    return ExactFramePayload(content=completed_process.stdout, media_type="image/png")
