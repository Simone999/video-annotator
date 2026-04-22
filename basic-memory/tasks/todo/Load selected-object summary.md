---
title: Load selected-object summary
type: note
permalink: video-annotator/tasks/load-selected-object-summary
id: task-load-selected-object-summary
status: todo
completed:
steps:
- creation
- planning
- execution
- wrap_up
tags:
- task
- frontend
- review
- m-2
- summary
- inspector
---

# Load selected-object summary

## Creation Phase

### Description

Add typed selected-object summary client and live review fetch flow so inspector can read backend bbox, confidence, and counter truth.

Read first:
- [[Workflow]]
- [[Video Ingest and Exact-Frame Review]]
- [[SAM2 Shell and Runtime]]
- [[API]]
- `docs/spec.md`
- `docs/product/prd.md`
- `backend/app/api/videos.py`
- `frontend/src/features/video-review/api.ts`
- `frontend/src/features/video-review/workspace.ts`
- `frontend/src/features/video-review/hooks/use-live-review-controller.ts`

Stage-2 rule: in planning phase, write concrete test plan and implementation plan first. In execution, follow written plan. Before `done`, run own review plus 2 subagent reviews and fix actionable findings.

### Scope

- In scope: typed client, parser, request lifecycle, reload triggers from object/frame/range state, and honest null handling
- Out of scope: summary field rendering polish or backend contract changes

### Affected Features

- [[Video Ingest and Exact-Frame Review]]
- [[SAM2 Shell and Runtime]]

### Acceptance Criteria

- [ ] Frontend has typed client support for selected-object summary route
- [ ] Live review fetches summary from current object, frame, and selected range instead of local guesses
- [ ] Null confidence and null corrected-count values stay honest in state handling

### Test Intent

- Backend: none; route already exists
- Frontend: unit or integration coverage for client parsing and summary fetch lifecycle
- Manual: none in this slice

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
