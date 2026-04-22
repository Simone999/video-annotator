---
title: Implement real SAM2 prompt adapter
type: note
permalink: video-annotator/tasks/implement-real-sam2-prompt-adapter
id: task-implement-real-sam2-prompt-adapter
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

# Implement real SAM2 prompt adapter

## Creation Phase

### Description

Replace placeholder prompt-box path with real adapter behavior behind existing SAM2 service boundary.

Read first:
- [[Workflow]]
- [[SAM2 Shell and Runtime]]
- [[SAM2 Integration]]
- `docs/spec.md`
- `backend/app/services/sam2.py`
- `backend/app/schemas/sam2.py`
- `backend/tests/integration/api/test_sam2_shell_runtime.py`

Stage-2 rule: in planning phase, write concrete test plan and implementation plan first. In execution, follow written plan. Before `done`, run own review plus 2 subagent reviews and fix actionable findings.

### Scope

- In scope: runtime adapter implementation for same-frame prompt-box only, with clear dependency and config handling behind service seam
- Out of scope: propagation runtime, refine flow, or frontend wiring

### Affected Features

- [[SAM2 Shell and Runtime]]

### Acceptance Criteria

- [x] Prompt-box path stops raising placeholder `NotImplementedError` on configured real runtime
- [x] Adapter stays isolated behind current SAM2 service boundary
- [x] Runtime setup and missing-runtime failure states are explicit and testable

### Test Intent

- Backend: add focused adapter and route tests for real prompt path and failure states
- Frontend: none
- Manual: run only if local real runtime is available; otherwise record blocker honestly

### Definition of Done

- [x] Planning phase records concrete tests and implementation plan before code
- [x] Own review plus 2 subagent reviews are recorded and actionable findings are fixed
- [x] Relevant tests and quality checks pass
- [x] Feature notes, task note, and routing indexes are updated honestly when truth changes

## Planning Phase

### Planned Integration Tests

- `backend/tests/integration/api/test_sam2_shell_runtime.py`
  - add one route-level test that uses real `Sam2Service` runtime-loader fakes, proves configured prompt path persists same-frame mask without fake service override, and checks stored mask bytes plus `source = "sam2"`
  - add one route-level test that leaves runtime missing and proves `POST /api/videos/{video_id}/sam2/prompt-box` fails with explicit service-unavailable error instead of placeholder `NotImplementedError`

### Planned E2E Tests

- none for this slice. Story is backend-only adapter seam. Honest browser or manual runtime check stays optional and blocked unless local SAM2 model files are available.

### Planned Implementation

- extend `backend/app/services/sam2.py`
  - replace placeholder prompt path with lazy real-runtime session state
  - add explicit runtime config, dependency, and setup errors
  - keep predictor isolated behind current `Sam2Service`
  - reuse one predictor instance with locked prompt execution
- extend `backend/app/api/videos.py`
  - map new prompt runtime-unavailable error to stable HTTP failure
- extend unit coverage
  - `backend/tests/unit/services/test_sam2.py` for runtime loader, lazy prompt execution, and explicit missing-runtime error
  - `backend/tests/unit/api/test_videos_routes.py` for new HTTP mapping
- keep propagation placeholder untouched for later task

### Feature Matrix Updates

- if prompt real-runtime path lands, update `[[SAM2 Shell and Runtime]]` so current state says prompt runtime is real-capable while propagation still stays placeholder
- update task routing indexes when note status changes

## Execution Phase

### Implementation Notes

- Replaced placeholder prompt path in `backend/app/services/sam2.py` with lazy real-runtime loading behind existing `Sam2Service`.
- Added explicit runtime setup errors for missing env config, checkpoint, optional deps, invalid device requests, empty masks, and broken predictor load.
- Kept `POST /sam2/session` lightweight. Prompt route now rehydrates process-local runtime state from open DB session rows if backend memory was lost.
- Left propagation placeholder untouched for later task.
- Added focused backend unit and integration coverage for:
  - lazy prompt runtime success
  - runtime-missing `503`
  - loader dependency/setup failures
  - prompt-state rehydrate after process-local loss
  - coverage-gate branches in runtime helpers

- Own review:
  - checked service boundary, route mapping, docs drift, and full quality evidence after green tests
- Subagent review 1:
  - found missing runtime-state rehydrate for open DB sessions after process-local loss
  - fixed by recreating runtime session state inside `prompt_sam2_box()` when DB session is open but in-memory state is absent
- Subagent review 2:
  - found integration success test bypassed default loader path
  - fixed by patching module-level `_load_real_sam2_predictor` in integration test and exercising default loader path plus prompt rehydrate path

## Wrap-Up Phase

### Verification

- Commands run:
  - `uv run --project backend pytest backend/tests/unit/services/test_sam2.py -q`
  - `uv run --project backend pytest backend/tests/unit/api/test_videos_routes.py -q`
  - `uv run --project backend pytest backend/tests/integration/api/test_sam2_shell_runtime.py -q`
  - `npm run lint`
  - `npm run typecheck`
  - `npm run test`
- Results:
  - focused backend SAM2 unit, route, and integration files passed
  - repo lint passed
  - repo typecheck passed
  - repo test suite passed, including backend coverage gate at `91.91%` branch coverage and frontend Vitest coverage at `90.14%` branch coverage
  - manual local-runtime execution not run; honest blocker is later propagation runtime still placeholder, so full prompt-plus-propagation manual proof remains out of scope for this slice

### Final Summary

- Prompt runtime now loads real SAM2 predictor state lazily from env-configured assets, persists real prompt PNG masks, and returns explicit `503` setup failures instead of placeholder crashes.
- Prompt route now recovers from lost process-local runtime state when DB session row is still open, so restart-like gaps do not force a new session create before the next prompt.
- Docs, feature note, AGENTS pattern guidance, and task routing were updated to match shipped prompt-runtime truth.

### Completion Gate

- [x] Acceptance Criteria checkboxes updated to match reality
- [x] Definition of Done checkboxes updated to match reality
- [x] Only now may `status` change to `done`
