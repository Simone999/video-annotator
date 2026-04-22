---
id: task-testing-export
title: Testing export
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
- export
permalink: video-annotator/tasks/testing-export
---

## Creation Phase

### Description

Own the test plan for deterministic export. Start from `[[Export]]`, carefully re-think backend integration, frontend integration, and browser E2E with the testing notes, then keep blocked rows explicit until export code exists.

### Scope

- In scope: blocked export scenarios, prerequisite deterministic storage checks that already exist, and manual artifact-inspection steps for later execution
- Out of scope: shipping export code, pretending export UI exists, or writing fake deterministic tests against nonexistent routes

### Affected Features

- [[Export]]

### Testing Notes

- [[backend-api-integration-tests]]
- [[frontend-integration-tests]]
- [[e2e-tests]]

### Acceptance Criteria

- [x] Task note explicitly re-thinks backend integration vs frontend integration vs browser E2E with help from the testing notes before choosing coverage
- [x] Prerequisite deterministic mask-path behavior is covered where it already exists
- [x] Backend and frontend e2e planning is explicit: backend scenarios cover create/download/determinism while frontend scenarios cover export trigger and download workflow
- [x] Missing export API, generator, UI, and golden verification stay blocked with exact reasons until implemented
- [x] When export lands, backend tests cover create, download, determinism, and artifact contents while frontend tests cover export trigger and download workflow
- [x] Manual frontend checks describe how to inspect export artifacts and compare repeated runs, and results are recorded in `[[Export]]`
- [x] `[[Export]]` is updated with evidence links and honest execution status values

### Test Intent

- Backend: define future export verification around create or download or determinism or artifact contents while covering only real prerequisite behaviors today
- Frontend: define later export-trigger and download workflows from real handoff scenarios without inventing a UI that is not shipped
- Manual: document how an operator will inspect generated JSON or PNG outputs and compare repeated runs once export exists

### Definition of Done

- [x] Relevant backend tests pass
- [x] Relevant frontend tests pass
- [x] Feature note updated
- [x] Manual execution status recorded honestly
- [x] Docs or memory updated if behavior or contracts changed

## Planning Phase

### Planned Integration Tests

- Backend:
  - no new backend API integration file yet; first freeze only real prerequisites export will depend on
  - treat `backend/tests/models/test_frame_annotation_models.py` as prerequisite evidence because it freezes relative `mask_path` naming shape that export format will reuse
  - treat `backend/tests/api/test_sam2_shell_runtime.py` as prerequisite evidence because it proves mask files persist and reopen or download through real API using relative `masks/{video_id}/{object_id}/frame_{frame_idx:06d}.png` paths
  - treat `backend/tests/api/test_annotation_foundation_manual_box.py` as prerequisite evidence because it proves manual rows persist with `mask: null`, needed for later boxes-only or mixed export scenarios
  - keep future export create or download or determinism or artifact-content tests blocked until `POST /api/videos/{video_id}/export`, `GET /api/exports/{export_id}`, export generator, and exported-state derivation exist
- Frontend:
  - no new frontend integration file yet; current live-review UI has no export button, export status polling, or download affordance to exercise honestly
  - do not treat fixture-shell `Exported` badge or `annotations.json + masks/*.png` copy as frontend export proof; those are mockup-only
  - keep future export-trigger and download workflows blocked until live UI and typed client routes exist

### Planned E2E Tests

- Backend:
  - none planned today; browser adds no value before export backend contracts exist, so determinism and artifact contents should stay in backend integration once routes land
- Frontend:
  - no automated browser E2E yet; later browser proof should cover trigger export, wait for completion, download artifact, and reopen library state only after live UI exists
  - manual browser scenarios still need to be written now so future work does not re-derive artifact-inspection steps

### Planned Implementation

- Step 1: verify current code and tests so note updates cite real prerequisite mask-path and manual-row behavior plus exact missing export contracts
- Step 2: update task and feature notes with concrete evidence, blocked export scenarios, manual artifact-inspection steps, and shell-export guardrail
- Step 3: run targeted prerequisite tests plus repo quality commands, then close the task if notes and evidence match reality

### Feature Matrix Updates

- Feature note updates needed before or during execution:
  - replace minimal summary in `[[Export]]` with real prerequisite evidence and blocked backend or frontend or E2E rows
  - call out that shell exported chrome is mockup-only and not live export proof
  - keep missing create or download or generator or determinism or state-derivation work explicit

## Execution Phase

### Implementation Notes

- Session started on 2026-04-21 for Ralph US-011.
- Re-read `[[backend-api-integration-tests]]`, `[[frontend-integration-tests]]`, and `[[e2e-tests]]` before choosing coverage.
- Chosen test layers:
  - backend API integration remains future home for export create or download or determinism or stale-export state because backend will own artifact generation and derived review-state truth
  - frontend integration remains future home for export trigger or status or download workflows because current value is visible live-review or library behavior with fake HTTP boundary
  - browser E2E is not justified today because no live export route or UI exists end-to-end
- Existing prerequisite coverage already present:
  - `backend/tests/models/test_frame_annotation_models.py` freezes relative `mask_path` storage shape
  - `backend/tests/api/test_sam2_shell_runtime.py` proves persisted SAM2 masks reopen and download through real routes with stable relative paths
  - `backend/tests/api/test_annotation_foundation_manual_box.py` proves manual annotations persist with `mask: null`, which later export must represent honestly for boxes-only or mixed outputs
  - `frontend/src/features/ui-shell/shell-host.test.tsx` shows exported shell copy only as mockup chrome; it is not real export proof
- Planned work for this task is note truth and verification only unless current evidence proves inconsistent with code.
- No production code or new automated tests were added because export routes, generator, and live UI are still absent; honest feature-note truth is shipped outcome for this story.

## Wrap-Up Phase

### Verification

- Commands run:
- `uv run --project backend pytest backend/tests/models/test_frame_annotation_models.py backend/tests/api/test_sam2_shell_runtime.py backend/tests/api/test_annotation_foundation_manual_box.py -q`
- `npm run lint`
- `npm run typecheck`
- `npm run test`
- `git diff --check`
- Results:
- targeted backend prerequisite tests passed: `5 passed`
- repo `lint` passed
- repo `typecheck` passed with backend `0 errors, 0 warnings, 0 informations` and frontend `tsc --noEmit` exit `0`
- repo `test` passed with backend `12 passed` and frontend `27 passed`
- `git diff --check` passed
- manual browser execution was not run because current app still lacks export routes and UI; blocked manual rows in `[[Export]]` are honest current status

### Final Summary

Updated `[[Export]]` from a minimal summary to real prerequisite evidence plus blocked backend or frontend or manual export scenarios, added reusable shell-export guardrails, and verified those claims against existing backend prerequisite tests plus repo-wide quality commands.

### Completion Gate

- [x] Acceptance Criteria checkboxes updated to match reality
- [x] Definition of Done checkboxes updated to match reality
- [x] Only now may `status` change to `done`
