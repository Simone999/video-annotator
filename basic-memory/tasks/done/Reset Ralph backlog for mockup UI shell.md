---
title: Reset Ralph backlog for mockup UI shell
type: task
permalink: video-annotator/tasks/done/reset-ralph-backlog-for-mockup-ui-shell
id: task-reset-ralph-backlog-for-mockup-ui-shell
status: done
completed: 2026-04-21
steps:
- creation
- planning
- execution
- wrap_up
tags:
- task
- ralph
- backlog
- memory
- ui
---

## Creation Phase

### Description

Archive the finished Ralph backlog, create a fresh Ralph backlog for the UI-only mockup shell branch, add the new planned milestone and UI tasks, and refresh current testing tasks so future agents start from clean task truth.

### Scope

- In scope: Ralph archive reset, new `prd.json`, new `progress.md`, new planned milestone note, new UI-shell todo tasks, refreshed testing task notes, and index updates
- Out of scope: frontend implementation, backend work, or any runtime feature changes

### Affected Features

- [[Review Workspace Ergonomics]]
- [[Video Ingest and Exact-Frame Review]]
- [[Annotation Foundation and Manual Box Workflow]]
- [[SAM2 Shell and Runtime]]
- [[Mask Editing and Cleanup]]
- [[Export]]

### Acceptance Criteria

- [x] Old Ralph `prd.json` and `progress.md` are archived together in a dated folder
- [x] Fresh Ralph files point at branch `ralph/m-2a-mockup-ui-shell`
- [x] Memory contains planned milestone `[[m-2a: Mockup UI Shell]]` and five new UI-shell todo tasks
- [x] Current testing todo tasks are refreshed where needed and now cite the test guidance notes directly
- [x] New Ralph backlog contains the UI-shell stories first, then the current todo testing stories

### Test Intent

- Backend: none
- Frontend: none
- Manual: verify archive location, new backlog content, and memory routing by direct file checks and targeted searches

### Definition of Done

- [x] Verification commands run
- [x] Memory updated
- [x] Supporting backlog files updated

## Planning Phase

### Planned Integration Tests

- Backend: none
- Frontend: none

### Planned E2E Tests

- Backend: none
- Frontend: none

### Planned Implementation

- Step 1: archive finished Ralph files and preserve the old progress history
- Step 2: add new plan, milestone, and task notes for the UI-shell milestone
- Step 3: refresh stale testing tasks with test-note routing and shell-vs-live boundaries
- Step 4: replace live Ralph backlog files with the new UI-first backlog
- Step 5: verify archive, backlog JSON, progress reset, and memory routing

### Feature Matrix Updates

- Feature note updates needed before or during execution:
  - `[[Review Workspace Ergonomics]]` needs routing to the new UI-shell tasks and milestone

## Execution Phase

### Implementation Notes

- Archived `tools/ralph/prd.json` and `tools/ralph/progress.md` into `tools/ralph/archive/2026-04-21-m-1-annotation-foundation-complete/`.
- Added the planned milestone note and five UI-shell todo tasks.
- Rewrote `[[Testing review workspace ergonomics]]` around the mockup shell.
- Refreshed the other testing tasks so they now point to `[[backend-api-integration-tests]]`, `[[frontend-integration-tests]]`, and `[[e2e-tests]]` and explicitly re-think test boundaries.
- Replaced the live Ralph files with a fresh branch backlog and a reset progress log that keeps only codebase patterns.

## Wrap-Up Phase

### Verification

- Commands run:
  - `jq empty tools/ralph/prd.json`
  - `git diff --check`
  - `rg -n "m-2a: Mockup UI Shell|Build UI shell fixture foundation|frontend-integration-tests|backend-api-integration-tests|e2e-tests" basic-memory tools/ralph/prd.json`
- Results:
  - `jq empty tools/ralph/prd.json` passed.
  - `git diff --check` passed.
  - `rg` confirmed the new milestone, UI-shell tasks, and test-note routing are present in memory and the new Ralph backlog.

### Final Summary

Archived the finished Ralph backlog, created the new UI-first Ralph backlog on `ralph/m-2a-mockup-ui-shell`, added the planned shell milestone and five UI tasks, and refreshed all testing todo tasks so future agents re-think integration vs E2E with the durable test notes first.

### Completion Gate

- [x] Acceptance Criteria checkboxes updated to match reality
- [x] Definition of Done checkboxes updated to match reality
- [x] Only now may `status` change to `done`
