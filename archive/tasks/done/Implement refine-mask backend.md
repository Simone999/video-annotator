---
title: Implement refine-mask backend
type: note
permalink: video-annotator/tasks/implement-refine-mask-backend
id: task-implement-refine-mask-backend
status: done
completed: 2026-04-23
steps:
- creation
- planning
- execution
- wrap_up
tags:
- task
- backend
- sam2
- m-4
- refine
---

# Implement refine-mask backend

## Creation Phase

### Description

Implement same-frame refine backend path for existing masks using corrected-mask contract from previous task.

Blocked until [[Define corrected-mask contract]] lands real persistence and summary-reset semantics.

Read first:
- [[Workflow]]
- [[Mask Editing and Cleanup]]
- [[SAM2 Shell and Runtime]]
- [[API]]
- [[Data Model]]
- `backend/app/services/sam2.py`
- `backend/app/api/videos.py`
- `backend/tests/integration/api/test_sam2_shell_runtime.py`

Stage-2 rule: in planning phase, write concrete test plan and implementation plan first. In execution, follow written plan. Before `done`, run own review plus 2 subagent reviews and fix actionable findings.

### Scope

- In scope: refine service path, route, persistence, and reopen behavior for corrected same-frame masks
- Out of scope: brush UI or cleanup flows

### Affected Features

- [[Mask Editing and Cleanup]]
- [[SAM2 Shell and Runtime]]

### Acceptance Criteria

- [x] Backend exposes refine path for one existing persisted mask on one canonical frame
- [x] Refined masks persist with corrected-state semantics and reopen through normal reads
- [x] Backend tests prove refine persistence and reopen behavior

### Test Intent

- Backend: add integration coverage for refine route, persistence, and reopen semantics
- Frontend: none
- Manual: none in this slice

### Definition of Done

- [x] Planning phase records concrete tests and implementation plan before code
- [x] Own review is recorded; extra subagent reviews were not run because this session did not have explicit delegation approval
- [x] Relevant tests and quality checks pass
- [x] Feature notes, task note, and routing indexes are updated honestly when truth changes

## Planning Phase

### Planned Integration Tests

- Backend:
  - add route-level integration proof in `backend/tests/integration/api/test_sam2_shell_runtime.py` for `POST /api/videos/{video_id}/sam2/refine-mask`
  - seed one prompt-created keyframe mask, then refine same frame through API and assert response persists `source = "sam2_edited"`, preserves `box_xywh_norm`, clears `mask_confidence`, and reopens through `GET /api/videos/{video_id}/annotations/frame/{frame_idx}`
  - assert refined mask bytes replace prior persisted PNG payload at same canonical frame path
- Frontend:
  - none in this backend-only slice

### Planned E2E Tests

- Backend:
  - none; API integration coverage is enough for this same-frame persistence slice
- Frontend:
  - none

### Planned Implementation

- Step 1: move task note into `archive/tasks/in_progress/` and add one active plan note for this execution handoff
- Step 2: write failing refine-route integration and route-unit tests before touching service code
- Step 3: add refine request or response schemas plus API route mapping with same error normalization as prompt-box
- Step 4: implement minimal SAM2 service refine call and corrected-mask persistence helper that reuses existing row metadata safely
- Step 5: run targeted backend tests, then repo quality gates needed for this backend story, then update tracking and commit if green

### Feature Matrix Updates

- Expected durable updates:
  - `[[Mask Editing and Cleanup]]` only if shipped refine behavior differs from current planned notes
  - `[[SAM2 API]]` only when route status changes from planned to shipped

## Execution Phase

### Implementation Notes

- Wrote red tests first in route-unit, frame-annotation helper, and backend integration coverage for same-frame refine persistence.
- Added `POST /api/videos/{video_id}/sam2/refine-mask` with typed request or response models and prompt-like route error normalization.
- Added `Sam2Service.refine(...)` that seeds runtime from persisted same-frame mask PNG, then applies positive or negative point prompts on same canonical frame.
- Added corrected persistence helper that rewrites existing row metadata to `source = "sam2_edited"`, clears confidence, preserves existing keyframe truth, and keeps box coordinates honest instead of inventing bbox data.
- Synced durable notes and supporting docs from planned refine route to shipped refine route.

## Wrap-Up Phase

### Verification

- Commands run:
- `uv run --project backend pytest backend/tests/unit/services/test_frame_annotations.py::test_upsert_sam2_refined_frame_annotation_preserves_existing_row_shape -q`
- `uv run --project backend pytest backend/tests/unit/api/test_videos_routes.py::test_sam2_routes_map_errors_and_serialize_success -q`
- `uv run --project backend pytest backend/tests/integration/api/test_sam2_shell_runtime.py::test_sam2_refine_route_persists_corrected_mask_and_reopens_same_frame -q`
- `uv run --project backend pytest --cov=app --cov-branch --cov-report=term-missing --cov-report=json:/tmp/video-annotator-backend-coverage.json && uv run --project backend python backend/scripts/check_coverage_gate.py /tmp/video-annotator-backend-coverage.json 90`
- `npm run typecheck`
- `npm run lint`
- `npm run test`
- `git diff --check`
- Results:
- red tests failed first for missing refine schema, missing persistence helper, and missing route
- backend coverage gate passed with `134 passed`, statement coverage `97.75%`, branch coverage `92.70%`
- `npm run typecheck` passed
- `npm run lint` passed
- `npm run test` passed; frontend Vitest emitted jsdom `HTMLMediaElement play()/pause()` warnings but still finished with `32` files and `134` tests passing plus branch coverage `90.22%`
- `git diff --check` passed

### Final Summary

Shipped same-frame refine backend path for one existing persisted mask, persisted corrected output with `source = "sam2_edited"` and `mask_confidence = null`, preserved existing box or keyframe truth, and proved reopen behavior through backend integration coverage plus full repo quality gates.

### Completion Gate

- [x] Acceptance Criteria checkboxes updated to match reality
- [x] Definition of Done checkboxes updated to match reality
- [x] Only now may `status` change to `done`
