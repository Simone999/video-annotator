---
title: Exact frame API
type: note
permalink: video-annotator/backend/exact-frame-api
tags:
- backend
- api
- frames
---

# Exact frame API

This note answers how the backend exact-frame endpoint behaves and why frame
validation has to happen before any media decode work starts. The exact-frame
route exists to return the canonical backend-decoded review image for one
zero-based frame index.

`GET /api/videos/{video_id}/frame/{frame_idx}` returns raw PNG bytes, not a
JSON wrapper. The backend looks up persisted `Video` metadata first and rejects
any frame index outside `0 <= frame_idx < frame_count` before touching the
decoder. That keeps frame identity owned by backend metadata instead of browser
playback time.

## Observations
- [api] `GET /api/videos/{video_id}/frame/{frame_idx}` returns raw `image/png` bytes for one backend-decoded exact frame. #backend #api
- [constraint] `frame_idx` is backend-canonical and zero-based; clients must not derive annotation truth from browser playback time. #frame-index #architecture
- [validation] Validate `frame_idx` against persisted `Video.frame_count` before any decoder call so out-of-range requests fail fast with `400`. #validation #media
- [pattern] Keep lookup, validation, and decode orchestration in a small service module and return a binary FastAPI response without a JSON wrapper. #fastapi #services

## Relations
- relates_to [[Jump to frame interaction]]
- relates_to [[Frame stepping interaction]]
- relates_to [[Exact frame API test seam]]
