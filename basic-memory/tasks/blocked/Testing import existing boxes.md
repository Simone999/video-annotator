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
- [ ] Backend and frontend e2e scenarios are defined from real migration workflows, and blocked honestly until the unresolved mapping is fixed
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

- Backend: keep importer verification blocked until mapping and persistence contracts are durable
- Frontend: keep import validation behavior blocked until a real UI or API surface exists

### Planned E2E Tests

- Backend: define future importer end-to-end workflows from real migration scenarios but keep them blocked until the contract is real
- Frontend: define future browser import validation workflow but keep it blocked until UI exists

### Planned Implementation

- Read `[[Import Existing Boxes]]` and `[[Import Contract]]`
- Do not guess missing field mapping
- Keep the task blocked until pipeline mapping becomes durable memory

### Feature Matrix Updates

- Before coding: keep blocked rows and unblock conditions accurate in `[[Import Existing Boxes]]`
- After verification: add any new contract evidence and honest blocked status values in the feature note

## Execution Phase

### Implementation Notes

Write progress, decisions, blockers, and manual-test observations here while work is active.

## Wrap-Up Phase

### Verification

- Commands run:
- Results:

### Final Summary

Summarize blocker state, future entry conditions, and any new contract evidence.
