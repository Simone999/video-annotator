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

Add durable test coverage for the shipped SAM2 shell and make the live-runtime gap explicit. Start from `[[SAM2 Shell and Runtime]]`, select scenarios from real operator usage and runtime failure risks, and update the feature note with hard evidence instead of implied capability.

### Scope

- In scope: shell-session lifecycle, prompt-box, propagation, poll, cancel, reopen coverage, honest runtime-gap recording, and feature-note evidence updates
- Out of scope: pretending real SAM2 inference is trusted when adapter support is missing, adding missing refine flows, or hiding GPU or model blockers behind fake green tests

### Affected Features

- [[SAM2 Shell and Runtime]]

### Acceptance Criteria

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

- Backend: freeze session lifecycle, prompt persistence, propagation jobs, polling, cancellation, and reopen behavior
- Frontend: freeze current SAM2 control state around run, poll, cancel, and reopen flows

### Planned E2E Tests

- Backend: cover shell behavior end to end with a stable adapter path instead of overstating live runtime trust
- Frontend: cover browser flow for run, progress, cancel, and reopen while keeping live-runtime gaps explicit

### Planned Implementation

- Read `[[SAM2 Shell and Runtime]]`, `[[SAM2 Integration]]`, `[[API]]`, and `[[Test Plan]]`
- Freeze shell behavior first with existing fake-adapter coverage
- Add live-runtime e2e only where the environment and model setup truly support it
- Record runtime blockers explicitly when real inference or failure UX is still missing
- Update the feature note tables before and after implementation

### Feature Matrix Updates

- Before coding: refine shell-vs-runtime planned rows in `[[SAM2 Shell and Runtime]]`
- After verification: add evidence links and honest manual or blocked status values in the feature note

## Execution Phase

### Implementation Notes

Write progress, decisions, blockers, and manual-test observations here while work is active.

## Wrap-Up Phase

### Verification

- Commands run:
- Results:

### Final Summary

Summarize new coverage, blocked gaps, and manual verification evidence.
