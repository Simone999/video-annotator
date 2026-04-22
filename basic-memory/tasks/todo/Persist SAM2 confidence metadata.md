---
title: Persist SAM2 confidence metadata
type: note
permalink: video-annotator/tasks/persist-sam2-confidence-metadata
id: task-persist-sam2-confidence-metadata
status: todo
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

- [ ] Persisted frame-annotation data can carry nullable SAM2 confidence
- [ ] Frame reads and selected-object summary reads expose persisted confidence without inventing values
- [ ] Manual-only and corrected rows still return null confidence

### Test Intent

- Backend: add migration or model coverage plus API integration proof for confidence reads
- Frontend: none
- Manual: none

### Definition of Done

- [ ] Planning phase records concrete tests and implementation plan before code
- [ ] Own review plus 2 subagent reviews are recorded and actionable findings are fixed
- [ ] Relevant tests and quality checks pass
- [ ] Feature notes, task note, and routing indexes are updated honestly when truth changes

## Planning Phase

### Planned Integration Tests

### Planned E2E Tests

### Planned Implementation

### Feature Matrix Updates

## Execution Phase

### Implementation Notes

## Wrap-Up Phase

### Verification

- Commands run:
- Results:

### Final Summary

### Completion Gate

- [ ] Acceptance Criteria checkboxes updated to match reality
- [ ] Definition of Done checkboxes updated to match reality
- [ ] Only now may `status` change to `done`
