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
- Owning task notes: [[Build UI shell fixture foundation]], [[Build video library mockup shell]], [[Build review page mockup shell]], [[Wire page actions and local UI state]], [[Add UI integration tests for shell]], [[Testing review workspace ergonomics]], [[Ship review summary contracts]], [[Wire live library shell]], [[Build live single-stage review]], and [[Add review navigation controls]]

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
- Shipped behavior: default frontend entry now opens backend-backed library shell chrome with derived summary metrics, honest card metadata from `/api/videos`, empty or error handling, and local `Open Review` handoff into the single-stage live review surface in `frontend/src/app/live-review-app.tsx` with a `Back to Library` callback. That live surface keeps playback visible on one stage, overlays the canonical exact frame only while paused, and keeps manual-box plus SAM2 controls reachable from the same workspace. Lower fixture review-shell proof still lives in `frontend/src/features/ui-shell/shell-host.test.tsx`, while `frontend/src/app/App.test.tsx` proves the live library host through mocked HTTP. `frontend/src/app/live-review-app.test.tsx` now proves the single-stage surface replaces split panes and pauses mutating controls during playback, and `/tmp/us-014-live-library-shell.png`, `/tmp/us-014-live-review-entry.png`, plus `/tmp/us-015-live-single-stage-review.png` capture fresh browser smoke on the real local stack. Backend list, detail, and manifest payloads still ship derived `review_state`, `propagation_progress_percent`, and `review_summary` fields from persisted annotation rows plus active `sam2_propagation` jobs, while `GET /api/videos/{video_id}/objects/{object_id}/summary` ships bbox and range counters for live inspector wiring.
- Known gaps: useful landing, annotated or keyframe jumps, keyboard shortcuts, and mask-opacity controls are still pending in `[[Add review navigation controls]]`. Default-host browser proof now reaches the real single-stage review path, but richer reviewer-navigation ergonomics still depend on that follow-up story.
- Current blockers: backend summary route keeps `mask_confidence` and `track_summary.corrected` as `null` because current persistence does not store SAM2 confidence or reviewer-correction provenance yet. Export state is still unshipped runtime truth, so backend summary derivation will not emit `exported` until real export persistence exists.

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

## Observations
- [status] Ergonomics target changed from separate panes to single-stage review surface #frontend #ux
- [status] Default frontend entry now boots backend-backed library shell and hands off into the single-stage live review surface in `frontend/src/app/live-review-app.tsx` #frontend #ui
- [rule] Pause gates all mutating actions even though playback remains visible on stage #editing #ux
- [inspector] Mockup-first inspector needs backend summary data, not only manifest basics #inspector #api
- [progress] Progress UI is propagation-only, not generic review percent #progress #library
- [guardrail] Library shell must gate propagation progress on `state: in_progress`; fixture percent presence alone is not enough #progress #library #fixtures
- [state] Review shell now renders the mockup-first object rail, stage chrome, bottom transport, and inspector from fixture data with shell-local selected-object state #frontend #ui
- [state] Review chrome now returns to library through a callback from `shell-host.tsx`, so page flips stay router-free and preserve coherent fixture selection state #frontend #ui #navigation
- [state] Live review now keeps playback, exact-frame overlay, frame transport, and inspector controls on one review surface instead of separate playback and exact-frame panes #frontend #ui #live
- [testing] Selected-object inspector switching is now part of default-host shell proof in both automated frontend integration and manual browser smoke #testing #frontend #inspector
- [testing] `frontend/src/app/App.test.tsx` now proves live library loading, empty or error states, and review handoff through the default app host with mocked HTTP, while `frontend/src/features/ui-shell/shell-host.test.tsx` keeps lower fixture-shell seam coverage by mocking the loader #testing #frontend #ui
- [testing] Manual browser smoke on 2026-04-21 confirmed library -> review -> object switch -> back navigation on the fixture shell and saved screenshots to `/tmp/us-006-library-shell.png`, `/tmp/us-006-review-shell.png`, and `/tmp/us-006-library-return.png` #testing #frontend #browser
- [testing] `frontend/src/app/live-review-app.test.tsx` now proves the single-stage live surface, split-pane removal, and paused-only mutation gating, while `/tmp/us-015-live-single-stage-review.png` records fresh browser smoke on the real local stack #testing #frontend #backend
- [gap] Audit-created follow-up work is now down to `[[Add review navigation controls]]` after review-summary contracts, live library wiring, and single-stage review shipped #gap #frontend #backend #tasks

## Relations
- relates_to [[Repo Current State and Feature Matrix]]
- relates_to [[m-2: Review Workspace Completion]]
- relates_to [[m-2a: Mockup UI Shell]]
- relates_to [[Frontend Interaction Spec]]
- relates_to [[API]]
- relates_to [[Auditing m-2 and m-2a code gaps 2026-04-21]]
