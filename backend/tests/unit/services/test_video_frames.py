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
    InvalidFrameWidthError,
    InvalidThumbnailSpriteCountError,
    InvalidThumbnailSpriteWidthError,
    decode_exact_video_frame,
    decode_video_thumbnail_sprite,
    load_exact_video_frame,
    load_video_thumbnail_sprite,
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


def test_load_exact_video_frame_passes_requested_width_to_decoder(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """Pass optional preview width through to backend decoder."""
    monkeypatch.setattr(
        video_frames_module,
        "get_indexed_video_by_id",
        lambda **_kwargs: SimpleNamespace(frame_count=12, source_path="/tmp/sample.mp4"),
    )
    captured_args: dict[str, object] = {}

    def fake_decode_exact_video_frame(**kwargs: object) -> ExactFramePayload:
        captured_args.update(kwargs)
        return ExactFramePayload(content=b"png-bytes", media_type="image/png")

    monkeypatch.setattr(
        video_frames_module,
        "decode_exact_video_frame",
        fake_decode_exact_video_frame,
    )

    frame = load_exact_video_frame(
        session=cast(Session, SimpleNamespace()),
        video_id="video-123",
        frame_idx=7,
        width=160,
    )

    assert frame.content == b"png-bytes"
    assert captured_args["width"] == 160


def test_load_exact_video_frame_rejects_non_positive_width(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """Reject non-positive preview widths before decode."""
    monkeypatch.setattr(
        video_frames_module,
        "get_indexed_video_by_id",
        lambda **_kwargs: SimpleNamespace(frame_count=12, source_path="/tmp/sample.mp4"),
    )

    with pytest.raises(InvalidFrameWidthError, match="width must be at least 1"):
        load_exact_video_frame(
            session=cast(Session, SimpleNamespace()),
            video_id="video-123",
            frame_idx=7,
            width=0,
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


def test_decode_exact_video_frame_applies_scale_filter_when_width_requested(
    monkeypatch: pytest.MonkeyPatch,
    tmp_path: Path,
) -> None:
    """Append scale filter when thumbnail width is requested."""
    video_path = tmp_path / "sample.mp4"
    video_path.write_bytes(b"video")
    captured_command: list[str] = []

    def fake_run(
        command: list[str],
        *_args: object,
        **_kwargs: object,
    ) -> subprocess.CompletedProcess[bytes]:
        captured_command.extend(command)
        return subprocess.CompletedProcess(
            args=command,
            returncode=0,
            stdout=b"png-bytes",
            stderr=b"",
        )

    monkeypatch.setattr(video_frames_module.subprocess, "run", fake_run)

    decode_exact_video_frame(video_path=video_path, frame_idx=7, width=160)

    assert captured_command == [
        "ffmpeg",
        "-v",
        "error",
        "-i",
        str(video_path),
        "-vf",
        "select=eq(n\\,7),scale=160:-1",
        "-frames:v",
        "1",
        "-f",
        "image2pipe",
        "-vcodec",
        "png",
        "pipe:1",
    ]


def test_load_video_thumbnail_sprite_rejects_invalid_count_and_width(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """Reject non-positive sprite sizing before decode."""
    monkeypatch.setattr(
        video_frames_module,
        "get_indexed_video_by_id",
        lambda **_kwargs: SimpleNamespace(frame_count=12, source_path="/tmp/sample.mp4", width=400),
    )

    with pytest.raises(InvalidThumbnailSpriteCountError, match="count must be at least 1"):
        load_video_thumbnail_sprite(
            session=cast(Session, SimpleNamespace()),
            video_id="video-123",
            start_frame_idx=0,
            count=0,
            width=112,
        )

    with pytest.raises(InvalidThumbnailSpriteWidthError, match="width must be at least 1"):
        load_video_thumbnail_sprite(
            session=cast(Session, SimpleNamespace()),
            video_id="video-123",
            start_frame_idx=0,
            count=12,
            width=0,
        )


def test_load_video_thumbnail_sprite_clamps_window_before_decode(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """Clamp sprite window to indexed frame bounds before decoding."""
    monkeypatch.setattr(
        video_frames_module,
        "get_indexed_video_by_id",
        lambda **_kwargs: SimpleNamespace(frame_count=12, source_path="/tmp/sample.mp4", width=320),
    )
    captured_args: dict[str, object] = {}

    def fake_decode_video_thumbnail_sprite(**kwargs: object) -> ExactFramePayload:
        captured_args.update(kwargs)
        return ExactFramePayload(content=b"sprite-png", media_type="image/png")

    monkeypatch.setattr(
        video_frames_module,
        "decode_video_thumbnail_sprite",
        fake_decode_video_thumbnail_sprite,
    )

    sprite = load_video_thumbnail_sprite(
        session=cast(Session, SimpleNamespace()),
        video_id="video-123",
        start_frame_idx=99,
        count=99,
        width=999,
    )

    assert sprite.content == b"sprite-png"
    assert captured_args["start_frame_idx"] == 11
    assert captured_args["count"] == 1
    assert captured_args["width"] == 999


def test_load_video_thumbnail_sprite_keeps_in_bounds_count_and_width(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """Preserve requested count and width when request already stays in bounds."""
    monkeypatch.setattr(
        video_frames_module,
        "get_indexed_video_by_id",
        lambda **_kwargs: SimpleNamespace(
            frame_count=120,
            source_path="/tmp/sample.mp4",
            width=320,
        ),
    )
    captured_args: dict[str, object] = {}

    def fake_decode_video_thumbnail_sprite(**kwargs: object) -> ExactFramePayload:
        captured_args.update(kwargs)
        return ExactFramePayload(content=b"sprite-png", media_type="image/png")

    monkeypatch.setattr(
        video_frames_module,
        "decode_video_thumbnail_sprite",
        fake_decode_video_thumbnail_sprite,
    )

    load_video_thumbnail_sprite(
        session=cast(Session, SimpleNamespace()),
        video_id="video-123",
        start_frame_idx=4,
        count=40,
        width=900,
    )

    assert captured_args["start_frame_idx"] == 4
    assert captured_args["count"] == 40
    assert captured_args["width"] == 900


def test_decode_video_thumbnail_sprite_builds_horizontal_tile_command(
    monkeypatch: pytest.MonkeyPatch,
    tmp_path: Path,
) -> None:
    """Build one ffmpeg tile command for contiguous sprite output."""
    video_path = tmp_path / "sample.mp4"
    video_path.write_bytes(b"video")
    captured_command: list[str] = []

    def fake_run(
        command: list[str],
        *_args: object,
        **_kwargs: object,
    ) -> subprocess.CompletedProcess[bytes]:
        captured_command.extend(command)
        return subprocess.CompletedProcess(
            args=command,
            returncode=0,
            stdout=b"sprite-png",
            stderr=b"",
        )

    monkeypatch.setattr(video_frames_module.subprocess, "run", fake_run)

    sprite = decode_video_thumbnail_sprite(
        video_path=video_path,
        start_frame_idx=7,
        count=3,
        width=112,
    )

    assert sprite == ExactFramePayload(content=b"sprite-png", media_type="image/png")
    assert captured_command == [
        "ffmpeg",
        "-v",
        "error",
        "-i",
        str(video_path),
        "-vf",
        "select=between(n\\,7\\,9),scale=112:-1,tile=3x1",
        "-frames:v",
        "1",
        "-f",
        "image2pipe",
        "-vcodec",
        "png",
        "pipe:1",
    ]
