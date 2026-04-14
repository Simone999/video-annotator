"""Video metadata extraction helpers for backend-owned indexing."""

import json
import subprocess
from dataclasses import dataclass
from fractions import Fraction
from json import JSONDecodeError
from pathlib import Path
from typing import cast


@dataclass(frozen=True, slots=True)
class VideoMetadata:
    """Canonical backend-owned metadata extracted from a local video file."""

    frame_count: int
    fps: float
    width: int
    height: int
    duration_seconds: float | None


def extract_video_metadata(video_path: Path) -> VideoMetadata:
    """Inspect a local video file and extract canonical metadata.

    Args:
        video_path: Local path to video file to inspect.

    Returns:
        Canonical backend-owned video metadata.

    Raises:
        FileNotFoundError: If target video file does not exist.
        RuntimeError: If ffprobe fails or returns invalid metadata.
    """
    if not video_path.is_file():
        raise FileNotFoundError(f"Video file does not exist: {video_path}")

    command = [
        "ffprobe",
        "-v",
        "error",
        "-select_streams",
        "v:0",
        "-show_entries",
        "stream=width,height,avg_frame_rate,nb_read_frames,duration",
        "-count_frames",
        "-of",
        "json",
        str(video_path),
    ]

    try:
        result = subprocess.run(
            command,
            capture_output=True,
            check=True,
            text=True,
        )
        payload = json.loads(result.stdout)
    except (JSONDecodeError, subprocess.CalledProcessError) as error:
        raise RuntimeError(f"Failed to inspect video metadata for {video_path}") from error

    stream = _get_primary_video_stream(payload)

    return VideoMetadata(
        frame_count=_parse_positive_int(_require_value(stream, "nb_read_frames"), "nb_read_frames"),
        fps=_parse_frame_rate(_require_value(stream, "avg_frame_rate")),
        width=_parse_positive_int(_require_value(stream, "width"), "width"),
        height=_parse_positive_int(_require_value(stream, "height"), "height"),
        duration_seconds=_parse_optional_non_negative_float(stream.get("duration"), "duration"),
    )


def _get_primary_video_stream(payload: object) -> dict[str, object]:
    if not isinstance(payload, dict):
        raise RuntimeError("ffprobe metadata payload must be a JSON object")

    payload_dict = cast(dict[str, object], payload)
    streams = payload_dict.get("streams")
    if not isinstance(streams, list) or not streams:
        raise RuntimeError("ffprobe metadata payload does not include a primary video stream")

    stream_items = cast(list[object], streams)
    first_stream = stream_items[0]
    if not isinstance(first_stream, dict):
        raise RuntimeError("ffprobe primary video stream payload must be a JSON object")

    return cast(dict[str, object], first_stream)


def _require_value(stream: dict[str, object], key: str) -> object:
    value = stream.get(key)
    if value in (None, ""):
        raise RuntimeError(f"ffprobe metadata is missing {key}")
    return value


def _parse_frame_rate(value: object) -> float:
    text = str(value)

    try:
        fps = float(Fraction(text))
    except (ValueError, ZeroDivisionError) as error:
        raise RuntimeError(f"Invalid avg_frame_rate value: {text}") from error

    if fps <= 0:
        raise RuntimeError(f"avg_frame_rate must be positive: {text}")

    return fps


def _parse_positive_int(value: object, field_name: str) -> int:
    try:
        parsed_value = int(str(value))
    except ValueError as error:
        raise RuntimeError(f"{field_name} must be an integer: {value}") from error

    if parsed_value <= 0:
        raise RuntimeError(f"{field_name} must be positive: {value}")

    return parsed_value


def _parse_optional_non_negative_float(value: object, field_name: str) -> float | None:
    if value in (None, ""):
        return None

    try:
        parsed_value = float(str(value))
    except ValueError as error:
        raise RuntimeError(f"{field_name} must be numeric: {value}") from error

    if parsed_value < 0:
        raise RuntimeError(f"{field_name} must be non-negative: {value}")

    return parsed_value
