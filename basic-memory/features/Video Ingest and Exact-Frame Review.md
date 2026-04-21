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
- Owning task notes: [[Testing video ingest and exact-frame review]], [[Wire live library shell]], and [[Reshape E2E bootstrap and test layout]]

## Scope
- In scope:
  - explicit local video indexing from `data/videos`
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
- Shipped behavior: explicit migration plus baseline indexing, list and detail reads, playback source, exact-frame fetch, jump, and step exist on core path. Default frontend startup now reaches the real indexed library through backend `/api/videos` after explicit bootstrap, and both library navigation plus direct `/review/:videoId` loads now enter feature-owned page `frontend/src/features/video-review/pages/review-page.tsx`, which renders single-stage live review surface `frontend/src/features/video-review/components/live-review-screen.tsx`. Automated proof lives in `backend/tests/integration/api/test_video_ingest_exact_frame.py`, `frontend/tests/component/video-review/review-page.test.tsx`, `frontend/tests/component/video-review/live-review-screen.test.tsx`, and `tests/e2e/specs/routes.spec.ts`.
- Known gaps: this note stays scoped to ingest and exact-frame truth. Richer library card semantics, review-state derivation, inspector counters, and export-state behavior live in `[[Review Workspace Ergonomics]]` and remain partially blocked there.
- Current blockers: none for baseline ingest and frame fetch on current code; browser proof still depends on starting a fresh current-code backend on `127.0.0.1:8000` so live review does not inherit stale local server state.

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
  - explicit baseline seed scans `data/videos`
  - `Video.id` stays deterministic per relative source path

## Integration Tests

| ID | Surface | Scenario | Real-World Why | Setup/Fixtures | Automation Status | Evidence |
| --- | --- | --- | --- | --- | --- | --- |
| INT-001 | backend | Explicit migration plus baseline seed index local videos and return deterministic discovery order plus stable ids from canonical `source_path` | Freezes ingest truth so library selection does not drift across restarts or machine-local file order quirks | Real FastAPI app, temp SQLite DB, explicit Alembic upgrade, temp `data/videos` tree, stubbed metadata inspector | automated | `backend/tests/integration/api/test_video_ingest_exact_frame.py` |
| INT-002 | backend | `GET /api/videos/{video_id}/frame/{frame_idx}` returns `image/png` for valid frame and rejects out-of-range frame indexes | Proves canonical backend exact-frame contract and invalid-frame behavior at app boundary | Real FastAPI app, temp SQLite DB, explicit Alembic upgrade, temp video source dir, selective frame-decode stub | automated | `backend/tests/integration/api/test_video_ingest_exact_frame.py` |
| INT-003 | frontend | Default backend-backed library opens live review with selected backend video id and returns to library through local back action | Proves normal ingest-to-review handoff without mixing library host state into canonical frame state | `App` with mocked HTTP for `/api/videos` plus mocked live review host boundary in `frontend/tests/component/app/app-routes.test.tsx` | automated | `frontend/tests/component/app/app-routes.test.tsx` |
| INT-004 | frontend | Live review opens one video, loads exact frame, and steps next or previous while playback stays contextual only | Proves reviewer-visible exact-frame workflow with real React state and fake HTTP only at request boundary | `LiveReviewScreen` with `MSW` stubs for detail, manifest, frame, and annotations routes | automated | `frontend/tests/component/video-review/live-review-screen.test.tsx` |

## E2E Tests

| ID | Scenario | Real-World Why | Setup/Fixtures | Automation Status | Evidence |
| --- | --- | --- | --- | --- | --- |
| E2E-001 | Open `/`, enter `/review/:videoId`, refresh same route, and return to `/` | Freezes real browser ingest-to-review handoff plus direct-route recovery after explicit E2E bootstrap | `tests/e2e/global.setup.ts` baseline bootstrap, real frontend on `127.0.0.1:3000`, real FastAPI app on `127.0.0.1:8000` | automated | `tests/e2e/specs/routes.spec.ts` |

## Manual Tests

Use exact execution status values only:
- `✅ Done`
- `⚠️ Partially`
- `❌ Not Done`

| ID | Scenario | Setup | Steps | Expected Result | Execution Status | Execution Notes |
| --- | --- | --- | --- | --- | --- | --- |
| MAN-001 | Default host opens indexed video from backend-backed library and returns to library | Run `npm run backend:dev:e2e` and `npm run frontend:dev:e2e`, open `http://127.0.0.1:5174`, wait for indexed library rows | Open one indexed video from library, confirm live review loads selected backend video, then use `Back to Library` | Library rows come from backend, selected video opens in live review, and local back navigation returns to library without stale selection confusion | ✅ Done | Browser smoke on 2026-04-21 saved `/tmp/us-014-live-library-shell.png` and `/tmp/us-014-live-review-entry.png` |
| MAN-002 | Direct review route loads exact frame and steps forward then back | Run fresh current-code backend on `127.0.0.1:8000` plus frontend dev server, open one real `/review/:videoId` route | Select indexed video if needed, load frame `3`, step to frame `4`, then step back to frame `3` | Canonical frame label follows backend frame index exactly and stepping does not depend on browser playback time | ✅ Done | Browser smoke on 2026-04-21 saved `/tmp/us-007-live-review-harness.png`; task note records stale-backend gotcha on `127.0.0.1:8000` |

## Observations
- [status] Ingest and exact-frame foundations now ship on live library-first single-stage path; richer workspace semantics live in `[[Review Workspace Ergonomics]]` #review #video
- [truth] Playback may exist in UI, but backend `frame_idx` stays annotation truth #frames #frontend
- [scope] This note stays on ingest and exact-frame truth; library card, review-state, and inspector semantics live in `[[Review Workspace Ergonomics]]` #review #scope
- [testing] Backend API integration now proves explicit migration plus baseline indexing, deterministic discovery order by canonical `source_path`, exact-frame PNG fetch, and invalid-frame rejection in `backend/tests/integration/api/test_video_ingest_exact_frame.py` #testing #backend #exact-frame
- [testing] Frontend integration now proves route-param handoff in `frontend/tests/component/video-review/review-page.test.tsx` plus live review selection, exact-frame load, next-frame, and previous-frame flow in `frontend/tests/component/video-review/live-review-screen.test.tsx` without treating playback source as canonical truth #testing #frontend #exact-frame
- [testing] Committed browser E2E now proves real `/` -> `/review/:videoId` -> refresh -> `/` route flow from explicit bootstrap in `tests/e2e/global.setup.ts` and `tests/e2e/specs/routes.spec.ts` #testing #frontend #browser #e2e
- [routing] Direct `/review/:videoId` loads now enter feature-owned page `frontend/src/features/video-review/pages/review-page.tsx`, while `frontend/src/features/video-review/components/live-review-screen.tsx` owns live review composition #frontend #routing
- [testing] Manual browser smoke on 2026-04-21 opened live review through `/review/video-2d62649f3590f8d0`, kept `Canonical frame 0` visible after refresh, and saved `/home/simone/.dev-browser/tmp/us004-review-route-feature-owned.png` #testing #frontend #browser
- [testing] Default-host browser smoke on 2026-04-21 loaded backend-backed library rows at `http://127.0.0.1:5174`, opened `bedroom.mp4`, and confirmed live review handoff with screenshots `/tmp/us-014-live-library-shell.png` and `/tmp/us-014-live-review-entry.png` #testing #frontend #browser
- [retrieval] Use this note for video library selection, ingest, or canonical frame workflow queries #retrieval

## Relations
- relates_to [[Repo Current State and Feature Matrix]]
- relates_to [[Product Requirements]]
- relates_to [[Architecture]]
- relates_to [[API]]
- relates_to [[Data Model]]
