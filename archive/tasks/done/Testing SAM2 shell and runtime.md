---
id: task-testing-sam2-shell-and-runtime
title: Testing SAM2 shell and runtime
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
- sam2
permalink: video-annotator/tasks/testing-sam2-shell-and-runtime
---

## Creation Phase

### Description

Add durable test coverage for the shipped SAM2 shell and make the live-runtime gap explicit. Start from `[[SAM2 Shell and Runtime]]`, carefully re-think backend integration, frontend integration, and browser E2E with the testing notes, then update the feature note with hard evidence instead of implied capability.

### Scope

- In scope: shell-session lifecycle, prompt-box, propagation, poll, cancel, reopen coverage, honest runtime-gap recording, and feature-note evidence updates
- Out of scope: pretending real SAM2 inference is trusted when adapter support is missing, adding missing refine flows, or hiding GPU or model blockers behind fake green tests

### Affected Features

- [[SAM2 Shell and Runtime]]

### Testing Notes

- [[backend-api-integration-tests]]
- [[frontend-integration-tests]]
- [[e2e-tests]]

### Acceptance Criteria

- [x] Task note explicitly re-thinks backend integration vs frontend integration vs browser E2E with help from the testing notes before choosing coverage
- [x] Backend integration covers session lifecycle, prompt-box persistence, propagation jobs, polling, cancellation, close or reopen session flow, and reopened persisted masks
- [x] Frontend integration covers run-SAM2, progress polling, cancel, and reopened persisted masks in the live-review harness
- [x] Live-runtime scenarios are separated from fake-adapter shell scenarios so notes and evidence show what is truly trusted today
- [x] Manual real-runtime execution status is recorded honestly with exact blocker instead of fake green proof
- [x] `[[SAM2 Shell and Runtime]]` is updated with evidence links and honest execution status values

### Test Intent

- Backend: prove shell contracts around session lifecycle, prompt persistence, propagation jobs, polling, cancellation, and reopened masks work with today’s adapter boundaries
- Frontend: prove current SAM2 controls can start, monitor, cancel, and reopen work without overstating real runtime trust
- Manual: verify real local runtime behavior, long-running job handling, and GPU or model failure UX when environment support exists

### Definition of Done

- [x] Relevant backend tests pass
- [x] Relevant frontend tests pass
- [x] Feature note updated
- [x] Manual execution status recorded honestly
- [x] Docs or memory updated if behavior or contracts changed

## Planning Phase

### Planned Integration Tests

- Backend: add `backend/tests/api/test_sam2_shell_runtime.py` to prove fake-adapter shell contracts at real FastAPI boundary. Cover session create or reuse, prompt-box persistence, propagation job status reads, cancellation requests, closed-session reopen, and reopened persisted SAM2 mask reads after propagation.
- Frontend: extend `frontend/src/app/live-review-app.test.tsx` with one live-review harness story that creates object, loads exact frame, runs SAM2 through mocked HTTP only, observes propagation polling and cancel affordances, reloads frame, and proves reopened persisted mask overlay shows while runtime trust stays fake-adapter only.

### Planned E2E Tests

- Backend: none. Browser stack adds little value for current shell-only runtime trust because backend-owned persistence and job semantics fit API integration better.
- Frontend: no new default E2E. Real browser proof belongs to later runtime story once adapter is not placeholder `NotImplemented`; this task records that gap instead of adding fake-green browser coverage.

### Planned Implementation

- Step 1: inspect current SAM2 API, workspace, and live-review seams; write failing backend API integration tests first.
- Step 2: write failing frontend integration test for run, poll, cancel, and reopen shell workflow.
- Step 3: make minimal production or test-support fixes needed to satisfy those tests.
- Step 4: run targeted backend and frontend checks, then broader repo quality checks.
- Step 5: update `[[SAM2 Shell and Runtime]]` with shell-vs-runtime evidence and record manual runtime execution as blocked by current adapter state.

### Feature Matrix Updates

- Feature note updates needed before or during execution:
  - `[[SAM2 Shell and Runtime]]` must separate fake-adapter shell trust from real runtime trust and cite exact backend or frontend evidence after verification.

## Execution Phase

### Implementation Notes

- Session started on 2026-04-21 for Ralph US-009.
- Chosen test layers after re-reading `[[backend-api-integration-tests]]`, `[[frontend-integration-tests]]`, and `[[e2e-tests]]`:
  - backend API integration owns persisted session, prompt, propagation job, cancellation, and reopen truth
  - frontend integration owns visible live-review SAM2 controls with mocked HTTP boundary
  - browser E2E deferred because current adapter remains placeholder and fake browser green would overstate runtime trust
- Added `backend/tests/api/test_sam2_shell_runtime.py` for fake-adapter shell contracts at real FastAPI boundary.
- Added live-review harness SAM2 workflow coverage in `frontend/src/app/live-review-app.test.tsx`.
- No production SAM2 runtime logic changed; work adds durable proof and note truth only.

## Wrap-Up Phase

### Verification

- Commands run:
- `uv run --project backend pytest backend/tests/api/test_sam2_shell_runtime.py -q`
- `npm --workspace frontend run test -- src/app/live-review-app.test.tsx -t "runs SAM2, polls propagation, cancels job, and reopens persisted masks"`
- `npm run lint`
- `npm run typecheck`
- `npm run test`
- `git diff --check`
- Results:
- Targeted backend SAM2 API tests passed.
- Targeted frontend live-review SAM2 workflow test passed.
- `npm run lint` passed.
- `npm run typecheck` passed.
- `npm run test` passed with backend `12 passed` and frontend `27 passed`.
- `git diff --check` passed.
- Manual real-runtime execution was not run. Honest blocker: default adapter still raises `NotImplementedError` in `backend/app/services/sam2.py` for prompt and propagation.

### Final Summary

Added durable SAM2 shell proof at backend API and live-review frontend layers, then updated feature truth so fake-adapter shell coverage is explicit and real runtime remains blocked until adapter work lands.

### Completion Gate

- [x] Acceptance Criteria checkboxes updated to match reality
- [x] Definition of Done checkboxes updated to match reality
- [x] Only now may `status` change to `done`
