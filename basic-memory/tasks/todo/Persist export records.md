---
title: Persist export records
type: note
permalink: video-annotator/tasks/persist-export-records
id: task-persist-export-records
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
- export
- m-5
- data-model
---

# Persist export records

## Creation Phase

### Description

Persist export records and stale/current export derivation so library can tell `ready` from real `exported`.

Read first:
- [[Workflow]]
- [[Export]]
- [[Export Format]]
- [[API]]
- [[Data Model]]
- `docs/spec.md`
- `backend/app/db/models.py`
- `backend/app/services/review_summaries.py`

Stage-2 rule: in planning phase, write concrete test plan and implementation plan first. In execution, follow written plan. Before `done`, run own review plus 2 subagent reviews and fix actionable findings.

### Scope

- In scope: export record storage, stale/current derivation, and review-state read-model updates
- Out of scope: artifact generation or frontend UI

### Affected Features

- [[Export]]

### Acceptance Criteria

- [ ] Backend persists enough export record truth to derive current versus stale export state
- [ ] Library read model can emit real `exported` only when latest export matches saved review state
- [ ] Tests prove post-edit fallback from `exported` back to `ready`

### Test Intent

- Backend: add model or service coverage for export-state derivation
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
