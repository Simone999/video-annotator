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
  - `GET /api/videos/{video_id}/annotations/annotated-frames`
  - `GET /api/videos/{video_id}/thumbnails/sprite`
- Frontend contracts:
  - library selection state stays separate from canonical current frame state
  - canonical `currentFrameIndex` updates only after successful backend resolution
  - playback preview uses separate `previewFrameIndex`; it may move timeline UI, but not annotation truth
  - pausing or clicking transport controls commits that resolved frame back through backend exact-frame load
  - playback overlays bootstrap from persisted annotated-frame metadata, not only paused exact-frame state
  - playback video and paused exact frame share one geometry box so zoom and overlays stay aligned
  - playback video stays mounted even while paused exact frame is visible, so play can resume from current shown frame without losing media state
  - when paused exact-frame load for a newer frame is pending, keep previous exact frame visible until the newer backend response wins
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
- [ui] Review-route chrome follows committed `docs/ui/video-review-1920x1080.png`; do not reintroduce shared app rail or placeholder session/export actions on `/review/:videoId`. #review #ui
- [scope] This note owns ingest and exact-frame truth; SAM2 and export live elsewhere. #review #scope
- [gotcha] Reused stale backends on `127.0.0.1:8000` can fake direct-route regressions even when current code is fine. #browser #backend
- [timeline] Timeline playhead follows preview frame while playback runs; propagation range and canonical frame stay separate controls. #review #playback #timeline
- [timeline] Timeline thumbnails use backend sprite windows, not one exact-frame request per visible slot. #review #playback #thumbnails
- [overlay] Playback overlays come from persisted annotated-frame cache and stay read-only until pause resolves exact frame. #review #playback #overlay
- [canvas] Exact-frame canvas images stay `draggable={false}` so browser image-drag does not steal box or refine pointer gestures from the review stage. #review #canvas #pointer-events
- [rule] Do not unmount playback video just because paused exact frame is visible; hidden mounted playback is what makes play resume work. #review #playback #ui
- [rule] Exact-frame loads need stale-response guard plus hold-old-frame rendering, or paused navigation flashes back to video. #review #frames #debugging
- [retrieval] Use this note for video library selection, exact frame review, or review route queries. #search

## Relations

- relates_to [[Product Requirements]]
- relates_to [[Architecture]]
- relates_to [[API]]
- relates_to [[Data Model]]
- relates_to [[2026-04-24 - split playback preview from canonical frame and seeded propagation range]]
