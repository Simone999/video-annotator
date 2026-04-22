---
id: task-add-review-navigation-controls
title: Add review navigation controls
status: done
completed:
steps:
- creation
- planning
- execution
- wrap_up
tags:
- task
- frontend
- controls
- review
- frames
permalink: video-annotator/tasks/add-review-navigation-controls
---

## Creation Phase

### Description

Finish `[[m-2: Review Workspace Completion]]` controls on the live review path. Use manifest-provided frame lists and canonical frame state to add useful default landing, annotated-frame and keyframe jumps, keyboard shortcuts, and mask-opacity controls without letting browser time become annotation truth.

### Scope

- In scope: default landing-frame selection, annotated-frame jumps, keyframe jumps, keyboard controls for routine review movement, mask-opacity controls, and tests for those workflows
- Out of scope: export work, fixture-shell-only polish, or backend frame-truth rewrites that existing manifest data already covers

### Affected Features

- [[Review Workspace Ergonomics]]
- [[Video Ingest and Exact-Frame Review]]
- [[SAM2 Shell and Runtime]]

### Acceptance Criteria

- [x] Opening live review lands on a useful canonical frame without manual frame entry
- [x] Reviewer can jump between annotated frames or keyframes without typing raw frame numbers repeatedly
- [x] Keyboard controls and mask-opacity controls are available on the live review path
- [x] Automated tests cover the new review controls honestly

### Test Intent

- Backend: none unless a missing manifest or summary contract is proven during planning
- Frontend: prove landing-frame, frame-jump, keyboard, and opacity behavior on the live review path
- Manual: verify controls feel usable in browser and record exact blocked cases if any remain

### Definition of Done

- [x] Relevant frontend tests pass
- [x] Browser verification recorded honestly
- [x] Memory updated if behavior changes
- [x] Supporting docs updated if control behavior or contracts change

## Planning Phase
### Planned Integration Tests

- Backend: none. Manifest already exposes `annotated_frames` and `keyframes`, and this story should reuse that shipped contract instead of adding routes.
- Frontend: add one frontend integration test that proves opening live review auto-loads first annotated frame and supports previous/next annotated plus previous/next keyframe jumps without raw frame entry.
- Frontend: add one frontend integration test that proves keyboard shortcuts drive play/pause, frame stepping, annotated-frame jumps, focus-to-frame-input, and delete-selected-box behavior without using browser playback time as truth.
- Frontend: extend live exact-frame integration coverage to prove mask-opacity slider updates selected-mask overlay opacity on the live review surface.

### Planned E2E Tests

- Backend: none.
- Frontend: no new Playwright test planned. `[[frontend-integration-tests]]` is the default layer for live review screen behavior with fake HTTP boundary, and this story changes local controls rather than broad browser-to-backend wiring.
- Frontend: manual browser verification on `?app=live-review` will cover useful landing, manifest jumps, keyboard shortcuts, and mask opacity with honest notes if any interaction stays blocked.

### Planned Implementation

- Step 1: keep changes inside `frontend/src/app/live-review-app.tsx`, `frontend/src/features/video-review/exact-frame-canvas.tsx`, and related tests unless a smaller helper extraction becomes necessary.
- Step 2: add local helpers for useful landing frame, nearest previous/next frame from manifest lists, and keyboard handlers that pause playback before canonical frame jumps or mutations.
- Step 3: add local mask-opacity state in live review app and pass selected-opacity styling into `ExactFrameCanvas` without changing backend contracts.
- Step 4: keep raw frame input available as fallback, but add explicit annotated and keyframe jump controls so routine review no longer depends on typing frame numbers.

### Feature Matrix Updates

- Feature note updates needed before or during execution: update `[[Review Workspace Ergonomics]]` once control behavior and verification evidence are real.
- Task note updates needed during execution: record targeted Vitest commands, browser verification, and any keyboard or opacity gotchas honestly.

## Execution Phase

### Implementation Notes

- Added useful landing-frame loading in `frontend/src/app/live-review-app.tsx`: once manifest data is ready, live review now auto-loads the first annotated frame and falls back to frame `0` when no annotation exists yet.
- Added explicit `Previous/Next annotated frame` and `Previous/Next keyframe` controls, plus local helpers that reuse manifest `annotated_frames` and `keyframes` instead of inventing new frame-summary routes.
- Added paused-only keyboard shortcuts on the live review path: `Space` toggles playback context, arrow keys step canonical frames, `g` focuses raw frame input, and `Delete` removes the selected saved manual box when the current frame is mutable.
- Added local mask-opacity state plus `maskOpacity` rendering in `frontend/src/features/video-review/exact-frame-canvas.tsx`; this changes overlay visibility only and does not touch persisted annotation data.
- Extended `frontend/src/app/live-review-app.test.tsx` with targeted live-review coverage for landing-frame jumps, keyboard shortcuts, and mask-opacity behavior. Updated `frontend/src/features/video-review/exact-frame-canvas.stories.tsx` for the new required prop.
- Browser smoke on a fresh `backend:dev:e2e` stack needed one seeded object plus two keyframes through the real backend API because clean e2e manifests start empty and would otherwise leave jump controls disabled.

## Wrap-Up Phase

### Verification

- Commands run:
  - `npm --workspace frontend run test -- src/app/live-review-app.test.tsx`
  - `npm run lint`
  - `npm run typecheck`
  - `npm run test`
  - `npm run backend:dev:e2e`
  - `npm run frontend:dev:e2e`
  - one-off `node --input-type=module` Playwright smoke against `http://127.0.0.1:5173/?app=live-review`
- Results:
  - Targeted live-review test file passed with `7` tests green.
  - Repo quality gates passed: `npm run lint`, `npm run typecheck`, and `npm run test` finished green, with repo test totals at `14` backend tests and `33` frontend tests passing.
  - Browser smoke passed after seeding one real object plus keyframes on frames `7` and `18`, then verifying auto-land on frame `7`, manifest jump buttons, `g` focus, arrow-key stepping, and local mask-opacity slider state. Screenshot saved to `/tmp/us-016-review-navigation-controls.png`.

### Final Summary

Shipped the remaining live-review ergonomics controls for milestone `m-2` without changing backend contracts. The live review surface now auto-loads a useful canonical frame, exposes explicit annotated-frame and keyframe jump buttons, supports paused-only keyboard shortcuts for routine review movement, and lets the operator tune selected-mask overlay opacity locally. Coverage now includes those workflows in live-review frontend integration tests, architecture docs record the canonical control behavior, and fresh browser smoke on the real local stack confirmed the live workflow with seeded manifest data.

### Completion Gate

- [x] Acceptance Criteria checkboxes updated to match reality
- [x] Definition of Done checkboxes updated to match reality
- [x] Only now may `status` change to `done`
