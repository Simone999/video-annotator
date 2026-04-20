---
id: task-testing-mask-editing-and-cleanup
title: Testing mask editing and cleanup
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
- masks
permalink: video-annotator/tasks/testing-mask-editing-and-cleanup
---

## Creation Phase

### Description

Own the test plan for manual mask correction and cleanup workflows. Start from `[[Mask Editing and Cleanup]]`, capture the real operator scenarios that matter, and keep blocked rows explicit until the feature exists.

### Scope

- In scope: blocked backend or frontend or manual scenarios for refine and cleanup, plus any current prerequisite mask reopen behavior worth freezing
- Out of scope: inventing refine APIs, brush UI, cleanup semantics, or pretending absent workflows already have runnable coverage

### Affected Features

- [[Mask Editing and Cleanup]]

### Acceptance Criteria

- [ ] Existing prerequisite mask-reopen behavior is covered where it already exists
- [ ] Backend and frontend e2e planning is explicit: backend scenarios cover refine and cleanup semantics while frontend scenarios cover brush and cleanup interactions
- [ ] Missing refine, brush, and cleanup workflows are represented as blocked backend and frontend scenarios with exact reasons instead of fake test files
- [ ] When the feature begins to land, backend tests cover refine persistence and cleanup semantics while frontend tests cover brush and cleanup interactions
- [ ] Manual frontend checks describe refine, brush, and cleanup workflows clearly enough for later execution and record results in `[[Mask Editing and Cleanup]]`
- [ ] `[[Mask Editing and Cleanup]]` is updated with evidence links and honest execution status values

### Test Intent

- Backend: define future refine and cleanup verification around persistence and deletion semantics, while freezing only real prerequisite behavior today
- Frontend: define future brush and cleanup workflows from real correction tasks without creating placeholder green suites
- Manual: document later operator checks for refine or erase or delete-all behavior and record current blocked state honestly

### Definition of Done

- [ ] Relevant backend tests pass
- [ ] Relevant frontend tests pass
- [ ] Feature note updated
- [ ] Manual execution status recorded honestly
- [ ] Docs or memory updated if behavior or contracts changed

## Planning Phase

### Planned Integration Tests

- Backend: freeze current prerequisite reopen behavior and keep refine or cleanup semantics explicitly blocked until contracts exist
- Frontend: freeze any current mask display prerequisites while keeping edit and cleanup surfaces blocked

### Planned E2E Tests

- Backend: define future refine and cleanup end-to-end scenarios but keep them blocked until contracts are real
- Frontend: define future brush and cleanup browser workflows but keep them blocked until UI exists

### Planned Implementation

- Read `[[Mask Editing and Cleanup]]`, `[[API]]`, `[[Data Model]]`, and `[[Test Plan]]`
- Freeze only the current prerequisite view or reopen behavior that already exists
- Treat missing edit or cleanup paths as blocked until contracts and UI exist
- Update the feature note tables before and after implementation

### Feature Matrix Updates

- Before coding: refine blocked and planned rows in `[[Mask Editing and Cleanup]]`
- After verification: add evidence links and honest blocked or manual status values in the feature note

## Execution Phase

### Implementation Notes

Write progress, decisions, blockers, and manual-test observations here while work is active.

## Wrap-Up Phase

### Verification

- Commands run:
- Results:

### Final Summary

Summarize new coverage, blocked gaps, and manual verification evidence.
