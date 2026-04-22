---
id: task-testing-mask-editing-and-cleanup
title: Testing mask editing and cleanup
status: done
completed: 2026-04-21
steps:
- creation
- planning
- execution
- wrap_up
tags:
- task
- testing
- backend
- frontend
- masks
permalink: video-annotator/tasks/testing-mask-editing-and-cleanup
---

## Creation Phase

### Description

Own the test plan for manual mask correction and cleanup workflows. Start from `[[Mask Editing and Cleanup]]`, carefully re-think backend integration, frontend integration, and browser E2E with the testing notes, then keep blocked rows explicit until the feature exists.

### Scope

- In scope: blocked backend or frontend or manual scenarios for refine and cleanup, plus any current prerequisite mask reopen behavior worth freezing
- Out of scope: inventing refine APIs, brush UI, cleanup semantics, or pretending absent workflows already have runnable coverage

### Affected Features

- [[Mask Editing and Cleanup]]

### Testing Notes

- [[backend-api-integration-tests]]
- [[frontend-integration-tests]]
- [[e2e-tests]]

### Acceptance Criteria

- [x] Task note explicitly re-thinks backend integration vs frontend integration vs browser E2E with help from the testing notes before choosing coverage
- [x] Existing prerequisite mask-reopen behavior is covered where it already exists
- [x] Backend and frontend e2e planning is explicit: backend scenarios cover refine and cleanup semantics while frontend scenarios cover brush and cleanup interactions
- [x] Missing refine, brush, and cleanup workflows are represented as blocked backend and frontend scenarios with exact reasons instead of fake test files
- [x] When the feature begins to land, backend tests cover refine persistence and cleanup semantics while frontend tests cover brush and cleanup interactions
- [x] Manual frontend checks describe refine, brush, and cleanup workflows clearly enough for later execution and record results in `[[Mask Editing and Cleanup]]`
- [x] `[[Mask Editing and Cleanup]]` is updated with evidence links and honest execution status values

### Test Intent

- Backend: define future refine and cleanup verification around persistence and deletion semantics, while freezing only real prerequisite behavior today
- Frontend: define future brush and cleanup workflows from real correction tasks without creating placeholder green suites
- Manual: document later operator checks for refine or erase or delete-all behavior and record current blocked state honestly

### Definition of Done

- [x] Relevant backend tests pass
- [x] Relevant frontend tests pass
- [x] Feature note updated
- [x] Manual execution status recorded honestly
- [x] Docs or memory updated if behavior or contracts changed

## Planning Phase

### Planned Integration Tests

- Backend:
  - no new backend API integration file yet; first freeze only real prerequisite behavior that already exists
  - treat `backend/tests/api/test_sam2_shell_runtime.py` as current prerequisite evidence because it proves persisted prompt or propagation masks reopen through `GET /api/videos/{video_id}/annotations/frame/{frame_idx}` at real FastAPI boundary
  - keep future refine persistence and mask-cleanup semantics blocked until `POST /api/videos/{video_id}/sam2/refine-mask` plus mask-only delete routes exist
- Frontend:
  - no new frontend integration file yet; current live-review UI has no brush or cleanup controls to exercise honestly
  - treat `frontend/src/app/live-review-app.test.tsx` as current prerequisite evidence because it proves persisted SAM2 masks reopen in the live-review harness after reload
  - keep future brush add or erase and cleanup interactions blocked until paused-stage controls and request routes exist

### Planned E2E Tests

- Backend:
  - none planned today; browser adds no value before refine or cleanup backend contracts exist, so backend truth should stay in API integration once those routes land
- Frontend:
  - no automated browser E2E yet; later browser proof should cover refine brush edits plus one-frame and whole-object cleanup only after live-review UI exposes those workflows
  - manual browser scenarios still need to be written now with explicit blockers so future work can execute them without re-deriving scope

### Planned Implementation

- Step 1: verify current code and tests so note updates cite real prerequisite reopen behavior and exact missing contracts
- Step 2: update task and feature notes with concrete automated evidence, blocked refine or cleanup scenarios, and honest manual execution status
- Step 3: run targeted prerequisite tests plus repo quality commands, then close the task if notes and evidence match reality

### Feature Matrix Updates

- Feature note updates needed before or during execution:
  - replace placeholder integration, e2e, and manual-test rows in `[[Mask Editing and Cleanup]]`
  - record exact prerequisite evidence for persisted mask reopen
  - keep refine, brush, one-frame cleanup, and whole-object cleanup explicitly blocked with reasons instead of fake green suites

## Execution Phase

### Implementation Notes

- Session started on 2026-04-21 for Ralph US-010.
- Re-read `[[backend-api-integration-tests]]`, `[[frontend-integration-tests]]`, and `[[e2e-tests]]` before choosing coverage.
- Chosen test layers:
  - backend API integration remains future home for refine persistence and cleanup semantics because backend will own those routes and storage rules
  - frontend integration remains future home for brush and cleanup interactions because current value is visible paused-stage UI behavior with fake HTTP boundary
  - browser E2E is not justified today because refine and cleanup workflows do not exist in product code yet
- Existing prerequisite coverage already present:
  - `backend/tests/api/test_sam2_shell_runtime.py` proves persisted SAM2 masks reopen through frame-annotation reads
  - `frontend/src/app/live-review-app.test.tsx` proves live-review harness reopens persisted SAM2 mask overlays after reload
  - `frontend/src/app/live-review-app.test.tsx` also proves `Delete saved box` removes whole manual annotation rows, which is related context but must not be confused with mask-only cleanup
- Planned work for this task is note truth and verification only unless current evidence proves inconsistent with code.
- No production code or new automated tests were added because refine, brush, and cleanup workflows are still absent; honest feature-note truth is the shipped outcome for this story.

## Wrap-Up Phase

### Verification

- Commands run:
- `uv run --project backend pytest backend/tests/api/test_sam2_shell_runtime.py -q`
- `npm --workspace frontend run test -- src/app/live-review-app.test.tsx`
- `npm run lint`
- `npm run typecheck`
- `npm run test`
- `git diff --check`
- Results:
- targeted backend prerequisite reopen tests passed: `2 passed`
- targeted frontend live-review test file passed: `3 passed`
- repo `lint` passed
- repo `typecheck` passed
- repo `test` passed with backend `12 passed` and frontend `27 passed`
- `git diff --check` passed
- manual browser execution was not run because current app still lacks refine and cleanup workflows; blocked manual rows in `[[Mask Editing and Cleanup]]` are the honest status

### Final Summary

Updated `[[Mask Editing and Cleanup]]` from placeholder test tables to real prerequisite evidence plus blocked refine or brush or cleanup scenarios, then verified those claims against existing backend and frontend tests and repo-wide quality commands.

### Completion Gate

- [x] Acceptance Criteria checkboxes updated to match reality
- [x] Definition of Done checkboxes updated to match reality
- [x] Only now may `status` change to `done`
