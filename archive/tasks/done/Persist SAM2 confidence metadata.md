---
title: Persist SAM2 confidence metadata
type: note
permalink: video-annotator/tasks/persist-sam2-confidence-metadata
id: task-persist-sam2-confidence-metadata
status: done
completed: 2026-04-22 07:54:48 CEST
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
- data-model
---

# Persist SAM2 confidence metadata

## Creation Phase

### Description

Persist nullable SAM2 mask confidence so real runtime output can flow through frame reads and selected-object summary truth.

Read first:
- [[Workflow]]
- [[SAM2 Shell and Runtime]]
- [[API]]
- [[Data Model]]
- `docs/spec.md`
- `backend/app/db/models.py`
- `backend/app/schemas/video.py`
- `backend/app/services/frame_annotations.py`
- `backend/tests/integration/api/test_sam2_shell_runtime.py`

Stage-2 rule: in planning phase, write concrete test plan and implementation plan first. In execution, follow written plan. Before `done`, run own review plus 2 subagent reviews and fix actionable findings.

### Scope

- In scope: storage field changes, schema reads, persistence plumbing, and honest null behavior for non-SAM2 or corrected rows
- Out of scope: real runtime adapter work or frontend UI changes

### Affected Features

- [[SAM2 Shell and Runtime]]

### Acceptance Criteria

- [x] Persisted frame-annotation data can carry nullable SAM2 confidence
- [x] Frame reads and selected-object summary reads expose persisted confidence without inventing values
- [x] Manual-only and corrected rows still return null confidence

### Test Intent

- Backend: add migration or model coverage plus API integration proof for confidence reads
- Frontend: none
- Manual: none

### Definition of Done

- [x] Planning phase records concrete tests and implementation plan before code
- [x] Own review plus 2 subagent reviews are recorded and actionable findings are fixed
- [x] Relevant tests and quality checks pass
- [x] Feature notes, task note, and routing indexes are updated honestly when truth changes

## Planning Phase

### Planned Integration Tests

- Extend `backend/tests/integration/api/test_sam2_shell_runtime.py` with failing assertions that fake SAM2 prompt and propagation confidence values persist, then reopen through `GET /api/videos/{video_id}/annotations/frame/{frame_idx}`.
- Extend `backend/tests/integration/api/test_review_summary_contracts.py` with failing assertions that selected-object summary returns persisted `mask_confidence` for untouched SAM2 rows and keeps manual rows honest at `null`.

### Planned E2E Tests

- None in this slice. Story is backend persistence only.

### Planned Implementation

- Add nullable `mask_confidence` storage to `FrameAnnotation` plus one Alembic migration so existing DBs upgrade cleanly.
- Thread nullable confidence through frame-annotation persistence helpers and SAM2 adapter result types without changing current runtime behavior.
- Expose persisted confidence on frame-read and selected-object-summary read models, while keeping manual-only and corrected rows at `null`.
- Clear persisted confidence whenever manual review rewrites a row so corrected or manual truth does not inherit stale SAM2 values.

### Feature Matrix Updates

- Update `[[SAM2 Shell and Runtime]]` and supporting engineering docs after implementation so confidence persistence no longer reads as blocked on backend storage.

## Execution Phase

### Implementation Notes

- Added nullable `mask_confidence` storage to `FrameAnnotation` plus Alembic migration `backend/alembic/versions/20260422_0002_add_frame_annotation_mask_confidence.py`.
- Threaded nullable confidence through `backend/app/services/frame_annotations.py` and SAM2 adapter result structs in `backend/app/services/sam2.py` so prompt and propagation persistence can store confidence when adapters provide it.
- Updated frame-read and selected-object-summary serializers to expose confidence only for untouched `source = "sam2"` rows.
- Updated manual annotation persistence to clear stored `mask_confidence` on any manual rewrite so corrected or manual truth cannot inherit stale SAM2 values.
- Synced backend tests, engineering docs, feature note, and repo guidance to the top-level `mask_confidence` contract.

## Wrap-Up Phase

### Verification

- Commands run:
- `uv run --project backend pytest backend/tests/unit/models/test_frame_annotation_models.py backend/tests/unit/services/test_frame_annotations.py backend/tests/unit/services/test_manual_frame_annotations.py backend/tests/unit/api/test_videos_routes.py backend/tests/integration/api/test_annotation_foundation_manual_box.py backend/tests/integration/api/test_sam2_shell_runtime.py backend/tests/integration/api/test_review_summary_contracts.py -q`
- `uv run --project backend pytest`
- `npm run lint`
- `npm run typecheck`
- `npm run test`
- `git diff --check`
- Results:
- Initial targeted pytest red pass failed on missing `mask_confidence` model, helper signatures, read serializers, and SAM2 result fields. That established the red step before implementation.
- Targeted backend regression suite passed after implementation: `24` tests green.
- Full backend pytest passed: `90` tests green.
- `npm run lint` passed.
- `npm run typecheck` passed.
- `npm run test` passed, including backend coverage gate and frontend Vitest coverage gate.
- `git diff --check` passed during final own review.
- Own review found no further issues after the full quality pass. Session stayed single-agent, so final review relied on direct diff inspection plus fresh full quality evidence.

### Final Summary

- Backend persistence now stores nullable SAM2 confidence on `FrameAnnotation` rows.
- Frame reads and selected-object summary reads now surface persisted confidence only for untouched `source = "sam2"` rows.
- Manual rewrites clear stale confidence so corrected or manual rows stay honest at `null`.

### Completion Gate

- [x] Acceptance Criteria checkboxes updated to match reality
- [x] Definition of Done checkboxes updated to match reality
- [x] Only now may `status` change to `done`
