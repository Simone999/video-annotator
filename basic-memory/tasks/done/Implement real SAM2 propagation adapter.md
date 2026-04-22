---
title: Implement real SAM2 propagation adapter
type: note
permalink: video-annotator/tasks/implement-real-sam2-propagation-adapter
id: task-implement-real-sam2-propagation-adapter
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
- runtime
---

# Implement real SAM2 propagation adapter

## Creation Phase

### Description

Replace placeholder propagation entry with real runtime adapter behavior while keeping the current SAM2 service boundary small and explicit.

Read first:
- [[Workflow]]
- [[SAM2 Shell and Runtime]]
- [[API]]
- `docs/spec.md`
- `backend/app/services/sam2.py`
- `backend/app/api/videos.py`
- `backend/tests/integration/api/test_sam2_shell_runtime.py`

Stage-2 rule: in planning phase, write concrete test plan and implementation plan first. In execution, follow written plan. Before `done`, run own review plus 2 subagent reviews and fix actionable findings.

### Scope

- In scope: propagation runtime boundary, request or response mapping, runtime setup, and missing-runtime failure states
- Out of scope: job persistence, progress polling, cancel handling, or frontend UI work

### Affected Features

- [[SAM2 Shell and Runtime]]

### Acceptance Criteria

- [x] Propagation entry stops raising placeholder `NotImplementedError` on configured real runtime
- [x] Adapter stays isolated behind current SAM2 service boundary
- [x] Runtime setup and missing-runtime failure states are explicit and testable

### Test Intent

- Backend: add focused coverage for propagation adapter boundary and missing-runtime failure path
- Frontend: none
- Manual: none in this slice unless local runtime setup is needed to confirm adapter handshake

### Definition of Done

- [x] Planning phase records concrete tests and implementation plan before code
- [x] Own review plus 2 subagent reviews are recorded and actionable findings are fixed
- [x] Relevant tests and quality checks pass
- [x] Feature notes, task note, and routing indexes are updated honestly when truth changes

## Planning Phase
### Planned Integration Tests
- Add one FastAPI integration test in `backend/tests/integration/api/test_sam2_shell_runtime.py` that uses default `Sam2Service()` plus a fake loaded predictor. Flow: create session, prompt one object, start propagation job, wait for completion, reopen one propagated frame. Verify persisted masks come from real `propagate_in_video(...)` output instead of fake adapter wiring.
- Add one FastAPI integration test for missing runtime config on propagation. Flow: create session, prompt request succeeds only when runtime exists; propagation job started with default `Sam2Service()` and missing env must finish `failed` with explicit runtime-config message instead of placeholder `NotImplementedError`.

### Planned E2E Tests
- None in this slice. Story is backend-only adapter work and local real-runtime browser proof stays blocked until later runtime-integration story wires full job truth through current review flow.

### Planned Implementation
- Extend `backend/app/services/sam2.py` predictor protocol with `propagate_in_video(...)`.
- Replace `Sam2Service.propagate()` placeholder with real runtime mapping:
  - reuse or lazily initialize predictor and per-session inference state
  - map `forward` to one `propagate_in_video(..., start_frame_idx, reverse=False, max_frame_num_to_track=delta?)`
  - map `backward` to one reverse call
  - map `both` to forward pass first, then backward pass, while preserving current target-frame order expected by `_resolve_target_frame_indices`
  - convert returned mask logits into `Sam2PropagationFrameResult` PNG payloads for requested object ids only
- Keep runtime errors explicit by reusing existing loader and session exceptions instead of route-local placeholder behavior.
- Update focused service and route tests first, then minimal implementation until they pass.

### Feature Matrix Updates
- Update `[[SAM2 Shell and Runtime]]` current-state and manual-test blocker text if default propagation adapter stops being placeholder-only.
- Update this task note execution and wrap-up truth after verification.

## Execution Phase

### Implementation Notes

- Added real propagation support to `backend/app/services/sam2.py` by extending the predictor protocol with `propagate_in_video(...)` and replacing the placeholder `Sam2Service.propagate()` path.
- Kept propagation inside the existing service seam: lazy predictor load, per-session runtime state reuse, shared PNG encoding helpers, and requested-object filtering all stay behind `Sam2Service`.
- Mapped app directions onto official SAM2 runtime calls while preserving current `_resolve_target_frame_indices` behavior, including `both`-direction forward/backward ordering and the `end == start` edge case.
- Added focused backend coverage for:
  - service-level propagation success and object filtering
  - `both`-direction mapping with backward-only, forward-limited, and open-ended variants
  - invalid runtime-call mapping and missing-runtime setup errors
  - FastAPI propagation persistence through default `Sam2Service`
  - failed job status when propagation runtime config is missing

- Own review:
  - caught one contract drift where `both` plus forward boundary did not match `_resolve_target_frame_indices`; fixed with regression coverage
- Subagent review 1:
  - found task/index/router drift in task note, task indexes, and repo current-state note
  - fixed by updating this task note, task routing indexes, and `[[Repo Current State and Feature Matrix]]`
- Subagent review 2:
  - flagged three areas
  - fixed actionable `both` + `end == start` runtime-call drift with a new regression test
  - kept runtime-lock scope unchanged for this slice because current singleton runtime is intentionally serialized behind one shared service seam
  - kept requested-object filtering unchanged because current job layer already treats non-requested runtime objects as ignorable shell noise and existing tests lock that behavior

## Wrap-Up Phase

### Verification

- Commands run:
  - `uv run --project backend pytest backend/tests/unit/services/test_sam2.py -k "propagate_uses_runtime or propagate_maps_both_mode or propagate_rejects_missing_runtime_configuration" -q`
  - `uv run --project backend pytest backend/tests/integration/api/test_sam2_shell_runtime.py -k "real_service_runtime_loader_and_persists_png or propagation_job_marks_failed_when_runtime_missing" -q`
  - `uv run --project backend pytest backend/tests/unit/services/test_sam2.py -k "forward_limit_when_end_is_ahead" -q`
  - `uv run --project backend pytest backend/tests/unit/services/test_sam2.py -k "backward_only_when_end_matches_start" -q`
  - `npm run lint`
  - `npm run typecheck`
  - `npm run test`
- Results:
  - targeted red-green checks proved both review-found edge cases before final helper fixes
  - repo lint passed
  - repo typecheck passed
  - repo test suite passed
  - backend coverage gate passed at `92.48%` branch coverage and `98.28%` statement coverage
  - frontend Vitest suite passed with `125` tests green and `90.14%` branch coverage
  - no manual local-runtime browser proof was run in this slice; honest blocker is environment/runtime verification, not missing adapter code

### Final Summary

- Default `Sam2Service.propagate()` now uses real SAM2 runtime calls instead of placeholder failure, while staying behind the current backend service boundary.
- Propagation now reuses lazy predictor/session state, persists reopened PNG masks through the current job shell, and reports missing-runtime setup failures through explicit failed-job status.
- Feature notes, AGENTS guidance, task routing, repo current-state routing, and Ralph tracking were updated to match shipped propagation-adapter truth.

### Completion Gate

- [x] Acceptance Criteria checkboxes updated to match reality
- [x] Definition of Done checkboxes updated to match reality
- [x] Only now may `status` change to `done`
