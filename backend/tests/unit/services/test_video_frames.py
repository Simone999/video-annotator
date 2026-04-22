"""Unit tests for exact-frame loading helpers."""

import subprocess
from pathlib import Path
from types import SimpleNamespace
from typing import cast

import pytest
from sqlalchemy.orm import Session

import app.services.video_frames as video_frames_module
from app.services.video_frames import (
    ExactFrameDecodeError,
    ExactFramePayload,
    FrameIndexOutOfRangeError,
    IndexedVideoNotFoundError,
    decode_exact_video_frame,
    load_exact_video_frame,
)


def test_load_exact_video_frame_rejects_unknown_indexed_video(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """Reject exact-frame loads for unknown videos before decode."""
    monkeypatch.setattr(video_frames_module, "get_indexed_video_by_id", lambda **_kwargs: None)

    with pytest.raises(IndexedVideoNotFoundError):
        load_exact_video_frame(
            session=cast(Session, SimpleNamespace()),
            video_id="missing-video",
            frame_idx=0,
        )


def test_load_exact_video_frame_rejects_out_of_range_frame_idx(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """Reject frame indexes outside canonical indexed bounds."""
    monkeypatch.setattr(
        video_frames_module,
        "get_indexed_video_by_id",
        lambda **_kwargs: SimpleNamespace(frame_count=12, source_path="/tmp/sample.mp4"),
    )

    with pytest.raises(FrameIndexOutOfRangeError, match="between 0 and 11"):
        load_exact_video_frame(
            session=cast(Session, SimpleNamespace()),
            video_id="video-123",
            frame_idx=12,
        )


def test_decode_exact_video_frame_surfaces_ffmpeg_stderr(
    monkeypatch: pytest.MonkeyPatch,
    tmp_path: Path,
) -> None:
    """Use ffmpeg stderr text when decode process fails."""
    video_path = tmp_path / "sample.mp4"
    video_path.write_bytes(b"video")

    def fake_run(*_args: object, **_kwargs: object) -> subprocess.CompletedProcess[bytes]:
        return subprocess.CompletedProcess(
            args=["ffmpeg"],
            returncode=1,
            stdout=b"",
            stderr=b"decode broke",
        )

    monkeypatch.setattr(video_frames_module.subprocess, "run", fake_run)

    with pytest.raises(ExactFrameDecodeError, match="decode broke"):
        decode_exact_video_frame(video_path=video_path, frame_idx=7)


def test_decode_exact_video_frame_uses_fallback_message_when_ffmpeg_is_silent(
    monkeypatch: pytest.MonkeyPatch,
    tmp_path: Path,
) -> None:
    """Use fallback decode message when ffmpeg exits without stderr text."""
    video_path = tmp_path / "sample.mp4"
    video_path.write_bytes(b"video")

    def fake_run(*_args: object, **_kwargs: object) -> subprocess.CompletedProcess[bytes]:
        return subprocess.CompletedProcess(
            args=["ffmpeg"],
            returncode=1,
            stdout=b"",
            stderr=b"",
        )

    monkeypatch.setattr(video_frames_module.subprocess, "run", fake_run)

    with pytest.raises(
        ExactFrameDecodeError,
        match="ffmpeg did not return an error message",
    ):
        decode_exact_video_frame(video_path=video_path, frame_idx=7)


def test_decode_exact_video_frame_rejects_empty_success_output(
    monkeypatch: pytest.MonkeyPatch,
    tmp_path: Path,
) -> None:
    """Reject empty ffmpeg output even when process exit code is zero."""
    video_path = tmp_path / "sample.mp4"
    video_path.write_bytes(b"video")

    def fake_run(*_args: object, **_kwargs: object) -> subprocess.CompletedProcess[bytes]:
        return subprocess.CompletedProcess(
            args=["ffmpeg"],
            returncode=0,
            stdout=b"",
            stderr=b"",
        )

    monkeypatch.setattr(video_frames_module.subprocess, "run", fake_run)

    with pytest.raises(ExactFrameDecodeError, match="no frame bytes returned"):
        decode_exact_video_frame(video_path=video_path, frame_idx=7)


def test_decode_exact_video_frame_returns_png_payload(
    monkeypatch: pytest.MonkeyPatch,
    tmp_path: Path,
) -> None:
    """Return PNG payload when ffmpeg emits exact-frame bytes."""
    video_path = tmp_path / "sample.mp4"
    video_path.write_bytes(b"video")

    def fake_run(*_args: object, **_kwargs: object) -> subprocess.CompletedProcess[bytes]:
        return subprocess.CompletedProcess(
            args=["ffmpeg"],
            returncode=0,
            stdout=b"png-bytes",
            stderr=b"",
        )

    monkeypatch.setattr(video_frames_module.subprocess, "run", fake_run)

    assert decode_exact_video_frame(video_path=video_path, frame_idx=7) == ExactFramePayload(
        content=b"png-bytes",
        media_type="image/png",
    )
