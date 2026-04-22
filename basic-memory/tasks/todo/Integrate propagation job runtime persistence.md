---
title: Integrate propagation job runtime persistence
type: note
permalink: video-annotator/tasks/integrate-propagation-job-runtime-persistence
id: task-integrate-propagation-job-runtime-persistence
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
- jobs
---

# Integrate propagation job runtime persistence

## Creation Phase

### Description

Thread the real propagation adapter through job orchestration, progress persistence, cancel handling, and propagated-mask writes.

Read first:
- [[Workflow]]
- [[SAM2 Shell and Runtime]]
- [[API]]
- `docs/spec.md`
- `backend/app/api/jobs.py`
- `backend/app/api/videos.py`
- `backend/app/services/sam2.py`
- `backend/tests/integration/api/test_sam2_shell_runtime.py`

Stage-2 rule: in planning phase, write concrete test plan and implementation plan first. In execution, follow written plan. Before `done`, run own review plus 2 subagent reviews and fix actionable findings.

### Scope

- In scope: start or poll or cancel job wiring, progress updates, cancel-safe persistence, and reopened propagated masks after real runtime runs
- Out of scope: refine flow or frontend UI polish

### Affected Features

- [[SAM2 Shell and Runtime]]

### Acceptance Criteria

- [ ] Real propagation adapter is wired through job start, status, and cancel routes
- [ ] Progress and cancel persistence stay coherent with runtime updates
- [ ] Persisted propagated masks reopen through current frame reads after real runtime runs

### Test Intent

- Backend: integration coverage for real propagation status, cancel behavior, and reopen path
- Frontend: none
- Manual: run only if local real runtime exists; otherwise record blocker honestly

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
