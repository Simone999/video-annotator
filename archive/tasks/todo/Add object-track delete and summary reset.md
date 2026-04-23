---
title: Add object-track delete and summary reset
type: note
permalink: video-annotator/tasks/add-object-track-delete-and-summary-reset
id: task-add-object-track-delete-and-summary-reset
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
- frontend
- m-4
- objects
---

# Add object-track delete and summary reset

## Creation Phase

### Description

Add whole-object track delete flow and reset summary/confidence truth after corrected-mask work.
Keep current review-route 1920x1080 direction from `docs/ui/video-review-1920x1080.png`. Use `docs/ui/video-review.html` as guide only, not strict contract.

Read first:
- [[Workflow]]
- [[Mask Editing and Cleanup]]
- [[Annotation Foundation and Manual Box Workflow]]
- [[SAM2 Shell and Runtime]]
- [[API]]
- `docs/ui/video-review-1920x1080.png`
- `docs/ui/video-review.html`
- `backend/app/services/object_tracks.py`
- `backend/app/services/review_summaries.py`
- `frontend/src/features/video-review/components/review-video-list-panel.tsx`
- `frontend/src/features/video-review/components/review-inspector-panel.tsx`

Stage-2 rule: in planning phase, write concrete test plan and implementation plan first. In execution, follow written plan. Before `done`, run own review plus 2 subagent reviews and fix actionable findings.

### Scope

- In scope: object-track delete path, corrected summary reset, confidence-reset wiring after corrections or deletes, and preserving current 1920x1080 review-route direction
- Out of scope: export behavior, import behavior, or redesigning current review-route shell

### Affected Features

- [[Mask Editing and Cleanup]]
- [[Annotation Foundation and Manual Box Workflow]]
- [[SAM2 Shell and Runtime]]

### Acceptance Criteria

- [ ] Live review can delete one whole object track with clear scope and reload truth
- [ ] Selected-object summary and confidence truth reset correctly after corrected or deleted mask state changes
- [ ] Touched review UI keeps current 1920x1080 route direction from `docs/ui/video-review-1920x1080.png`; `docs/ui/video-review.html` stays guide only
- [ ] Tests prove delete scope and summary reset behavior

### Test Intent

- Backend: integration coverage for object-track delete and summary-reset behavior
- Frontend: integration coverage for object delete action and inspector reset
- Manual: browser-check object delete and summary reset behavior on live review route at 1920x1080 against committed PNG truth

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
