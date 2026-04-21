---
id: task-testing-import-existing-boxes
title: Testing import existing boxes
status: blocked
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
- import
permalink: video-annotator/tasks/testing-import-existing-boxes
---

## Creation Phase

### Description

This task is blocked until the unresolved pipeline field mapping is written down. Start from `[[Import Existing Boxes]]`, but do not implement importer tests until that mapping becomes durable memory.

### Scope

- In scope: documenting blocked backend or frontend or manual scenarios, recording exact unblock conditions, and keeping the feature note honest about the missing import contract
- Out of scope: guessing pipeline mappings, designing importer behavior without contract memory, or adding placeholder passing tests

### Affected Features

- [[Import Existing Boxes]]

### Acceptance Criteria

- [ ] Feature note records the unresolved pipeline mapping blocker clearly
- [ ] Backend, frontend, and browser E2E scenarios are defined from real migration workflows, and blocked honestly until the unresolved mapping is fixed
- [ ] Entry conditions for unblocking the task are explicit: resolved mapping, backend importer surface, and clear reopen expectations
- [ ] Manual frontend checks describe how imported data will later be validated by an operator, and execution results must be recorded in `[[Import Existing Boxes]]` when the task unblocks
- [ ] `[[Import Existing Boxes]]` is updated with evidence links and honest execution status values

### Test Intent

- Backend: define future importer verification around mapping correctness, persistence, and reopen semantics once the field mapping is durable
- Frontend: define future import-trigger and validation workflows from real migration tasks without inventing UI or API contracts
- Manual: document how an operator will validate imported objects or boxes against source data when the contract unblocks

### Definition of Done

- [ ] Blocker is documented clearly
- [ ] Feature note updated
- [ ] Manual execution status recorded honestly
- [ ] Docs or memory updated if contract details change

## Planning Phase

### Planned Integration Tests

- Backend:
  - one real FastAPI importer workflow that ingests a fixed current-pipeline fixture, persists stable `ObjectTrack` plus `FrameAnnotation` rows, then reopens imported data through normal manifest or annotation reads
  - blocked until `[[Import Contract]]` documents field mapping and backend exposes import route or service
- Frontend:
  - one real React workflow that triggers import from normal review UI, renders imported objects and boxes, then reloads them through normal reads with fake HTTP only at request boundary
  - blocked until typed import client and visible import controls exist

### Planned E2E Tests

- Backend:
  - none; browser E2E is whole-stack workflow, not backend-only boundary
- Frontend:
  - one real browser migration story: trigger import, reopen imported video, and verify imported boxes appear on canonical frames in review UI
  - blocked until mapping, backend route, and frontend import controls exist

### Planned Implementation

- Step 1: replace placeholder feature-note rows with blocked backend, frontend, browser, and manual scenarios tied to real migration workflows
- Step 2: leave task blocked until `[[Import Contract]]` resolves field mapping and importer surfaces exist

### Feature Matrix Updates

- Feature note updates needed before or during execution:
  - replace example integration, E2E, and manual rows in `[[Import Existing Boxes]]` with blocked router-first scenarios
  - keep blocker evidence explicit: unresolved mapping, no backend route, and no frontend import client or UI

## Execution Phase

### Implementation Notes

Blocked by unresolved current-pipeline field mapping in `[[Import Contract]]`. This pass updates planning truth only; no importer code or automated tests should be added until mapping, backend route surface, and frontend import entry all exist.

## Wrap-Up Phase

### Verification

- Commands run:
- none; task remains blocked on contract gap, so this pass updates planning truth only
- Results:
- feature note and blocked task planning now describe concrete backend, frontend, browser, and manual scenarios instead of placeholder rows

### Final Summary

Replaced placeholder import-testing planning with concrete blocked scenarios routed through `[[Tests Index]]`. Task stays blocked until field mapping is documented and importer surfaces exist.

### Completion Gate

- [ ] Acceptance Criteria checkboxes updated to match reality
- [ ] Definition of Done checkboxes updated to match reality
- [ ] Only now may `status` change to `done`
