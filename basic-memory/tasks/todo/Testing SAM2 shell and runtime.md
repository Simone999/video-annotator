---
id: task-testing-sam2-shell-and-runtime
title: Testing SAM2 shell and runtime
status: todo
completed: null
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
- sam2
permalink: video-annotator/tasks/testing-sam2-shell-and-runtime
---

## Creation Phase

### Description

Add durable test coverage for the shipped SAM2 shell and make the live-runtime gap explicit. Start from `[[SAM2 Shell and Runtime]]`, carefully re-think backend integration, frontend integration, and browser E2E with the testing notes, then update the feature note with hard evidence instead of implied capability.

### Scope

- In scope: shell-session lifecycle, prompt-box, propagation, poll, cancel, reopen coverage, honest runtime-gap recording, and feature-note evidence updates
- Out of scope: pretending real SAM2 inference is trusted when adapter support is missing, adding missing refine flows, or hiding GPU or model blockers behind fake green tests

### Affected Features

- [[SAM2 Shell and Runtime]]

### Testing Notes

- [[backend-api-integration-tests]]
- [[frontend-integration-tests]]
- [[e2e-tests]]

### Acceptance Criteria

- [ ] Task note explicitly re-thinks backend integration vs frontend integration vs browser E2E with help from the testing notes before choosing coverage
- [ ] Backend integration and e2e scenarios cover session lifecycle, prompt-box persistence, propagation jobs, polling, cancellation, and reopen behavior
- [ ] Frontend integration and e2e scenarios cover run-SAM2, progress polling, cancel, and reopened persisted masks
- [ ] Live-runtime scenarios are separated from fake-adapter shell scenarios so the note clearly shows what is truly trusted today
- [ ] Manual frontend checks cover real local-runtime prompt, propagation, reopen, and failure UX workflows when the environment allows it
- [ ] `[[SAM2 Shell and Runtime]]` is updated with evidence links and honest execution status values

### Test Intent

- Backend: prove shell contracts around session lifecycle, prompt persistence, propagation jobs, polling, cancellation, and reopened masks work with today’s adapter boundaries
- Frontend: prove current SAM2 controls can start, monitor, cancel, and reopen work without overstating real runtime trust
- Manual: verify real local runtime behavior, long-running job handling, and GPU or model failure UX when environment support exists

### Definition of Done

- [ ] Relevant backend tests pass
- [ ] Relevant frontend tests pass
- [ ] Feature note updated
- [ ] Manual execution status recorded honestly
- [ ] Docs or memory updated if behavior or contracts changed

## Planning Phase

### Planned Integration Tests

- Backend:
- Frontend:

### Planned E2E Tests

- Backend:
- Frontend:

### Planned Implementation

- Step 1:
- Step 2:

### Feature Matrix Updates

- Feature note updates needed before or during execution:

## Execution Phase

### Implementation Notes

Write progress, decisions, blockers, and verification observations here while work is active.

## Wrap-Up Phase

### Verification

- Commands run:
- Results:

### Final Summary

PR-style summary of what changed and how it was verified.

### Completion Gate

- [ ] Acceptance Criteria checkboxes updated to match reality
- [ ] Definition of Done checkboxes updated to match reality
- [ ] Only now may `status` change to `done`
