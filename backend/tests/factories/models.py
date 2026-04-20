"""Reusable factory-boy builders for backend model tests."""
# pyright: reportPrivateImportUsage=false, reportIncompatibleVariableOverride=false

import factory

from app.db.models import ObjectTrack, Video


class VideoFactory(factory.Factory):
    """Build persisted video rows with stable defaults for tests."""

    class Meta:
        """Bind the factory to the persisted video model."""

        model = Video

    id = factory.Sequence(lambda n: f"video-{n}")
    source_path = factory.LazyAttribute(lambda video: f"/tmp/{video.id}.mp4")
    display_name = factory.Sequence(lambda n: f"Video {n}")
    frame_count = 42
    fps = 24.0
    width = 1920
    height = 1080
    duration_seconds = 1.75


class ObjectTrackFactory(factory.Factory):
    """Build persisted object-track rows with stable defaults for tests."""

    class Meta:
        """Bind the factory to the persisted object-track model."""

        model = ObjectTrack

    id = factory.Sequence(lambda n: f"object-{n}")
    video_id = factory.Sequence(lambda n: f"video-{n}")
    label = factory.Sequence(lambda n: f"Object {n}")
    color = "#00ffaa"
    status = "active"
