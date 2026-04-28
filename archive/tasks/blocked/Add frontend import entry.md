---
title: Add frontend import entry
type: note
permalink: video-annotator/tasks/add-frontend-import-entry
id: task-add-frontend-import-entry
status: blocked
completed:
steps:
- creation
- planning
- execution
- wrap_up
tags:
- task
- blocked
- frontend
- import
- m-6
- ui
---

# Add frontend import entry

## Creation Phase

### Description

Add user-visible import entry and reload UX on normal review flow. Blocked until `[[Add import API and validation]]` and `[[Wire import review-state transitions]]` exist.

Read first:
- [[Workflow]]
- [[Import Existing Boxes]]
- [[Video Ingest and Exact-Frame Review]]
- [[Product Requirements]]
- [[Frontend Interaction Spec]]
- `frontend/src/features/video-library/components/video-library-screen.tsx`
- `frontend/src/features/video-review/components/live-review-screen.tsx`

Stage-2 rule: in planning phase, write concrete test plan and implementation plan first. In execution, follow written plan. Before `done`, run own review plus 2 subagent reviews and fix actionable findings.

### Scope

- In scope: visible import entry, success/failure copy, and reload path into normal library or review reads
- Out of scope: CLI-only import or guessed backend states

### Affected Features

- [[Import Existing Boxes]]
- [[Video Ingest and Exact-Frame Review]]

### Acceptance Criteria

- [ ] Frontend exposes import as normal user-visible review workflow
- [ ] Success and failure states are explicit and route back into normal reads
- [ ] Task stays blocked until import backend path exists

### Test Intent

- Backend: none
- Frontend: integration coverage for import trigger and reload UX once unblocked
- Manual: browser-check import UX against real pipeline sample once unblocked

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
