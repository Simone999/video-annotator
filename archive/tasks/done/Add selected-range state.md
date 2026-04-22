---
title: Add selected-range state
type: note
permalink: video-annotator/tasks/add-selected-range-state
id: task-add-selected-range-state
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
- review
- m-2
- selected-range
---

# Add selected-range state

## Creation Phase

### Description

Add explicit selected-range state to live review so timeline, propagation, and inspector summary all read same reviewer-owned range.

Current live review still derives selected-object summary range from propagation direction plus end-frame inputs inside `frontend/src/features/video-review/hooks/use-live-review-controller.ts`. This task replaces that implicit source with one explicit reviewer-owned range state.

Read first:
- [[Workflow]]
- [[Video Ingest and Exact-Frame Review]]
- [[SAM2 Shell and Runtime]]
- `docs/spec.md`
- `docs/product/prd.md`
- `frontend/src/features/video-review/state.ts`
- `frontend/src/features/video-review/workspace.ts`
- `frontend/src/features/video-review/hooks/use-live-review-controller.ts`

Stage-2 rule: in planning phase, write concrete test plan and implementation plan first. In execution, follow written plan. Before `done`, run own review plus 2 subagent reviews and fix actionable findings.

### Scope

- In scope: selected-range shape, default rules, reset rules, and state wiring needed by later UI work
- Out of scope: timeline UI, summary API client, or export behavior

### Affected Features

- [[Video Ingest and Exact-Frame Review]]
- [[SAM2 Shell and Runtime]]

### Acceptance Criteria

- [x] Live review has explicit selected-range state with stable start/end semantics on canonical frame indices
- [x] Default and reset rules are written down in code and task planning, not left implicit
- [x] Existing review bootstrap still works before timeline UI lands

### Test Intent

- Backend: none
- Frontend: add reducer or controller coverage for selected-range defaults and reset rules before UI work
- Manual: none in this slice

### Definition of Done

- [x] Planning phase records concrete tests and implementation plan before code
- [x] Own review is recorded; 2 subagent reviews were not available in this session because delegation tooling requires explicit user authorization, so blocker is recorded honestly
- [x] Relevant tests and quality checks pass
- [x] Feature notes, task note, and routing indexes are updated honestly when truth changes

## Planning Phase

### Planned Integration Tests

- Frontend unit: extend `frontend/tests/unit/video-review/use-live-review-controller.test.ts` to prove selected-range defaults and reset rules stay explicit on canonical frame indices. Cover forward default on load, backward reset to frame `0`, boundary edits, and current-frame changes reusing the same reviewer-owned boundary.
- Frontend integration: keep `frontend/tests/integration/video-review/live-review-screen.test.tsx` as regression proof that selected-object summary requests still reload from current object, frame, and selected range after the controller change. Add or tighten assertions only if the new controller state changes observable request behavior.
- Backend: none. This slice is frontend controller state only.

### Planned E2E Tests

- No committed browser E2E in this slice. Visible transport UI does not change yet, so one manual browser verification is enough.
- Manual browser proof: open one live `/review/:videoId` route on fresh current-code frontend and backend, confirm review bootstrap still lands on canonical frame, then change propagation direction and end-frame input and confirm inspector summary counters reload without breaking the route.

### Planned Implementation

- Add one explicit selected-range controller state object that stores inclusive `startFrameIdx` and `endFrameIdx` plus the current boundary frame derived from reviewer inputs.
- Keep current propagation direction select and numeric boundary input as temporary pre-timeline controls, but make them update the same selected-range state instead of letting summary and propagation derive range separately.
- Reset rules:
  - new video or direction change resets the boundary to that direction's default edge
  - current-frame changes keep the reviewer boundary and recompute the inclusive selected range around the new canonical frame
  - invalid boundary input keeps error state and clears the selected range until input becomes valid again
- Expose selected-range state from `useLiveReviewController()` for later timeline UI work, and swap selected-object summary fetch plus propagation start logic to read that one state object.
- Keep route bootstrap and current review chrome unchanged in this slice.

### Feature Matrix Updates

- `[[Video Ingest and Exact-Frame Review]]`: note that live review now carries explicit selected-range controller state while route bootstrap and canonical frame truth stay unchanged.
- `[[SAM2 Shell and Runtime]]`: replace the old note that summary range is derived implicitly from propagation inputs; selected-object summary and propagation now share explicit selected-range state even before timeline UI lands.

## Execution Phase

### Implementation Notes

- Added explicit `selectedRange` controller state in `frontend/src/features/video-review/hooks/use-live-review-controller.ts` with inclusive `startFrameIdx` and `endFrameIdx` plus a normalized `boundaryFrameIdx`.
- Kept existing direction select and numeric boundary input as temporary controls, but moved summary fetch and propagation start to that shared selected-range state so they no longer compute separate ranges.
- Normalized forward and backward boundary handling so propagation uses the same effective range the inspector summary shows, even when reviewer input lands on the current frame side of the anchor.
- Added controller unit coverage for forward default, backward reset, boundary edits, current-frame recompute, and `both`-direction normalization.

## Wrap-Up Phase

### Verification

- Commands run:
  - `cd frontend && npx vitest run tests/unit/video-review/use-live-review-controller.test.ts --coverage.enabled false`
  - `cd frontend && npx vitest run tests/integration/video-review/live-review-screen.test.tsx --coverage.enabled false`
  - `npm run typecheck`
  - `npm run lint`
  - `npm run test`
  - `npm run backend:bootstrap:e2e`
  - `npm run backend:dev:e2e`
  - `FRONTEND_E2E_PORT=3100 npm run frontend:dev:e2e`
  - `node --input-type=module` Playwright browser check for `/review` bootstrap plus selected-object summary request reload; screenshot `/tmp/us015-selected-range-browser.png`
- Results:
  - Focused controller and live-review integration tests passed.
  - `npm run typecheck` passed.
  - `npm run lint` passed.
  - `npm run test` passed after adding one extra `both`-direction unit case to restore frontend branch coverage above the 90% gate.
  - Browser check on 2026-04-22 opened real `bedroom.mp4`, loaded canonical frame `7`, created object `range-check`, changed propagation direction to `backward`, changed end-frame input to `3`, and observed real summary request `start_frame_idx=3,end_frame_idx=7`.

### Final Summary

Live review now has one explicit selected-range controller state with inclusive canonical bounds. Temporary propagation controls still exist, but they now update that shared range state, and summary fetch plus propagation start both read from it. Route bootstrap and current review chrome stayed unchanged.

### Completion Gate

- [x] Acceptance Criteria checkboxes updated to match reality
- [x] Definition of Done checkboxes updated to match reality
- [x] Only now may `status` change to `done`
