---
title: US-004 exact frame API patterns
type: note
permalink: video-annotator/engineering/us-004-exact-frame-api-patterns
tags:
- backend
- api
- testing
- milestone-01
- frames
---

# US-004 exact frame API patterns

## Summary
Milestone-01 exact-frame API now serves `GET /api/videos/{video_id}/frame/{frame_idx}` as raw PNG bytes, with backend-owned zero-based frame index validation before decode.

## Learnings
- Keep exact-frame HTTP responses binary with `fastapi.Response`; milestone-01 does not need a JSON wrapper around image bytes.
- Validate `frame_idx` against persisted `Video.frame_count` before any decoder call so client mistakes return fast `400` responses and do not touch media tooling.
- Keep route handlers thin. Put lookup + validation + decode orchestration in a small service module like `video_frames.py`.
- For API tests that care about returned bytes rather than decoder internals, patch `app.api.videos.load_exact_video_frame` and seed indexed `Video` rows through `APP_DB_URL`.

## Related
- [[backend/app/services/video_frames.py]]
- [[backend/tests/api/test_videos.py]]
- [[docs/engineering/api]]
- [[docs/engineering/architecture]]