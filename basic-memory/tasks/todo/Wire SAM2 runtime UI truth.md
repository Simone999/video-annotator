---
title: Wire SAM2 runtime UI truth
type: note
permalink: video-annotator/tasks/wire-sam2-runtime-ui-truth
id: task-wire-sam2-runtime-ui-truth
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
- sam2
- m-3
- ui
---

# Wire SAM2 runtime UI truth

## Creation Phase

### Description

Wire live review UI to real runtime status, confidence display, and error states without fake shell assumptions.

Read first:
- [[Workflow]]
- [[SAM2 Shell and Runtime]]
- [[API]]
- `docs/spec.md`
- `docs/product/prd.md`
- `frontend/src/features/video-review/api.ts`
- `frontend/src/features/video-review/hooks/use-sam2-workspace.ts`
- `frontend/src/features/video-review/components/review-inspector-panel.tsx`
- `frontend/tests/integration/video-review/live-review-screen.test.tsx`

Stage-2 rule: in planning phase, write concrete test plan and implementation plan first. In execution, follow written plan. Before `done`, run own review plus 2 subagent reviews and fix actionable findings.

### Scope

- In scope: frontend SAM2 request states, confidence rendering, and honest runtime failure copy for prompt or propagation flows
- Out of scope: mask refine tools or export behavior

### Affected Features

- [[SAM2 Shell and Runtime]]

### Acceptance Criteria

- [ ] Live review surfaces real runtime loading, success, and failure states
- [ ] Untouched SAM2 confidence displays when backend provides it and stays null otherwise
- [ ] Frontend tests and browser proof cover real-runtime-facing UI behavior or honest blocker reporting

### Test Intent

- Backend: none
- Frontend: integration coverage for runtime status and confidence rendering
- Manual: browser-check real runtime prompt or propagation flow if local runtime exists

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
