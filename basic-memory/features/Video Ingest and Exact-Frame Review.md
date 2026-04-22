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
- Shipped behavior: explicit migration plus baseline indexing, list and detail reads, playback source, exact-frame fetch, jump, and step exist on core path. Default frontend startup now reaches the real indexed library through backend `/api/videos` after explicit bootstrap, and both library navigation plus direct `/review/:videoId` loads now enter feature-owned page `frontend/src/features/video-review/pages/review-page.tsx`, which renders single-stage live review surface `frontend/src/features/video-review/components/live-review-screen.tsx`. Route-owned library and review shells now follow the authoritative HTML chrome more closely with fixed top bar plus left rail layout, flatter summary strips, backend-backed selected-object inspector truth, timeline-first transport chrome, interactive manifest markers, and scrubber-driven exact-frame loads that stay canonical to backend `frame_idx`. Automated proof lives in `backend/tests/integration/api/test_video_ingest_exact_frame.py`, `frontend/tests/integration/video-library/video-library-screen.test.tsx`, `frontend/tests/integration/video-review/review-page.test.tsx`, `frontend/tests/integration/video-review/live-review-screen.test.tsx`, `frontend/tests/unit/video-review/review-transport-controls.test.tsx`, and `frontend/tests/e2e/routes.spec.ts`.
- Known gaps: this note stays scoped to ingest and exact-frame truth. Real `exported` truth still lives in `[[Export]]`.
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
| INT-003 | frontend | Default backend-backed library opens live review with selected backend video id and returns to library through local back action | Proves normal ingest-to-review handoff without mixing library host state into canonical frame state | `App` with mocked HTTP for `/api/videos` plus mocked live review host boundary in `frontend/tests/integration/app/app-routes.test.tsx` | automated | `frontend/tests/integration/app/app-routes.test.tsx` |
| INT-004 | frontend | Live review opens one video, loads exact frame, and steps next or previous while playback stays contextual only | Proves reviewer-visible exact-frame workflow with real React state and fake HTTP only at request boundary | `LiveReviewScreen` with `MSW` stubs for detail, manifest, frame, and annotations routes | automated | `frontend/tests/integration/video-review/live-review-screen.test.tsx` |

## E2E Tests

| ID | Scenario | Real-World Why | Setup/Fixtures | Automation Status | Evidence |
| --- | --- | --- | --- | --- | --- |
| E2E-001 | Open `/`, enter `/review/:videoId`, refresh same route, and return to `/` | Freezes real browser ingest-to-review handoff plus direct-route recovery after explicit E2E bootstrap | `tests/e2e/global.setup.ts` baseline bootstrap, real frontend on `127.0.0.1:3000`, real FastAPI app on `127.0.0.1:8000` | automated | `frontend/tests/e2e/routes.spec.ts` |

## Manual Tests

Use exact execution status values only:
- `✅ Done`
- `⚠️ Partially`
- `❌ Not Done`

| ID | Scenario | Setup | Steps | Expected Result | Execution Status | Execution Notes |
| --- | --- | --- | --- | --- | --- | --- |
| MAN-001 | Default host opens indexed video from backend-backed library and returns to library | Run `npm run backend:dev:e2e` and `npm run frontend:dev:e2e`, open `http://127.0.0.1:5174`, wait for indexed library rows | Open one indexed video from library, confirm live review loads selected backend video, then use `Back to Library` | Library rows come from backend, selected video opens in live review, and local back navigation returns to library without stale selection confusion | ✅ Done | Browser smoke on 2026-04-21 saved `/tmp/us-014-live-library-shell.png` and `/tmp/us-014-live-review-entry.png` |
| MAN-002 | Direct review route loads exact frame and steps forward then back | Run fresh current-code backend on `127.0.0.1:8000` plus frontend dev server, open one real `/review/:videoId` route | Select indexed video if needed, load frame `3`, step to frame `4`, then step back to frame `3` | Canonical frame label follows backend frame index exactly and stepping does not depend on browser playback time | ✅ Done | Browser smoke on 2026-04-21 saved `/tmp/us-007-live-review-harness.png`; task note records stale-backend gotcha on `127.0.0.1:8000` |

## Recent Verification

- Fresh browser smoke on 2026-04-22 with clean E2E storage and fresh `backend:dev:e2e` on `127.0.0.1:8000` loaded `/review/video-2d62649f3590f8d0`, refreshed same route, and kept route-owned review workspace loaded before returning to `/`; screenshots: `/tmp/us009-review-route-open.png` and `/tmp/us009-review-route-refresh.png`.
- Timeline transport smoke on 2026-04-22 with fresh seeded review-navigation data, current-code backend on `127.0.0.1:8000`, frontend on `127.0.0.1:3100`, and `dev-browser` loaded `/review/video-2d62649f3590f8d0`, changed propagation end frame to `18`, confirmed review timeline plus 2 annotated markers and 2 keyframe markers, and saved `/home/simone/.dev-browser/tmp/us016-timeline-transport-browser.png`.
- Timeline interaction smoke on 2026-04-22 with fresh review-navigation seed data, current-code backend on `127.0.0.1:8000`, frontend on `127.0.0.1:3100`, and headless Playwright loaded `/review/video-2d62649f3590f8d0`, dragged timeline scrubber from frame `7` to `18`, saw selected range update to `18-199`, normalized propagation end-frame input `6` down to selected range `18-18`, jumped back with `Annotated frame marker at 7`, and saved `/tmp/us017-timeline-range-browser.png`.
- Reused stale backends on `127.0.0.1:8000` can still fake direct-route `Failed to fetch` regressions even when current code passes on fresh seeded storage, so restart current-code `backend:dev:e2e` before judging route-browser failures.
- Targeted frontend route-shell checks on 2026-04-22 now freeze authoritative HTML chrome shape through `frontend/tests/integration/video-library/video-library-screen.test.tsx`, `frontend/tests/integration/video-review/live-review-screen.test.tsx`, `frontend/tests/integration/app/app-routes.test.tsx`, and `frontend/tests/integration/video-review/review-page.test.tsx`; attempted Playwright rerun still hit backend `/manifest` `500` on stale `127.0.0.1:8000` state, so browser evidence for this polish slice stays blocked by backend stack hygiene rather than route-shell DOM.
- No-mockup UI artifact capture on 2026-04-22 now saves `docs/ui/not-found-route.png`, `docs/ui/video-library-status-loading.png`, `docs/ui/video-library-status-error.png`, `docs/ui/review-route-status-loading.png`, `docs/ui/review-route-status-error.png`, and `docs/ui/exact-frame-canvas.png` from local frontend dev server plus Storybook after the shared style-system migration.

## Observations
- [status] Ingest and exact-frame foundations now ship on live library-first single-stage path with interactive timeline transport and manifest-marker jumps, so later m-2 tasks can stay on summary truth and review audit work #review #video
- [truth] Playback may exist in UI, but backend `frame_idx` stays annotation truth #frames #frontend
- [scope] This note stays on ingest and exact-frame truth; route-owned shell parity plus interactive timeline transport now ship here, while SAM2 runtime truth still pairs with `[[SAM2 Shell and Runtime]]` #review #scope
- [testing] Backend API integration now proves explicit migration plus baseline indexing, deterministic discovery order by canonical `source_path`, exact-frame PNG fetch, and invalid-frame rejection in `backend/tests/integration/api/test_video_ingest_exact_frame.py` #testing #backend #exact-frame
- [testing] Frontend integration now proves route-param handoff in `frontend/tests/integration/video-review/review-page.test.tsx` plus live review selection, exact-frame load, interactive timeline scrub or marker jumps, selected-range footer, fallback frame jump, next-frame, and previous-frame flow in `frontend/tests/integration/video-review/live-review-screen.test.tsx` without treating playback source as canonical truth #testing #frontend #exact-frame
- [ui] Route-owned library and review shells now keep PRD-shaped chrome with backend-backed selected-object inspector truth, manifest-driven timeline scrub or marker transport, and exact-frame numeric fallback demoted behind secondary transport UI #frontend #ui #review
- [ui] Shared route chrome now lives in `frontend/src/styles/app.css`, `tokens.css`, `base.css`, and `utilities.css`, with library and review shells using named classes like `app-topbar`, `app-rail`, `workspace-panel`, and `route-status-screen` instead of legacy global app CSS #frontend #styles #ui
- [fetch] Review controller now requests selected-object summary from current object, canonical frame, and current propagation-range inputs without changing backend frame truth #frontend #summary #exact-frame
- [range] Live review now keeps one explicit inclusive selected-range controller state on canonical frame indices, and interactive timeline scrub or marker jumps recompute that shared range without inventing a second transport state #review #range #exact-frame
- [testing] Committed browser E2E now proves real `/` -> `/review/:videoId` -> refresh -> `/` route flow from explicit bootstrap in `tests/e2e/global.setup.ts` and `frontend/tests/e2e/routes.spec.ts` #testing #frontend #browser #e2e
- [routing] Direct `/review/:videoId` loads now enter feature-owned page `frontend/src/features/video-review/pages/review-page.tsx`, while `frontend/src/features/video-review/components/live-review-screen.tsx` owns live review composition #frontend #routing
- [testing] Manual browser smoke on 2026-04-21 opened live review through `/review/video-2d62649f3590f8d0`, kept `Canonical frame 0` visible after refresh, and saved `/home/simone/.dev-browser/tmp/us004-review-route-feature-owned.png` #testing #frontend #browser
- [testing] Default-host browser smoke on 2026-04-21 loaded backend-backed library rows at `http://127.0.0.1:5174`, opened `bedroom.mp4`, and confirmed live review handoff with screenshots `/tmp/us-014-live-library-shell.png` and `/tmp/us-014-live-review-entry.png` #testing #frontend #browser
- [retrieval] Use this note for video library selection, ingest, or canonical frame workflow queries #retrieval
- [architecture] Frontend ingest and exact-frame path now keeps `library-page.tsx` as route seam only, while `useVideoReviewWorkspace()` composes smaller hooks for video list, selection, exact-frame load, and SAM2 state without changing canonical frame behavior #frontend #react #exact-frame #architecture
- [architecture] Frontend shared primitives now live under `frontend/src/shared/`, while `frontend/src/app/` stays bootstrap-only and similar route-status shells reuse one shared primitive through feature-owned wrappers. #frontend #architecture #ui
- [transport] Browser or test scrubber math should read live track frame count from slider state such as `aria-valuemax`, not assume the 42-frame sample fixture, because seeded review-navigation videos use different frame counts #review #testing #timeline

## Relations
- relates_to [[Product Requirements]]
- relates_to [[Architecture]]
- relates_to [[API]]
- relates_to [[Data Model]]
