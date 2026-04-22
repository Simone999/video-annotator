---
title: Integrate prompt runtime persistence
type: note
permalink: video-annotator/tasks/integrate-prompt-runtime-persistence
id: task-integrate-prompt-runtime-persistence
status: done
completed: 2026-04-22 08:49:06 CEST
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
- api
---

# Integrate prompt runtime persistence

## Creation Phase

### Description

Persist real prompt runtime results through current routes, mask storage, confidence plumbing, and error handling.

Read first:
- [[Workflow]]
- [[SAM2 Shell and Runtime]]
- [[API]]
- [[Data Model]]
- `docs/spec.md`
- `backend/app/api/videos.py`
- `backend/app/services/sam2.py`
- `backend/app/services/frame_annotations.py`
- `backend/tests/integration/api/test_sam2_shell_runtime.py`

Stage-2 rule: in planning phase, write concrete test plan and implementation plan first. In execution, follow written plan. Before `done`, run own review plus 2 subagent reviews and fix actionable findings.

### Scope

- In scope: route integration, mask persistence, confidence persistence, and backend error mapping for prompt results
- Out of scope: propagation runtime or frontend UI work

### Affected Features

- [[SAM2 Shell and Runtime]]

### Acceptance Criteria

- [x] Real prompt results persist through existing frame-annotation storage path
- [x] Prompt route returns real runtime result shape with honest confidence values
- [x] Runtime failures surface through stable API errors instead of placeholder crashes

### Test Intent

- Backend: integration coverage for persisted prompt results and failure mapping
- Frontend: none
- Manual: none in this slice

### Definition of Done

- [x] Planning phase records concrete tests and implementation plan before code
- [x] Own review plus 2 subagent reviews are recorded and actionable findings are fixed
- [x] Relevant tests and quality checks pass
- [x] Feature notes, task note, and routing indexes are updated honestly when truth changes

## Planning Phase

### Planned Integration Tests

- Extend `backend/tests/integration/api/test_sam2_shell_runtime.py` so `POST /api/videos/{video_id}/sam2/prompt-box` must return persisted `mask_confidence` in the immediate response, not only after frame reload.
- Keep existing missing-runtime prompt route coverage green so explicit `503` mapping stays locked while prompt response shape changes.

### Planned E2E Tests

- None in this slice. Story is backend-only route and persistence plumbing.

### Planned Implementation

- Extend prompt response schema in `backend/app/schemas/sam2.py` so same-frame prompt responses can carry nullable `mask_confidence`.
- Update `backend/app/api/videos.py` prompt serialization to return stored confidence from existing persisted annotation result without changing runtime failure mapping.
- Update focused backend route coverage in `backend/tests/unit/api/test_videos_routes.py` to lock immediate prompt serialization with honest nullable confidence.

### Feature Matrix Updates

- If prompt response starts surfacing confidence immediately, update `[[SAM2 Shell and Runtime]]` and API docs so shipped contract no longer implies reload-only confidence visibility.

## Execution Phase

### Implementation Notes

- Working hypothesis before red test: prompt persistence and runtime error mapping already ship, but immediate prompt response still omits nullable `mask_confidence` even though stored annotation and reload paths already keep it.
- Red step: extended `backend/tests/integration/api/test_sam2_shell_runtime.py` so fake-adapter prompt route must return immediate `mask_confidence`, and watched that test fail because route payload dropped the field.
- Green step: extended `backend/app/schemas/sam2.py` and `backend/app/api/videos.py` so prompt response now includes stored nullable `mask_confidence` directly from persisted annotation truth.
- Tightened route coverage in `backend/tests/unit/api/test_videos_routes.py` for honest `null` confidence serialization, then added real-runtime integration assertion so both numeric and `null` prompt response cases stay locked.
- Updated `docs/engineering/api.md`, `[[SAM2 Shell and Runtime]]`, task routing indexes, and repo guidance so immediate prompt confidence is documented as shipped truth.
- Own review:
  - checked route contract drift, task routing, docs sync, and final diff after full quality pass
- Subagent review 1:
  - no findings
  - one low-risk suggestion asked for real-runtime immediate-response assertion; added that assertion and reran focused backend tests
- Subagent review 2:
  - no findings
  - confirmed task routing, feature truth, and Ralph files were still honest before wrap-up

## Wrap-Up Phase

### Verification

- Commands run:
- `uv run --project backend pytest backend/tests/integration/api/test_sam2_shell_runtime.py::test_sam2_routes_create_reuse_close_prompt_propagate_and_reopen_masks -q`
- `uv run --project backend pytest backend/tests/unit/api/test_videos_routes.py backend/tests/integration/api/test_sam2_shell_runtime.py -q`
- `git diff --check`
- `npm run test`
- `npm run lint`
- `npm run typecheck`
- Results:
- Red step failed first as expected because prompt response omitted `annotation.mask_confidence`.
- Focused backend route and integration suite passed after implementation: `9 passed`.
- `git diff --check` passed.
- `npm run test` passed on final tree: backend `103 passed` with backend coverage gate `91.91%` branches, frontend `125 passed` with `90.14%` branch coverage.
- `npm run lint` passed.
- `npm run typecheck` passed.

### Final Summary

- Prompt route now returns immediate nullable `mask_confidence` from persisted annotation truth instead of forcing reviewers or clients to reload frame state to see confidence.
- Existing prompt persistence path and explicit `503` runtime-failure mapping stayed unchanged and covered.
- Docs, feature note, AGENTS guidance, and task routing now match shipped prompt confidence contract.

### Completion Gate

- [x] Acceptance Criteria checkboxes updated to match reality
- [x] Definition of Done checkboxes updated to match reality
- [x] Only now may `status` change to `done`
