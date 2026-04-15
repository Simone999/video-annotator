---
title: US-002 SAM2 session lifecycle API patterns
type: note
permalink: video-annotator/engineering/us-002-sam2-session-lifecycle-api-patterns
tags:
- backend
- sam2
- api
- testing
---

# US-002 SAM2 session lifecycle API patterns

Milestone-03 backend now exposes `POST /api/videos/{video_id}/sam2/session` to create or reuse one open session per video and `DELETE /api/videos/{video_id}/sam2/session/{session_id}` to close it.

Key backend rule: validate indexed video ownership and local `source_path` existence before any SAM2 adapter work starts. Missing indexed video returns `404`; missing local file returns `409`.

Persistence rule: reuse newest open `Sam2Session` row for a video, refresh `last_used_at` on reuse, and mark `status="closed"` plus `closed_at` on close. Runtime predictor state stays in the SAM2 adapter, not in DB.

Useful test pattern: SAM2 lifecycle API tests can monkeypatch `app.api.videos.get_sam2_service` with a fake adapter, but must still patch `app.main.VIDEO_SOURCE_DIR` to an empty temp dir so app startup indexing does not run `ffprobe` on dummy test media.

## Observations
- [pattern] Reuse one open `Sam2Session` row per video and refresh `last_used_at` instead of creating duplicate open rows #backend #sam2 #sessions
- [pattern] Validate local source availability before adapter/session creation so SAM2 lifecycle routes fail deterministically with API errors instead of adapter-level file errors #backend #sam2 #api
- [pattern] Route tests for SAM2 can fake adapter injection by monkeypatching `app.api.videos.get_sam2_service` #backend #testing #sam2
- [gotcha] `create_app()` startup indexing will inspect whatever sits under patched `VIDEO_SOURCE_DIR`; keep that directory empty unless startup indexing itself is under test #backend #testing #startup

## Relations
- relates_to [[SAM2 session and job persistence contract]]
- relates_to [[Milestone 3: SAM2 Prompt + Propagation]]