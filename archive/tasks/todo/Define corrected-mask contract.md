---
title: Define corrected-mask contract
type: note
permalink: video-annotator/tasks/define-corrected-mask-contract
id: task-define-corrected-mask-contract
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
- mask-editing
---

# Define corrected-mask contract

## Creation Phase

### Description

Define corrected-mask persistence and refine contract before code so mask editing work does not invent storage or summary semantics mid-flight.

Read first:
- [[Workflow]]
- [[Mask Editing and Cleanup]]
- [[SAM2 Shell and Runtime]]
- [[API]]
- [[Data Model]]
- `docs/spec.md`
- `docs/product/prd.md`
- `backend/app/db/models.py`
- `backend/app/schemas/video.py`

Stage-2 rule: in planning phase, write concrete test plan and implementation plan first. In execution, follow written plan. Before `done`, run own review plus 2 subagent reviews and fix actionable findings.

### Scope

- In scope: storage semantics, source semantics, confidence-reset rule, summary-reset rule, and route shape for refine work
- Out of scope: full backend implementation or frontend brush UI

### Affected Features

- [[Mask Editing and Cleanup]]
- [[SAM2 Shell and Runtime]]

### Acceptance Criteria

- [ ] Corrected-mask source, confidence reset, and summary-reset rules are explicit before implementation starts
- [ ] Refine route shape and reopen expectations are written down in code-facing docs or memory
- [ ] Later m-4 tasks can implement without guessing persistence semantics

### Test Intent

- Backend: define failing tests to lock corrected-mask persistence and reopen behavior before code
- Frontend: define UI-facing test targets for refine and cleanup flows before code
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
