"""Unit tests for backend video metadata extraction helpers."""

import json
import subprocess
from pathlib import Path

import pytest

import app.services.video_metadata as video_metadata_module
from app.services.video_metadata import (
    VideoMetadata,
    _get_primary_video_stream,
    _parse_frame_rate,
    _parse_optional_non_negative_float,
    _parse_positive_int,
    _require_value,
    extract_video_metadata,
)


def test_extract_video_metadata_reads_canonical_ffprobe_payload(
    monkeypatch: pytest.MonkeyPatch,
    tmp_path: Path,
) -> None:
    """Build canonical metadata from ffprobe JSON output."""
    video_path = tmp_path / "sample.mp4"
    video_path.write_bytes(b"video")

    def fake_run(
        command: list[str],
        *,
        capture_output: bool,
        check: bool,
        text: bool,
    ) -> subprocess.CompletedProcess[str]:
        assert command[-1] == str(video_path)
        assert capture_output is True
        assert check is True
        assert text is True
        return subprocess.CompletedProcess(
            args=command,
            returncode=0,
            stdout=json.dumps(
                {
                    "streams": [
                        {
                            "avg_frame_rate": "30000/1001",
                            "duration": "8.0",
                            "height": "1080",
                            "nb_read_frames": "240",
                            "width": "1920",
                        }
                    ]
                }
            ),
        )

    monkeypatch.setattr(video_metadata_module.subprocess, "run", fake_run)

    assert extract_video_metadata(video_path) == VideoMetadata(
        frame_count=240,
        fps=30000 / 1001,
        width=1920,
        height=1080,
        duration_seconds=8.0,
    )


def test_extract_video_metadata_rejects_missing_video_file(tmp_path: Path) -> None:
    """Reject metadata extraction for missing local files."""
    with pytest.raises(FileNotFoundError, match="does not exist"):
        extract_video_metadata(tmp_path / "missing.mp4")


def test_extract_video_metadata_wraps_ffprobe_failures(
    monkeypatch: pytest.MonkeyPatch,
    tmp_path: Path,
) -> None:
    """Convert ffprobe subprocess and JSON failures into one runtime error."""
    video_path = tmp_path / "sample.mp4"
    video_path.write_bytes(b"video")

    def fake_run(
        *_args: object,
        **_kwargs: object,
    ) -> subprocess.CompletedProcess[str]:
        return subprocess.CompletedProcess(
            args=["ffprobe"],
            returncode=0,
            stdout="{bad json",
        )

    monkeypatch.setattr(video_metadata_module.subprocess, "run", fake_run)

    with pytest.raises(RuntimeError, match="Failed to inspect video metadata"):
        extract_video_metadata(video_path)


@pytest.mark.parametrize(
    ("payload", "message"),
    [
        ([], "JSON object"),
        ({}, "primary video stream"),
        ({"streams": ["bad"]}, "JSON object"),
    ],
)
def test_get_primary_video_stream_rejects_invalid_payload_shapes(
    payload: object,
    message: str,
) -> None:
    """Reject malformed ffprobe payload shapes before field parsing."""
    with pytest.raises(RuntimeError, match=message):
        _get_primary_video_stream(payload)


def test_require_value_rejects_missing_and_empty_fields() -> None:
    """Reject empty ffprobe fields before conversion."""
    with pytest.raises(RuntimeError, match="missing width"):
        _require_value({"width": ""}, "width")


@pytest.mark.parametrize(
    ("value", "message"),
    [("bad-fps", "Invalid avg_frame_rate value"), ("0/1", "must be positive")],
)
def test_parse_frame_rate_rejects_invalid_or_non_positive_values(
    value: object,
    message: str,
) -> None:
    """Reject invalid frame-rate payloads."""
    with pytest.raises(RuntimeError, match=message):
        _parse_frame_rate(value)


@pytest.mark.parametrize(
    ("value", "message"),
    [("bad", "must be an integer"), ("0", "must be positive")],
)
def test_parse_positive_int_rejects_invalid_and_non_positive_values(
    value: object,
    message: str,
) -> None:
    """Reject invalid positive integer payloads."""
    with pytest.raises(RuntimeError, match=message):
        _parse_positive_int(value, "nb_read_frames")


def test_parse_optional_non_negative_float_handles_empty_and_invalid_values() -> None:
    """Allow empty duration and reject invalid or negative values."""
    assert _parse_optional_non_negative_float("", "duration") is None
    assert _parse_optional_non_negative_float(None, "duration") is None
    assert _parse_optional_non_negative_float("1.25", "duration") == 1.25

    with pytest.raises(RuntimeError, match="must be numeric"):
        _parse_optional_non_negative_float("bad", "duration")

    with pytest.raises(RuntimeError, match="must be non-negative"):
        _parse_optional_non_negative_float("-1", "duration")
