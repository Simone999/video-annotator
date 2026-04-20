---
id: task-testing-export
title: Testing export
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
- export
permalink: video-annotator/tasks/testing-export
---

## Creation Phase

### Description

Own the test plan for deterministic export. Start from `[[Export]]`, use real downstream handoff scenarios, and keep blocked rows explicit until export code exists.

### Scope

- In scope: blocked export scenarios, prerequisite deterministic storage checks that already exist, and manual artifact-inspection steps for later execution
- Out of scope: shipping export code, pretending export UI exists, or writing fake deterministic tests against nonexistent routes

### Affected Features

- [[Export]]

### Acceptance Criteria

- [ ] Prerequisite deterministic mask-path behavior is covered where it already exists
- [ ] Backend and frontend e2e planning is explicit: backend scenarios cover create/download/determinism while frontend scenarios cover export trigger and download workflow
- [ ] Missing export API, generator, UI, and golden verification stay blocked with exact reasons until implemented
- [ ] When export lands, backend tests cover create, download, determinism, and artifact contents while frontend tests cover export trigger and download workflow
- [ ] Manual frontend checks describe how to inspect export artifacts and compare repeated runs, and results are recorded in `[[Export]]`
- [ ] `[[Export]]` is updated with evidence links and honest execution status values

### Test Intent

- Backend: define future export verification around create or download or determinism or artifact contents while covering only real prerequisite behaviors today
- Frontend: define later export-trigger and download workflows from real handoff scenarios without inventing a UI that is not shipped
- Manual: document how an operator will inspect generated JSON or PNG outputs and compare repeated runs once export exists

### Definition of Done

- [ ] Relevant backend tests pass
- [ ] Relevant frontend tests pass
- [ ] Feature note updated
- [ ] Manual execution status recorded honestly
- [ ] Docs or memory updated if behavior or contracts changed

## Planning Phase

### Planned Integration Tests

- Backend: freeze current prerequisite deterministic storage behavior and keep true export routes blocked until they exist
- Frontend: keep export UI coverage blocked until a real trigger surface exists

### Planned E2E Tests

- Backend: define future package creation or download workflows while keeping them blocked until export code lands
- Frontend: define future browser export trigger or download workflow while keeping it blocked until UI exists

### Planned Implementation

- Read `[[Export]]`, `[[Export Format]]`, `[[API]]`, and `[[Test Plan]]`
- Keep current prerequisite coverage separate from true export coverage
- Add deterministic artifact checks only when export code exists
- Update the feature note tables before and after implementation

### Feature Matrix Updates

- Before coding: refine blocked and planned rows in `[[Export]]`
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
