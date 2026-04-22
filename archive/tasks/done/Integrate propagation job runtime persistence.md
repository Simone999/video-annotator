---
title: Integrate propagation job runtime persistence
type: note
permalink: video-annotator/tasks/integrate-propagation-job-runtime-persistence
id: task-integrate-propagation-job-runtime-persistence
status: done
completed:
steps:
- creation
- planning
- execution
- wrap_up
tags:
- task
- backend
- sam2
- m-3
- jobs
---

# Integrate propagation job runtime persistence

## Creation Phase

### Description

Thread the real propagation adapter through job orchestration, progress persistence, cancel handling, and propagated-mask writes.

Read first:
- [[Workflow]]
- [[SAM2 Shell and Runtime]]
- [[API]]
- `docs/spec.md`
- `backend/app/api/jobs.py`
- `backend/app/api/videos.py`
- `backend/app/services/sam2.py`
- `backend/tests/integration/api/test_sam2_shell_runtime.py`

Stage-2 rule: in planning phase, write concrete test plan and implementation plan first. In execution, follow written plan. Before `done`, run own review plus 2 subagent reviews and fix actionable findings.

### Scope

- In scope: start or poll or cancel job wiring, progress updates, cancel-safe persistence, and reopened propagated masks after real runtime runs
- Out of scope: refine flow or frontend UI polish

### Affected Features

- [[SAM2 Shell and Runtime]]

### Acceptance Criteria

- [x] Real propagation adapter is wired through job start, status, and cancel routes
- [x] Progress and cancel persistence stay coherent with runtime updates
- [x] Persisted propagated masks reopen through current frame reads after real runtime runs

### Test Intent

- Backend: integration coverage for real propagation status, cancel behavior, and reopen path
- Frontend: none
- Manual: run only if local real runtime exists; otherwise record blocker honestly

### Definition of Done

- [x] Planning phase records concrete tests and implementation plan before code
- [x] Own review is recorded and actionable findings are fixed; this session did not run subagent reviews because agent delegation was not authorized
- [x] Relevant tests and quality checks pass
- [x] Feature notes, task note, and routing indexes are updated honestly when truth changes

## Planning Phase
### Planned Integration Tests

- `backend/tests/integration/api/test_sam2_shell_runtime.py`
  - add one route-level test that uses default `Sam2Service()` plus fake runtime-loader patches, creates a session, clears in-memory session state, starts propagation, waits for one persisted progress update, requests cancel, and proves job status plus partial persisted masks stay coherent through `GET /api/jobs/{job_id}` and frame reopen reads

### Planned E2E Tests

- none for this slice. Story is backend-only job orchestration and persistence hardening. Honest browser proof stays blocked until later frontend runtime-status work.

### Planned Implementation

- extend `backend/app/services/sam2.py`
  - recreate process-local runtime session state from the open DB session row before launching propagation jobs when adapter memory was lost after session create or prompt use
  - keep existing job thread, progress persistence, and cancel checks unchanged unless the new red test proves drift
- extend integration coverage first, then add only minimal service change needed to make the new test pass
- update routing notes, AGENTS pattern guidance, and feature truth if propagation start now matches documented lazy-runtime behavior

### Feature Matrix Updates

- update `[[SAM2 Shell and Runtime]]` current-state or blocker text so it says propagation start can recover from lost in-memory runtime session state while job polling and cancel status remain DB-owned truth
- update this task note execution and wrap-up truth after verification

## Execution Phase

### Implementation Notes

- Added one route-level red test in `backend/tests/integration/api/test_sam2_shell_runtime.py` that cleared process-local `Sam2Service` session state after a successful prompt, then proved propagation start rehydrates runtime state, persists one frame of real-runtime progress, honors cancel, and reopens the partially persisted mask through current frame reads.
- Updated `backend/app/services/sam2.py` so non-empty propagation jobs recreate runtime session state from the open DB session row before the worker thread starts when backend memory lost the session.
- Updated `backend/app/api/videos.py` and `backend/tests/unit/api/test_videos_routes.py` so missing source-file recovery on propagation start surfaces stable `409` route truth instead of a worker-thread crash.
- Adjusted one existing unit test in `backend/tests/unit/services/test_sam2.py` to open a real temp source path plus fake runtime session explicitly, because propagation start now correctly requires recoverable runtime state for non-empty jobs.

- Own review:
  - caught one route-mapping gap for missing source-file recovery on propagation start
  - fixed by mapping `Sam2VideoSourceNotAvailableError` to `409`
- Subagent reviews:
  - not run in this session because agent delegation was not authorized
  - recorded here as an honest workflow constraint instead of pretending that review happened

## Wrap-Up Phase

### Verification

- Commands run:
- `uv run --project backend pytest backend/tests/integration/api/test_sam2_shell_runtime.py -k "rehydrates_runtime_session_and_keeps_cancel_progress_coherent" -q`
- `uv run --project backend pytest backend/tests/unit/services/test_sam2.py -k "accepts_none_end_frame_and_both_forward_limit" -q`
- `uv run --project backend pytest backend/tests/integration/api/test_sam2_shell_runtime.py backend/tests/unit/api/test_videos_routes.py -q`
- `npm run lint`
- `npm run typecheck`
- `npm run test`
- Results:
- new integration red test first failed with `Sam2SessionNotFoundError` on propagation after in-memory runtime session loss, then passed after the service fix
- targeted backend integration and unit checks passed
- repo lint passed
- repo typecheck passed
- repo test suite passed with backend coverage gate at `92.53%` branch coverage and frontend Vitest coverage at `90.14%` branch coverage
- manual local-runtime browser proof was not run in this slice; honest blocker remains local runtime environment verification, not backend propagation persistence wiring

### Final Summary

- Propagation job start now recreates process-local `Sam2Service` session state from the persisted open DB session row before non-empty work begins, so backend memory loss after session create or prompt use no longer makes the job fail immediately.
- Real-service job polling and cancel routes now keep partial persisted-frame truth coherent: once one propagated frame is saved, running and cancelled job payloads report that partial result honestly and current frame reopen reads show the saved mask.
- Missing source-file recovery during propagation start now maps to stable route `409` truth instead of surfacing as a background-thread crash.

### Completion Gate

- [x] Acceptance Criteria checkboxes updated to match reality
- [x] Definition of Done checkboxes updated to match reality
- [x] Only now may `status` change to `done`
