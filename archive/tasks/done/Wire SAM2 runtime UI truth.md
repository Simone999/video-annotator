---
title: Wire SAM2 runtime UI truth
type: note
permalink: video-annotator/tasks/wire-sam2-runtime-ui-truth
id: task-wire-sam2-runtime-ui-truth
status: done
completed: 2026-04-22 04:05:00 CEST
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

Retire stale duplicate frontend SAM2 runtime UI work. Current live review already ships request-state, error-state, and selected-object confidence or summary truth; remaining m-3 gaps are backend runtime and persistence work.

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

- In scope: backlog cleanup for stale duplicate m-3 frontend work, plus routing updates so readers land on actual remaining runtime tasks
- Out of scope: new SAM2 runtime implementation, refine tools, or export behavior

### Affected Features

- [[SAM2 Shell and Runtime]]

### Acceptance Criteria

- [x] Todo backlog no longer treats already-shipped frontend SAM2 UI truth as missing work
- [x] m-3 task routing points readers at remaining backend or persistence work plus review checkpoints
- [x] Feature, milestone, and task indexes are updated to remove stale duplicate scope

### Test Intent

- Backend: none
- Frontend: none; current code audit only
- Manual: none

### Definition of Done

- [x] Planning phase records concrete tests and implementation plan before code
- [x] Own review plus 2 subagent reviews are recorded and actionable findings are fixed
- [x] Relevant tests and quality checks pass
- [x] Feature notes, task note, and routing indexes are updated honestly when truth changes

## Planning Phase

### Planned Integration Tests

- none; verify by code and memory audit only

### Planned E2E Tests

- none

### Planned Implementation

- Confirm current frontend already ships SAM2 request-state and selected-object summary truth.
- Retire this stale todo instead of keeping duplicate frontend scope in m-3.
- Update feature and milestone routing so remaining m-3 work points at backend runtime, persistence, and review tasks only.

### Feature Matrix Updates

- Remove this stale duplicate from `[[SAM2 Shell and Runtime]]` owning-task list and from `[[m-3: Real SAM2 Runtime]]` related tasks.

## Execution Phase

### Implementation Notes

- Audit found current frontend already drives request/loading/error SAM2 shell state in `frontend/src/features/video-review/hooks/use-sam2-workspace.ts`.
- Audit also found inspector confidence and selected-object summary truth already ship in `frontend/src/features/video-review/components/review-inspector-panel.tsx`.
- Retired this todo as stale duplicate work instead of leaving misleading frontend scope in the m-3 backlog.

## Wrap-Up Phase

### Verification

- Commands run:
- `rg -n "Wire SAM2 runtime UI truth" basic-memory/features/SAM2\\ Shell\\ and\\ Runtime.md basic-memory/milestones/planned/m-3\\ -\\ Real\\ SAM2\\ Runtime.md basic-memory/tasks/todo/Todo\\ Tasks\\ Index.md basic-memory/tasks/done/Done\\ Tasks\\ Index.md`
- `sed -n '1,260p' frontend/src/features/video-review/hooks/use-sam2-workspace.ts`
- `sed -n '1,220p' frontend/src/features/video-review/components/review-inspector-panel.tsx`
- Results:
- Audit confirmed current frontend request-state and selected-object summary UI truth already ship.
- Task routing files now drop this duplicate from active todo scope and keep one durable done note for historical links.

### Final Summary

- Retired stale duplicate frontend SAM2 runtime UI task from the active backlog.
- Remaining m-3 work now routes through backend runtime, persistence, and milestone review tasks only.

### Completion Gate

- [x] Acceptance Criteria checkboxes updated to match reality
- [x] Definition of Done checkboxes updated to match reality
- [x] Only now may `status` change to `done`
