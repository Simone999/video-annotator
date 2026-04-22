---
title: Video Ingest and Exact-Frame Review
type: feature
canonical: true
domain: review
aliases:
- exact frame review
- video ingest
- review route
status: active
permalink: video-annotator/features/video-ingest-and-exact-frame-review
tags:
- feature
- video
- exact-frame
- review
---

# Video Ingest and Exact-Frame Review

This feature owns baseline flow: discover local videos, pick one from library, open review screen, and bind review state to canonical backend frames.

## Target Behavior

- User starts in video library, picks one indexed video, lands in single review surface, and still works on canonical backend frames.
- Playback may run on the main stage for context, but pause, jump, and step resolve to explicit backend frame identity.
- Invalid frame or decode failures stay concise and diagnosable.

## Contracts

- Backend contracts:
  - `GET /api/videos`
  - `GET /api/videos/{video_id}`
  - `GET /api/videos/{video_id}/source`
  - `GET /api/videos/{video_id}/frame/{frame_idx}`
- Frontend contracts:
  - library selection state stays separate from canonical current frame state
  - canonical `currentFrameIndex` updates only after successful backend resolution
- Data or storage contracts:
  - explicit baseline seed scans `data/videos`
  - `Video.id` stays deterministic per relative source path

## Verification Strategy

- Durable backend evidence:
  - `backend/tests/integration/api/test_video_ingest_exact_frame.py`
- Durable frontend evidence:
  - `frontend/tests/integration/app/app-routes.test.tsx`
  - `frontend/tests/integration/video-library/video-library-screen.test.tsx`
  - `frontend/tests/integration/video-review/review-page.test.tsx`
  - `frontend/tests/integration/video-review/live-review-screen.test.tsx`
  - `frontend/tests/unit/video-review/review-transport-controls.test.tsx`
- Durable browser evidence:
  - `frontend/tests/e2e/routes.spec.ts`
- Manual smoke and screenshot history belongs in archive notes. Restart current-code backend before trusting route-browser failures.

## Observations

- [status] Ingest and exact-frame foundations ship on the live library-first review path. #review #video
- [truth] Playback may exist in UI, but backend `frame_idx` stays annotation truth. #frames #frontend
- [scope] This note owns ingest and exact-frame truth; SAM2 and export live elsewhere. #review #scope
- [gotcha] Reused stale backends on `127.0.0.1:8000` can fake direct-route regressions even when current code is fine. #browser #backend
- [retrieval] Use this note for video library selection, exact frame review, or review route queries. #search

## Relations

- relates_to [[Product Requirements]]
- relates_to [[Architecture]]
- relates_to [[API]]
- relates_to [[Data Model]]
