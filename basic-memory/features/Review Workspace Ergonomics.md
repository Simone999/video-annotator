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
- Shipped behavior: default frontend entry now opens a fixture-backed shell with mockup library chrome, summary metrics, richer card metadata, propagation-only progress, local `Open Review` entry, and a fixture-backed review screen with object rail, stage overlays, transport timeline, inspector cards, selected-object inspector switching, and one explicit `Back to Library` return in review chrome. `frontend/src/app/App.test.tsx`, `frontend/src/features/ui-shell/shell-host.test.tsx`, and browser smoke screenshots at `/tmp/us-006-library-shell.png`, `/tmp/us-006-review-shell.png`, and `/tmp/us-006-library-return.png` now prove the library -> review -> object-switch -> back flow on that fixture shell.
- Known gaps: default host still stops at `frontend/src/app/App.tsx` -> `UiShellApp` -> `loadUiShellData()`, so shell evidence still does not prove live backend editing, persisted annotation reload, or paused-only mutating controls on the default app path. Live-stack proof now exists separately through `frontend/src/app/live-review-app.test.tsx` and the explicit `?app=live-review` harness. Audit note `[[Auditing m-2 and m-2a code gaps 2026-04-21]]` split remaining runtime work into backend summaries, live library wiring, single-stage review layout, and review controls.
- Current blockers: review-shell transport, export, and editing controls remain UI-only in the shell. Live-stack ergonomics still need more proof for manual-box, SAM2, and export flows even though the preserved harness can now mount the real review workspace against backend services.

## Target Behavior
- User starts in library, then lands in one review surface with playback and overlayed annotations.
- User can play for context, pause on canonical frame, then edit or run SAM2.
- Inspector exposes bbox, nullable confidence, and selected-range summary.
- Progress UI means propagation completion only and shows only while propagation is active.

## Contracts and Dependencies
- Backend contracts:
  - video list and detail need derived review state
  - selected-object inspector needs dedicated summary endpoint
- Frontend contracts:
  - mutating actions are paused-only
  - canonical frame state stays separate from browser playback time
  - progress bar only represents propagation completion
- Data or storage contracts:
  - library state is derived from persisted review and export facts

## Observations
- [status] Ergonomics target changed from separate panes to single-stage review surface #frontend #ux
- [status] Default frontend entry now boots a fixture-backed shell host while the old live review UI stays preserved in `frontend/src/app/live-review-app.tsx` #frontend #ui
- [rule] Pause gates all mutating actions even though playback remains visible on stage #editing #ux
- [inspector] Mockup-first inspector needs backend summary data, not only manifest basics #inspector #api
- [progress] Progress UI is propagation-only, not generic review percent #progress #library
- [guardrail] Library shell must gate propagation progress on `state: in_progress`; fixture percent presence alone is not enough #progress #library #fixtures
- [state] Review shell now renders the mockup-first object rail, stage chrome, bottom transport, and inspector from fixture data with shell-local selected-object state #frontend #ui
- [state] Review chrome now returns to library through a callback from `shell-host.tsx`, so page flips stay router-free and preserve coherent fixture selection state #frontend #ui #navigation
- [testing] Selected-object inspector switching is now part of default-host shell proof in both automated frontend integration and manual browser smoke #testing #frontend #inspector
- [testing] `frontend/src/app/App.test.tsx` now proves shell workflow through the default app host, while `frontend/src/features/ui-shell/shell-host.test.tsx` keeps lower shell seam coverage; both stay fixture-backed and avoid live backend routes #testing #frontend #ui
- [testing] Manual browser smoke on 2026-04-21 confirmed library -> review -> object switch -> back navigation on the fixture shell and saved screenshots to `/tmp/us-006-library-shell.png`, `/tmp/us-006-review-shell.png`, and `/tmp/us-006-library-return.png` #testing #frontend #browser
- [testing] `frontend/src/app/live-review-app.test.tsx` plus the opt-in `?app=live-review` host now give live exact-frame proof without changing the shell-first default app entry #testing #frontend #backend
- [gap] Default host still mounts `UiShellApp` and static fixtures first, so shell proof and live proof must stay separate in notes and tests #gap #frontend #backend
- [gap] Audit on 2026-04-21 split remaining milestone work into `[[Ship review summary contracts]]`, `[[Wire live library shell]]`, `[[Build live single-stage review]]`, and `[[Add review navigation controls]]` #gap #frontend #backend #tasks

## Relations
- relates_to [[Repo Current State and Feature Matrix]]
- relates_to [[m-2: Review Workspace Completion]]
- relates_to [[m-2a: Mockup UI Shell]]
- relates_to [[Frontend Interaction Spec]]
- relates_to [[API]]
- relates_to [[Auditing m-2 and m-2a code gaps 2026-04-21]]
