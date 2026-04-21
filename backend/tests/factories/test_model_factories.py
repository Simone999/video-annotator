"""Smoke tests for reusable backend model factories."""

from app.db.models import ObjectTrack, Video
from tests.factories.models import ObjectTrackFactory, VideoFactory


def test_model_factories_build_current_sqlalchemy_models() -> None:
    """Build reusable SQLAlchemy model instances with aligned defaults."""
    video = VideoFactory.build()
    object_track = ObjectTrackFactory.build(video_id=video.id)

    assert isinstance(video, Video)
    assert isinstance(object_track, ObjectTrack)
    assert object_track.video_id == video.id
