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
- Shipped behavior: default frontend entry now opens backend-backed library shell chrome with derived summary metrics, honest card metadata from `/api/videos`, empty or error handling, and local `Open Review` handoff into the preserved live review harness with a `Back to Library` callback. Lower fixture review-shell proof still lives in `frontend/src/features/ui-shell/shell-host.test.tsx`, while `frontend/src/app/App.test.tsx` now proves the live library host through mocked HTTP and `/tmp/us-014-live-library-shell.png` plus `/tmp/us-014-live-review-entry.png` capture fresh browser smoke on the real local stack. Backend list, detail, and manifest payloads still ship derived `review_state`, `propagation_progress_percent`, and `review_summary` fields from persisted annotation rows plus active `sam2_propagation` jobs, while `GET /api/videos/{video_id}/objects/{object_id}/summary` ships bbox and range counters for live inspector wiring.
- Known gaps: entering review from the default host still lands in the legacy split-pane `frontend/src/app/live-review-app.tsx`, not the target single-stage review surface. Default-host browser proof now reaches real library rows and live review handoff, but paused-only mutating ergonomics still depend on the preserved live harness and its dedicated tests.
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
- [status] Default frontend entry now boots backend-backed library shell while the old live review UI stays preserved in `frontend/src/app/live-review-app.tsx` for review handoff #frontend #ui
- [rule] Pause gates all mutating actions even though playback remains visible on stage #editing #ux
- [inspector] Mockup-first inspector needs backend summary data, not only manifest basics #inspector #api
- [progress] Progress UI is propagation-only, not generic review percent #progress #library
- [guardrail] Library shell must gate propagation progress on `state: in_progress`; fixture percent presence alone is not enough #progress #library #fixtures
- [state] Review shell now renders the mockup-first object rail, stage chrome, bottom transport, and inspector from fixture data with shell-local selected-object state #frontend #ui
- [state] Review chrome now returns to library through a callback from `shell-host.tsx`, so page flips stay router-free and preserve coherent fixture selection state #frontend #ui #navigation
- [testing] Selected-object inspector switching is now part of default-host shell proof in both automated frontend integration and manual browser smoke #testing #frontend #inspector
- [testing] `frontend/src/app/App.test.tsx` now proves live library loading, empty or error states, and review handoff through the default app host with mocked HTTP, while `frontend/src/features/ui-shell/shell-host.test.tsx` keeps lower fixture-shell seam coverage by mocking the loader #testing #frontend #ui
- [testing] Manual browser smoke on 2026-04-21 confirmed library -> review -> object switch -> back navigation on the fixture shell and saved screenshots to `/tmp/us-006-library-shell.png`, `/tmp/us-006-review-shell.png`, and `/tmp/us-006-library-return.png` #testing #frontend #browser
- [testing] `frontend/src/app/live-review-app.test.tsx` plus the opt-in `?app=live-review` host still give dedicated exact-frame proof, but default-host browser smoke now also proves real library startup and live review entry on the normal app path #testing #frontend #backend
- [gap] Default host no longer mounts static library fixtures first, but review UX after handoff still uses the legacy live harness until `[[Build live single-stage review]]` lands #gap #frontend #backend
- [gap] Audit on 2026-04-21 split remaining milestone work into `[[Ship review summary contracts]]`, `[[Wire live library shell]]`, `[[Build live single-stage review]]`, and `[[Add review navigation controls]]` #gap #frontend #backend #tasks

## Relations
- relates_to [[Repo Current State and Feature Matrix]]
- relates_to [[m-2: Review Workspace Completion]]
- relates_to [[m-2a: Mockup UI Shell]]
- relates_to [[Frontend Interaction Spec]]
- relates_to [[API]]
- relates_to [[Auditing m-2 and m-2a code gaps 2026-04-21]]
