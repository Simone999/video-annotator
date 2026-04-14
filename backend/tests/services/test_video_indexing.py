"""Tests for backend video indexing service."""

from pathlib import Path

from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session

from app.db import Base, Video
from app.services.video_indexing import VideoMetadata, index_videos


def test_index_videos_persists_supported_files(tmp_path: Path) -> None:
    """Scan supported local videos and persist backend-owned metadata."""
    source_dir = tmp_path / "videos"
    first_video = source_dir / "nested" / "clip-001.mp4"
    second_video = source_dir / "clip-002.mov"
    ignored_file = source_dir / "notes.txt"

    first_video.parent.mkdir(parents=True)
    first_video.write_bytes(b"")
    second_video.write_bytes(b"")
    ignored_file.write_text("ignore me", encoding="utf-8")

    metadata_by_path = {
        first_video.resolve(): VideoMetadata(
            frame_count=120,
            fps=24.0,
            width=1920,
            height=1080,
            duration_seconds=5.0,
        ),
        second_video.resolve(): VideoMetadata(
            frame_count=75,
            fps=25.0,
            width=1280,
            height=720,
            duration_seconds=3.0,
        ),
    }

    def inspect_video(video_path: Path) -> VideoMetadata:
        return metadata_by_path[video_path.resolve()]

    engine = create_engine(f"sqlite:///{tmp_path / 'indexing.sqlite3'}")
    Base.metadata.create_all(engine)

    with Session(engine) as session:
        indexed_videos = index_videos(
            session=session,
            source_dir=source_dir,
            inspect_video=inspect_video,
        )

        persisted_videos = session.scalars(select(Video).order_by(Video.source_path)).all()

    assert [video.source_path for video in indexed_videos] == [
        str(second_video.resolve()),
        str(first_video.resolve()),
    ]
    assert [video.source_path for video in persisted_videos] == [
        str(second_video.resolve()),
        str(first_video.resolve()),
    ]
    assert persisted_videos[0].display_name == "clip-002.mov"
    assert persisted_videos[0].frame_count == 75
    assert persisted_videos[1].display_name == "clip-001.mp4"
    assert persisted_videos[1].frame_count == 120


def test_index_videos_updates_existing_records_for_repeated_scan(tmp_path: Path) -> None:
    """Re-index same source file by updating existing persisted metadata."""
    source_dir = tmp_path / "videos"
    video_path = source_dir / "clip-001.mp4"
    video_path.parent.mkdir(parents=True)
    video_path.write_bytes(b"")

    engine = create_engine(f"sqlite:///{tmp_path / 'indexing.sqlite3'}")
    Base.metadata.create_all(engine)

    with Session(engine) as session:
        first_pass = index_videos(
            session=session,
            source_dir=source_dir,
            inspect_video=lambda _: VideoMetadata(
                frame_count=120,
                fps=24.0,
                width=1920,
                height=1080,
                duration_seconds=5.0,
            ),
        )
        second_pass = index_videos(
            session=session,
            source_dir=source_dir,
            inspect_video=lambda _: VideoMetadata(
                frame_count=240,
                fps=48.0,
                width=1920,
                height=1080,
                duration_seconds=5.0,
            ),
        )
        persisted_videos = session.scalars(select(Video)).all()

    assert len(first_pass) == 1
    assert len(second_pass) == 1
    assert first_pass[0].id == second_pass[0].id
    assert len(persisted_videos) == 1
    assert persisted_videos[0].frame_count == 240
    assert persisted_videos[0].fps == 48.0


def test_index_videos_returns_empty_list_for_missing_source_dir(tmp_path: Path) -> None:
    """Skip indexing when configured source directory does not exist."""
    engine = create_engine(f"sqlite:///{tmp_path / 'indexing.sqlite3'}")
    Base.metadata.create_all(engine)

    with Session(engine) as session:
        indexed_videos = index_videos(
            session=session,
            source_dir=tmp_path / "missing",
        )

    assert indexed_videos == []
