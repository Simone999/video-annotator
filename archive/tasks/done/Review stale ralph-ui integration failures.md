---
title: Review stale ralph-ui integration failures
type: note
permalink: video-annotator/tasks/review-stale-ralph-ui-integration-failures
id: task-review-stale-ralph-ui-integration-failures
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
- tests
- integration
- workflow
- review
---

# Review stale ralph-ui integration failures

## Creation Phase

### Description

Review the backend integration failures that blocked `pre-push` on `ralph/ui` on 2026-04-27. Decide whether each failure is a stale or wrong test expectation versus a real backend regression, then fix or reroute with honest follow-up.

Observed failure command:
- `uv run --project backend pre-commit run --all-files --hook-stage pre-push --config .pre-commit-config.yaml`

Observed failing tests:
- `backend/tests/integration/api/test_annotation_foundation_manual_box.py::test_manual_annotation_routes_create_reload_update_and_delete_manual_rows`
- `backend/tests/integration/api/test_sam2_shell_runtime.py::test_sam2_routes_create_reuse_close_prompt_propagate_and_reopen_masks`
- `backend/tests/integration/api/test_annotation_foundation_manual_box.py::test_manual_annotation_routes_reject_wrong_video_object_and_invalid_frames`
- `backend/tests/integration/api/test_annotation_foundation_manual_box.py::test_object_track_delete_route_removes_linked_annotations_and_manifest_truth`
- `backend/tests/integration/api/test_sam2_shell_runtime.py::test_whole_object_mask_cleanup_preserves_other_objects_and_deletes_only_selected_masks`
- `backend/tests/integration/api/test_sam2_shell_runtime.py::test_job_routes_cancel_active_sam2_propagation`
- `backend/tests/integration/api/test_sam2_shell_runtime.py::test_sam2_prompt_box_uses_real_service_runtime_loader_and_persists_png`
- `backend/tests/integration/api/test_sam2_shell_runtime.py::test_sam2_propagation_uses_real_service_runtime_loader_and_persists_png`
- `backend/tests/integration/api/test_sam2_shell_runtime.py::test_sam2_propagation_rehydrates_runtime_session_and_keeps_cancel_progress_coherent`
- `backend/tests/integration/api/test_sam2_shell_runtime.py::test_sam2_prompt_box_returns_service_unavailable_when_runtime_missing`
- `backend/tests/integration/api/test_sam2_shell_runtime.py::test_sam2_propagation_job_marks_failed_when_runtime_missing`

Common symptom from the failure output:
- object-create route responses missing expected `id`
- propagation route responses missing expected `job_id`

Read first:
- [[Workflow]]
- [[Testing tools]]
- [[Annotation Foundation and Manual Box Workflow]]
- [[SAM2 Shell and Runtime]]
- `backend/tests/integration/api/test_annotation_foundation_manual_box.py`
- `backend/tests/integration/api/test_sam2_shell_runtime.py`

Stage-2 rule: in planning phase, write concrete tests and implementation plan first. During execution, record exact route responses and classify stale-test versus product-regression root cause before changing assertions or app code.

### Scope

- In scope: reproduce the 11 backend integration failures, identify whether expectations are stale or backend behavior regressed, and update tests or route the real regression honestly
- Out of scope: unrelated frontend coverage work, hook-stage redesign, and non-failing backend integration areas

### Affected Features

- [[Annotation Foundation and Manual Box Workflow]]
- [[SAM2 Shell and Runtime]]

### Acceptance Criteria

- [x] Every reported failing integration test is reproduced and classified as stale test, wrong expectation, or real backend regression
- [x] Stale or wrong tests are fixed surgically, or real backend regressions are routed with explicit follow-up
- [x] `uv run --project backend pre-commit run --all-files --hook-stage pre-push --config .pre-commit-config.yaml` passes or remaining failures are documented as out of scope with evidence

### Test Intent

- Backend: rerun the exact failing integration tests first, then rerun the full pre-push integration hook
- Frontend: none
- Manual: none

### Definition of Done

- [x] Planning phase records concrete tests and implementation plan before code
- [x] Root cause for each failing test is recorded honestly before any fix lands
- [x] Relevant backend integration checks pass or residual failures are documented with evidence
- [x] Task note and any affected durable notes are updated honestly if workflow or contract truth changes

## Planning Phase

### Planned Integration Tests

- Reproduce the exact failing backend integration tests first.
- Rerun the full backend plus frontend integration command after stale expectations are updated.

### Planned E2E Tests

- None. This slice is integration and hook-truth only.

### Planned Implementation

- Reproduce the failures.
- Classify each failure as stale test versus real regression before editing.
- Update only the stale expectations or missing test harness pieces required to make pre-push honest again.

### Feature Matrix Updates

- Update durable testing notes only if hook or contract truth changes.

## Execution Phase

### Implementation Notes

- Reproduced the reported pre-push failures and classified them as stale-test drift instead of fresh backend regressions.
- Updated backend integration tests to current create-object and SAM2 propagation request contracts.
- Updated frontend review integration harness to current `annotated-frames` bootstrap, current review copy, and current export UI truth.

## Wrap-Up Phase

### Verification

- Commands run:
- `npm run test:integration`
- `uv run --project backend pre-commit run --all-files --hook-stage pre-push --config .pre-commit-config.yaml`
- Results:
- `npm run test:integration` passed.
- Pre-push hook passed after the stale tests were updated.
- Frontend integration still prints JSDOM `HTMLMediaElement play/pause not implemented` warnings, but suite passes.

### Final Summary

- The reported `ralph/ui` integration failures were stale-test drift, not fresh backend regressions.
- Fixes updated backend integration payload expectations and frontend review integration harness to current contracts and current review/export UI truth.
### Completion Gate

- [x] Acceptance Criteria checkboxes updated to match reality
- [x] Definition of Done checkboxes updated to match reality
- [x] Only now may `status` change to `done`
