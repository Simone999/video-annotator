---
title: Define current-pipeline import contract
type: note
permalink: video-annotator/tasks/define-current-pipeline-import-contract
id: task-define-current-pipeline-import-contract
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
- import
- m-6
- contract
---

# Define current-pipeline import contract

## Creation Phase

### Description

Resolve current-pipeline import contract from real source material before any importer code lands. This task owns both field mapping truth and reimport overwrite or reset semantics against existing review data. Search repo and memory first. If contract still missing, ask user and record answer in durable memory instead of guessing.

Read first:
- [[Workflow]]
- [[Import Existing Boxes]]
- [[Import Contract]]
- [[Product Requirements]]
- [[Frontend Interaction Spec]]
- search repo for current-pipeline samples, docs, or prior mapping notes before asking user

Stage-2 rule: in planning phase, write concrete test plan and implementation plan first. In execution, follow written plan. Before `done`, run own review plus 2 subagent reviews and fix actionable findings.

### Scope

- In scope: field mapping truth, source examples, import payload shape, overwrite or reset rules for reimport, explicit unresolved fields, and durable memory or spec update for importer work
- Out of scope: importer code, API routes, or UI before contract truth exists

### Affected Features

- [[Import Existing Boxes]]

### Acceptance Criteria

- [ ] Real current-pipeline field mapping and reimport overwrite or reset semantics are written down in durable memory or spec, or exact external blocker is recorded without guesses
- [ ] Task records what source material was searched before any user question
- [ ] Later import tasks can point to one canonical contract note instead of chat context

### Test Intent

- Backend: define future importer tests only after mapping truth exists
- Frontend: none
- Manual: none

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
