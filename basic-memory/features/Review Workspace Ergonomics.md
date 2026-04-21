---
title: Review Workspace Ergonomics
type: note
permalink: video-annotator/features/review-workspace-ergonomics
tags:
- feature
- frontend
- workspace
- ergonomics
---

# Review Workspace Ergonomics

This feature owns operator speed and clarity after review foundations are real.

## Summary
- Goal: make single-stage review screen fast enough that user can navigate, inspect, and act without frame-truth confusion.
- Primary users: reviewers navigating long videos with sparse annotations.
- Owning task notes: [[Build UI shell fixture foundation]], [[Build video library mockup shell]], [[Build review page mockup shell]], [[Wire page actions and local UI state]], [[Add UI integration tests for shell]], [[Testing review workspace ergonomics]], [[Ship review summary contracts]], [[Wire live library shell]], [[Build live single-stage review]], [[Add review navigation controls]], [[Add live review timeline and selected range controls]], [[Wire live selected-object summary]], [[Set up app route map]], [[Move library route ownership]], [[Extract live review feature entry]], [[Delete app live review entrypoint]], [[Delete ui-shell runtime leftovers]], [[Move frontend tests outside src]], [[Polish video-library route UI]], [[Polish video-review route UI]], and [[Verify routes and update docs]]

## Scope
- In scope:
  - library-to-review navigation
  - single-stage review layout
  - transport and range controls
  - annotated overlays on playback stage
  - richer inspector signals
  - propagation progress presentation
- Out of scope:
  - persistence mechanics themselves
  - SAM2 runtime internals
  - export packaging

## Current State
- Shipped behavior: app host now uses real browser routes, with `/` owned by `frontend/src/features/video-library/pages/library-page.tsx` and `/review/:videoId` owned by `frontend/src/features/video-review/pages/review-page.tsx`. That feature page reads `videoId` from route params and renders feature-owned live review screen `frontend/src/features/video-review/components/live-review-screen.tsx`, while fixture-shell coverage still reuses the moved `video-library` screen instead of keeping a second `ui-shell` library page copy. Live review still keeps playback visible on one stage, overlays the canonical exact frame only while paused, auto-loads the first annotated frame when manifest data has one, falls back to frame `0` otherwise, and keeps manual-box plus SAM2 controls reachable from the same workspace. Operators can now jump directly through manifest-backed annotated frames and keyframes, use paused-only keyboard shortcuts for routine movement, and adjust selected-mask overlay opacity locally without changing persisted data.
- Verification state: lower fixture review-shell proof still lives in `frontend/src/features/ui-shell/shell-host.test.tsx`, `frontend/src/features/video-review/pages/review-page.test.tsx` now proves route-param handoff into feature-owned live review screen, `frontend/src/app/App.test.tsx` proves routed app-host behavior for `/`, `/review/:videoId`, and `*`, and `frontend/src/features/video-review/components/live-review-screen.test.tsx` proves single-stage layout, direct-load bootstrap from `initialVideoId`, paused-only mutation gating, useful landing, annotated/keyframe jumps, keyboard shortcuts, and mask-opacity controls. Browser smoke on the real local stack saved `/tmp/us-014-live-library-shell.png`, `/tmp/us-014-live-review-entry.png`, `/tmp/us-015-live-single-stage-review.png`, `/tmp/us-016-review-navigation-controls.png`, `/home/simone/.dev-browser/tmp/us001-library-route.png`, `/home/simone/.dev-browser/tmp/us001-review-route.png`, `/home/simone/.dev-browser/tmp/us001-missing-route.png`, `/home/simone/.dev-browser/tmp/us002-library-route.png`, `/home/simone/.dev-browser/tmp/us002-review-route.png`, `/home/simone/.dev-browser/tmp/us003-review-route-refresh.png`, and `/home/simone/.dev-browser/tmp/us004-review-route-feature-owned.png`.
- Current blockers: live review still does not render timeline or selected-range controls, and it still does not call the selected-object summary route, so inspector `frames / propagated / corrected / mask_confidence` truth is absent from shipped UI. Stale long-lived backend listeners on `127.0.0.1:8000` can still fake `/manifest` failures during direct-route smoke, so browser proof should restart fresh current-code backend before judging route regressions. Backend summary route still keeps `mask_confidence` and `track_summary.corrected` as `null` because current persistence does not store SAM2 confidence or reviewer-correction provenance yet. Export state is still unshipped runtime truth, so backend summary derivation will not emit `exported` until real export persistence exists.

## PRD Requirements

- Library cards must show:
  - preview image
  - display name
  - state badge
  - frame count
  - FPS
  - resolution
  - last reviewed frame or `Not Started`
  - one state detail line such as imported-box summary, object or mask summary, or export summary
  - propagation progress only while `review_state` is `in_progress`
  - `Open Review` action
- Library states and meanings:
  - `not_started`: indexed video with no imported boxes and no saved review output
  - `started`: imported boxes exist, but reviewer has not saved manual review edit yet
  - `in_progress`: propagation job is active
  - `ready`: current saved state is ready for manual review or export
  - `exported`: latest export matches current saved review state
- State transitions:
  - importing boxes moves video to `started`
  - first manual save moves `not_started` or `started` to `ready`
  - pressing `Propagate` moves `ready` to `in_progress`, then back to `ready` when propagation finishes
  - any manual edit after `exported` moves video back to `ready`
  - importing new boxes over reviewed or exported work resets video to `started` until next manual save
- Progress bar rule:
  - progress means propagation completion only
  - progress is visible only while state is `in_progress`
- Selected-object inspector must show:
  - object id or class
  - bbox coordinates from current annotated box
  - nullable mask confidence
  - selected-range counters `frames`, `propagated`, and `corrected`
- Counter meanings:
  - `frames`: total frames in selected range
  - `propagated`: frames in selected range with propagated mask for selected object
  - `corrected`: propagated masks in selected range later fixed by reviewer
- Confidence rule:
  - numeric value only for untouched SAM2-generated masks
  - `null` for manual-only masks
  - `null` after reviewer correction

## Target Behavior
- User starts in library, then lands in one review surface with playback and overlayed annotations.
- User can play for context, pause on canonical frame, then edit or run SAM2.
- Inspector exposes bbox, nullable confidence, and selected-range summary.
- Progress UI means propagation completion only and shows only while propagation is active.

## Contracts and Dependencies
- Backend contracts:
  - video list, detail, and manifest now expose derived `review_state`, `propagation_progress_percent`, and `review_summary`
  - selected-object inspector now has dedicated summary route `GET /api/videos/{video_id}/objects/{object_id}/summary`
  - summary route currently returns honest `null` for `mask_confidence` and `track_summary.corrected` until persistence can prove those values
- Frontend contracts:
  - mutating actions are paused-only
  - canonical frame state stays separate from browser playback time
  - progress bar only represents propagation completion
- Data or storage contracts:
  - library state is derived from persisted review rows and active propagation jobs
  - export state remains blocked until export completion is persisted

## Integration Tests

| ID | Surface | Scenario | Real-World Why | Setup/Fixtures | Automation Status | Evidence |
| --- | --- | --- | --- | --- | --- | --- |
| INT-001 | backend | Derive honest library `review_state`, `propagation_progress_percent`, and `review_summary` fields from persisted rows plus active jobs | Freezes card-state truth so library chrome does not guess review progress or export state from fixture-only copy | Real FastAPI app, temp SQLite DB, seeded videos plus persisted rows and jobs | automated | `backend/tests/api/test_review_summary_contracts.py` |
| INT-002 | backend | Selected-object summary route returns bbox, nullable confidence, and selected-range `frames` or `propagated` or `corrected` counters without cross-video leakage | Freezes inspector contract before live UI wiring lands, while keeping `mask_confidence` and `corrected` honest `null` today | Real FastAPI app, temp SQLite DB, seeded objects and annotations, real route reads | automated | `backend/tests/api/test_review_summary_contracts.py` |
| INT-003 | frontend | Default host renders backend-backed library cards, empty or error states, and `Open Review` or `Back to Library` handoff | Proves shipped library chrome and review entry on real app host with fake HTTP only at request boundary | `App` with mocked `/api/videos` and mocked live review host boundary | automated | `frontend/src/app/App.test.tsx` |
| INT-004 | frontend | Fixture shell opens review, switches selected object in inspector, and returns to library without router state | Proves mockup shell ergonomics still behave coherently as lower seam proof | `UiShellApp` with mocked loader in `frontend/src/features/ui-shell/shell-host.test.tsx` | automated | `frontend/src/features/ui-shell/shell-host.test.tsx` |
| INT-005 | frontend | Live review uses one single-stage surface, lands on first useful frame, and jumps through annotated or keyframe markers | Proves shipped review navigation ergonomics without treating playback position as annotation truth | `LiveReviewScreen` with `MSW` request-boundary stubs | automated | `frontend/src/features/video-review/components/live-review-screen.test.tsx` |
| INT-006 | frontend | Live review keyboard shortcuts, local mask opacity, and paused-only mutation gating stay coherent on one stage | Proves operator-speed controls and review-stage guardrails now visible in shipped workspace | `LiveReviewScreen` with `MSW` request-boundary stubs | automated | `frontend/src/features/video-review/components/live-review-screen.test.tsx` |
| INT-007 | frontend | Live review loads selected-object summary from backend route and shows `frames / propagated / corrected / mask_confidence` truth in inspector | Future UI must prove inspector numbers come from backend summary route instead of ad-hoc frontend guesses | `LiveReviewScreen` with `MSW` or real request boundary once summary wiring lands | blocked until UI wiring exists | missing selected-object summary fetch and rendering in `frontend/src/features/video-review/components/live-review-screen.tsx`; tracked by `[[Wire live selected-object summary]]` |
| INT-008 | frontend | Live review renders timeline and selected-range controls, then keeps range-dependent inspector and propagation flows coherent | Future UI must prove selected-range ergonomics before PRD counter semantics can be exercised end-to-end | `LiveReviewScreen` with `MSW` or local stack once controls exist | blocked until controls exist | missing timeline and selected-range controls; tracked by `[[Add live review timeline and selected range controls]]` |

## E2E Tests

| ID | Scenario | Real-World Why | Setup/Fixtures | Automation Status | Evidence |
| --- | --- | --- | --- | --- | --- |
| E2E-001 | Open `/`, inspect route-owned live library chrome, and navigate into `/review/:videoId` from one card in a real browser | Freezes the default reviewer-visible route journey after feature-owned pages land without relying on fixture shell proof | local stack with real frontend, FastAPI app, and repo default data | planned | tracked by `[[Polish video-library route UI]]` |
| E2E-002 | Direct-load `/review/:videoId`, refresh, and end in either the live review workspace or the designed failure state with `Back to Library` | Freezes route-owned review entry behavior while keeping backend bootstrap gaps honest instead of hidden | local stack with real frontend, FastAPI app, and repo default data | planned; may stay blocked or failing until current bootstrap gaps are fixed separately | tracked by `[[Polish video-review route UI]]` |

## Manual Tests

Use exact execution status values only:
- `✅ Done`
- `⚠️ Partially`
- `❌ Not Done`

| ID | Scenario | Setup | Steps | Expected Result | Execution Status | Execution Notes |
| --- | --- | --- | --- | --- | --- | --- |
| MAN-001 | Fixture shell library -> review -> object switch -> back | Run frontend dev server, open fixture-shell default host used during shell smoke | Open one fixture card, switch selected object in inspector, then return to library | Review shell opens, inspector switches objects cleanly, and back navigation returns to library without losing shell coherence | ✅ Done | Browser smoke on 2026-04-21 saved `/tmp/us-006-library-shell.png`, `/tmp/us-006-review-shell.png`, and `/tmp/us-006-library-return.png` |
| MAN-002 | Route-owned live library opens review by URL navigation | Use current local frontend dev stack on `http://127.0.0.1:5173` with backend on `127.0.0.1:8000` | Open `/`, wait for backend library cards, then click one `Open Review` action | Default library route loads from live backend data and browser URL changes to `/review/:videoId` for the chosen video | ✅ Done | Playwright smoke on 2026-04-21 saved `/home/simone/.dev-browser/tmp/us002-library-route.png` and `/home/simone/.dev-browser/tmp/us002-review-route.png`; click on `Open Review bedroom.mp4` landed on `/review/video-2d62649f3590f8d0` |
| MAN-003 | Live single-stage review shows useful landing plus navigation controls | Run fresh current-code backend and frontend dev stack, open `?app=live-review` | Open one indexed video, confirm single-stage layout, jump through annotated or keyframe markers, use keyboard shortcuts, and adjust mask-opacity slider | Review stays on one stage, useful landing works, navigation shortcuts follow canonical frame state, and mask-opacity changes stay local | ✅ Done | Browser smoke on 2026-04-21 saved `/tmp/us-015-live-single-stage-review.png` and `/tmp/us-016-review-navigation-controls.png` |
| MAN-004 | App host routes `/`, `/review/:videoId`, and `*` resolve through real browser route map | Use current local frontend dev stack on `http://127.0.0.1:5174` with fresh `npm run backend:dev:e2e` on `127.0.0.1:8000` | Open `/`, direct-load `/review/video-2d62649f3590f8d0`, refresh same route, then open `/missing-route` and use `Back to Library` | Library route loads, review route resolves and applies URL video selection, refresh keeps same selected video and canonical frame load, and unknown route returns cleanly to `/` | ✅ Done | `dev-browser` smoke on 2026-04-21 saved `/home/simone/.dev-browser/tmp/us003-review-route-refresh.png`; direct review route kept `Open bedroom.mp4` pressed before and after refresh on fresh `backend:dev:e2e`, with `Canonical frame 0` visible both times |

## Observations
- [status] Ergonomics target changed from separate panes to single-stage review surface #frontend #ux
- [status] Default frontend entry now boots backend-backed library route from `frontend/src/features/video-library/pages/library-page.tsx`, and `/review/:videoId` is feature-owned under `frontend/src/features/video-review/pages/review-page.tsx` while `frontend/src/features/video-review/components/live-review-screen.tsx` renders live review workspace #frontend #ui
- [rule] Pause gates all mutating actions even though playback remains visible on stage #editing #ux
- [inspector] Mockup-first inspector needs backend summary data, not only manifest basics #inspector #api
- [progress] Progress UI is propagation-only, not generic review percent #progress #library
- [guardrail] Library shell must gate propagation progress on `state: in_progress`; fixture percent presence alone is not enough #progress #library #fixtures
- [state] Review shell now renders the mockup-first object rail, stage chrome, bottom transport, and inspector from fixture data with shell-local selected-object state #frontend #ui
- [state] Review chrome now returns to library through a callback from `shell-host.tsx`, so page flips stay router-free and preserve coherent fixture selection state #frontend #ui #navigation
- [routing] App host now uses real browser routes `/`, `/review/:videoId`, and `*`; `/` is feature-owned under `frontend/src/features/video-library/pages/library-page.tsx`, and `/review/:videoId` is feature-owned under `frontend/src/features/video-review/pages/review-page.tsx` with route-param handoff into `frontend/src/features/video-review/components/live-review-screen.tsx` #frontend #routing
- [state] Live review now keeps playback, exact-frame overlay, frame transport, and inspector controls on one review surface instead of separate playback and exact-frame panes #frontend #ui #live
- [state] Live review now auto-loads the first annotated manifest frame when available, exposes explicit annotated or keyframe jump buttons, and keeps keyboard shortcuts tied to canonical frame state instead of browser playback time #frontend #ui #navigation
- [testing] Selected-object inspector switching is now part of default-host shell proof in both automated frontend integration and manual browser smoke #testing #frontend #inspector
- [testing] `frontend/src/features/video-review/pages/review-page.test.tsx` freezes route-param handoff into temporary adapter, while `frontend/src/app/App.test.tsx` proves live library loading, empty or error states, and real `/review/:videoId` host routing; `frontend/src/features/video-library/library-page.test.tsx` keeps moved card-state proof local to the owning feature and `frontend/src/features/ui-shell/shell-host.test.tsx` keeps lower fixture-shell seam coverage by mocking the loader #testing #frontend #ui
- [testing] Manual browser smoke on 2026-04-21 confirmed library -> review -> object switch -> back navigation on the fixture shell and saved screenshots to `/tmp/us-006-library-shell.png`, `/tmp/us-006-review-shell.png`, and `/tmp/us-006-library-return.png` #testing #frontend #browser
- [testing] `frontend/src/features/video-review/components/live-review-screen.test.tsx` now proves the single-stage live surface, split-pane removal, and paused-only mutation gating, while `/tmp/us-015-live-single-stage-review.png` records fresh browser smoke on the real local stack #testing #frontend #backend
- [testing] Browser smoke on 2026-04-21 verified useful landing, annotated/keyframe jumps, `g` focus, arrow stepping, and mask-opacity slider state on `?app=live-review`, with artifact `/tmp/us-016-review-navigation-controls.png` #testing #frontend #browser
- [gotcha] Stale long-lived backend listeners on `127.0.0.1:8000` can fake `/api/videos/{video_id}/manifest` failures during direct `/review/:videoId` smoke; restart fresh current-code backend before treating that as route regression #frontend #backend #routing
- [testing] Live selected-object summary wiring and timeline or selected-range controls are still blocked, so this note keeps them as blocked frontend integration rows rather than fake green UI proof #testing #frontend #blocked
- [library] This note now carries required library card fields, state meanings, and transition rules from PRD instead of leaving them only in product spec notes #library #prd
- [inspector] This note now carries inspector field list, counter meanings, and confidence display rules from PRD #inspector #prd

## Relations
- relates_to [[Repo Current State and Feature Matrix]]
- relates_to [[m-2: Review Workspace Completion]]
- relates_to [[m-2a: Mockup UI Shell]]
- relates_to [[Frontend Interaction Spec]]
- relates_to [[API]]
- relates_to [[Auditing m-2 and m-2a code gaps 2026-04-21]]
- relates_to [[Auditing m-2 and m-2a code gaps 2026-04-21 follow-up]]
