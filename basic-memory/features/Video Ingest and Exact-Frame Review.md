---
title: Video Ingest and Exact-Frame Review
type: note
permalink: video-annotator/features/video-ingest-and-exact-frame-review
tags:
- feature
- video
- exact-frame
- review
---

# Video Ingest and Exact-Frame Review

This feature owns baseline flow: discover local videos, pick one from library, open review screen, and bind review state to canonical backend frames.

## Summary
- Goal: make local video selection and frame review deterministic from backend-owned frame indices.
- Primary users: ML engineers and technical annotators reviewing local videos.
- Owning task note: [[Testing video ingest and exact-frame review]]

## Scope
- In scope:
  - startup indexing from `data/videos`
  - video library selection flow
  - video list and detail metadata reads
  - backend exact-frame fetch
  - jump and step
  - zero-based backend `frame_idx` as truth
- Out of scope:
  - manual box CRUD details
  - richer workspace ergonomics
  - SAM2 runtime details

## Current State
- Shipped behavior: startup indexing, list and detail reads, playback source, exact-frame fetch, jump, and step exist on core path. Automated proof now lives in `backend/tests/api/test_video_ingest_exact_frame.py` for backend indexing plus exact-frame routes and `frontend/src/app/live-review-app.test.tsx` for the real review workspace with request-boundary stubs.
- Known gaps: default frontend host still opens the fixture shell, so live exact-frame runtime proof needs the explicit `?app=live-review` host switch instead of the default app path.
- Current blockers: none for baseline ingest and frame fetch on current code; browser proof depends on starting a fresh current-code backend on `127.0.0.1:8000` so the preserved live-review harness does not inherit stale local server state.

## Target Behavior
- User starts in video library, picks one indexed video, lands in single review surface, and still works on canonical backend frames.
- Playback may run on main stage for context, but pause, jump, and step resolve to explicit backend frame identity.
- Invalid frame or decode failures stay concise and diagnosable.

## Contracts and Dependencies
- Backend contracts:
  - `GET /api/videos`
  - `GET /api/videos/{video_id}`
  - `GET /api/videos/{video_id}/source`
  - `GET /api/videos/{video_id}/frame/{frame_idx}`
- Frontend contracts:
  - library selection state stays separate from canonical current frame state
  - canonical `currentFrameIndex` updates only after successful backend resolution
- Data or storage contracts:
  - startup indexing scans `data/videos`
  - `Video.id` stays deterministic per relative source path

## Observations
- [status] Ingest and exact-frame foundations ship; library-first single-stage UI is next presentation layer #review #video
- [truth] Playback may exist in UI, but backend `frame_idx` stays annotation truth #frames #frontend
- [gap] Docs now target library-first review flow before runtime UI catches up #docs #ux
- [testing] Backend API integration now proves startup indexing, deterministic discovery order by canonical `source_path`, exact-frame PNG fetch, and invalid-frame rejection in `backend/tests/api/test_video_ingest_exact_frame.py` #testing #backend #exact-frame
- [testing] Frontend integration now proves live review selection, exact-frame load, next-frame, and previous-frame flow in `frontend/src/app/live-review-app.test.tsx` without treating playback source as canonical truth #testing #frontend #exact-frame
- [testing] Manual browser smoke can mount `LiveReviewApp` through `?app=live-review`; on 2026-04-21 it opened a real indexed video, loaded frame 3, stepped to frame 4, stepped back to frame 3, and saved `/tmp/us-007-live-review-harness.png` #testing #frontend #browser
- [retrieval] Use this note for video library selection, ingest, or canonical frame workflow queries #retrieval

## Relations
- relates_to [[Repo Current State and Feature Matrix]]
- relates_to [[Product Requirements]]
- relates_to [[Architecture]]
- relates_to [[API]]
- relates_to [[Data Model]]
