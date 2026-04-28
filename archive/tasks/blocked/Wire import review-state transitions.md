---
title: Wire import review-state transitions
type: note
permalink: video-annotator/tasks/wire-import-review-state-transitions
id: task-wire-import-review-state-transitions
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
- backend
- import
- m-6
- states
---

# Wire import review-state transitions

## Creation Phase

### Description

Wire import-write behavior into existing review-state derivation so imported work moves videos to `started` and resets reviewed or exported work honestly on reimport. Derivation groundwork already exists. Remaining work is import-write behavior plus reimport reset semantics after `[[Add import API and validation]]` lands.

Read first:
- [[Workflow]]
- [[Import Existing Boxes]]
- [[Video Ingest and Exact-Frame Review]]
- [[API]]
- [[Data Model]]
- `backend/app/services/review_summaries.py`
- import contract and API task notes once updated

Stage-2 rule: in planning phase, write concrete test plan and implementation plan first. In execution, follow written plan. Before `done`, run own review plus 2 subagent reviews and fix actionable findings.

### Scope

- In scope: import-write behavior that triggers existing review-state derivation, reimport reset over reviewed or exported work, and honest persisted state after import
- Out of scope: frontend UI or rebuilding already-shipped derivation groundwork

### Affected Features

- [[Import Existing Boxes]]
- [[Video Ingest and Exact-Frame Review]]

### Acceptance Criteria

- [ ] Import writes move video state to `started` with honest summary facts using already-landed derivation groundwork
- [ ] Reimport over reviewed or exported work resets state per PRD rules
- [ ] Task stays blocked until import route and mapping truth exist

### Test Intent

- Backend: integration coverage for import-driven review-state transitions once unblocked
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
