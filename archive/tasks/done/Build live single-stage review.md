---
id: task-build-live-single-stage-review
title: Build live single-stage review
status: done
completed: 2026-04-21
steps:
- creation
- planning
- execution
- wrap_up
tags:
- task
- frontend
- review
- workspace
- live
permalink: video-annotator/tasks/build-live-single-stage-review
---

## Creation Phase

### Description

Replace the split playback-plus-exact-frame live harness with one single-stage live review surface that matches `[[Frontend Interaction Spec]]` while keeping backend frame truth canonical. Reuse current workspace state and shell chrome where they help, but do not keep growing the old two-pane layout.

### Scope

- In scope: live review layout, stage overlays, object rail, bottom transport or timeline region, inspector placement, and migration of existing exact-frame or manual-box or SAM2 actions into that layout
- Out of scope: brand-new export features, new backend summary contracts outside the review surface needs, or fixture-only shell tweaks

### Affected Features

- [[Review Workspace Ergonomics]]
- [[Video Ingest and Exact-Frame Review]]
- [[Annotation Foundation and Manual Box Workflow]]
- [[SAM2 Shell and Runtime]]

### Acceptance Criteria

- [x] Live review path no longer renders separate playback and exact-frame panes as primary UX
- [x] Single-stage review surface keeps canonical frame loading and paused-only mutating actions intact
- [x] Existing live manual-box and SAM2 interactions remain reachable from the new layout
- [x] Frontend integration and browser proof cover the live single-stage review surface

### Test Intent

- Backend: reuse existing live routes; no new backend-only proof unless layout work forces contract changes
- Frontend: prove live review renders one review surface and keeps real workspace actions working
- Manual: browser-check live review flow on the real harness and record any blocked controls honestly

### Definition of Done

- [x] Relevant frontend tests pass
- [x] Browser verification recorded honestly
- [x] Memory updated if behavior changes
- [x] Supporting docs updated if layout or contract changes

## Planning Phase

### Planned Integration Tests

- Backend:
- none planned; this story reshapes existing live frontend behavior and should keep using current backend routes unless layout work exposes a contract gap
- Frontend:
  - extend `frontend/src/app/live-review-app.test.tsx` with one red workflow that opens a real indexed video and asserts live review now renders one review surface instead of separate playback or exact-frame panes, while exact-frame loading plus manual-box or SAM2 controls stay reachable
  - keep existing live manual-box and SAM2 workflow tests green so layout work proves no regression for draw, save, delete, run-SAM2, propagate, cancel, and reopen flows

### Planned E2E Tests

- Backend:
- none
- Frontend:
- no new automated browser E2E by default; manual browser smoke on real local stack should cover default library handoff into single-stage review plus one paused draw or SAM2 interaction

### Planned Implementation

- Step 1: add red integration proof in `live-review-app.test.tsx` for single-stage surface and absence of split-pane labels before touching production code
- Step 2: replace live-review split-pane markup in `frontend/src/app/live-review-app.tsx` with one stage-centered review surface that keeps left object rail, stage overlays, bottom transport area, and right inspector
- Step 3: track playback-active state in the live review surface so mutating exact-frame actions stay paused-only while playback remains contextual
- Step 4: update CSS in `frontend/src/app/app.css` only where the live review surface needs new single-stage layout treatment, without disturbing default shell host styles

### Feature Matrix Updates

- Feature note updates needed before or during execution:
- `[[Review Workspace Ergonomics]]` should replace the legacy split-pane gap text with single-stage review truth and cite the exact frontend or browser evidence
- supporting docs should update only if final layout or paused-action contract wording changes

## Execution Phase

### Implementation Notes

- Added a red frontend integration test in `frontend/src/app/live-review-app.test.tsx` that opens a live indexed video, asserts `Review surface` plus `Live review surface`, and proves the old `Playback pane` and `Exact-frame pane` labels are gone.
- Added a second frontend integration test that starts playback, confirms `Pause playback before mutating canonical frame data.`, and verifies `Run SAM2` stays disabled until playback pauses again.
- Reworked `frontend/src/app/live-review-app.tsx` into one stage-centered review surface with playback, paused exact-frame overlay, object rail, inspector controls, and frame transport in one workspace.
- Added explicit playback-pausing before exact-frame loads and frame jumps so backend frame truth stays canonical even while contextual playback remains visible.
- Updated `frontend/src/app/app.css` only where the new single-stage live review surface needed layout and status styling.

## Wrap-Up Phase

### Verification

- Commands run:
  - `npm --workspace frontend run test -- src/app/live-review-app.test.tsx`
  - `npm --workspace frontend exec -- prettier --write src/app/live-review-app.tsx src/app/live-review-app.test.tsx src/app/app.css`
  - `npm run lint`
  - `npm run typecheck`
  - `npm run test`
  - manual browser smoke on fresh `npm run backend:dev:e2e` plus `npm run frontend:dev:e2e`
- Results:
  - targeted live-review frontend tests passed with `4 passed`
  - repo lint passed
  - repo typecheck passed
  - repo test passed with backend `14 passed` and frontend `30 passed`
  - browser smoke confirmed real library handoff into the single-stage live review surface and saved `/tmp/us-015-live-single-stage-review.png`

### Final Summary

Replaced the live split-pane review harness with one single-stage review surface that keeps playback visible, overlays the canonical exact frame only while paused, and preserves live manual-box plus SAM2 actions from the same workspace. Verified with new focused frontend integration tests, full repo quality gates, and manual browser smoke on fresh local backend and frontend servers.

### Completion Gate

- [x] Acceptance Criteria checkboxes updated to match reality
- [x] Definition of Done checkboxes updated to match reality
- [x] Only now may `status` change to `done`
