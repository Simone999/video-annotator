---
id: task-ship-review-summary-contracts
title: Ship review summary contracts
status: todo
completed:
steps:
- creation
- planning
- execution
- wrap_up
tags:
- task
- backend
- api
- review
- frontend
permalink: video-annotator/tasks/ship-review-summary-contracts
---

## Creation Phase

### Description

Add backend-derived summary contracts that let live library cards and live review inspector show honest persisted review state instead of fixture-only copy. Start from `backend/app/api/videos.py`, `backend/app/schemas/video.py`, and existing annotation storage truth before any frontend rewiring.

### Scope

- In scope: library-card summary fields, derived review state, last-reviewed or annotated summary fields, selected-object summary data needed for inspector counters or confidence display, and backend tests for those payloads
- Out of scope: replacing shell fixtures in the default app host, rebuilding the live review layout, shipping export artifacts, or adding keyboard controls

### Affected Features

- [[Review Workspace Ergonomics]]
- [[Video Ingest and Exact-Frame Review]]
- [[Annotation Foundation and Manual Box Workflow]]

### Acceptance Criteria

- [ ] Backend exposes derived summary fields needed to drive live library cards from persisted review facts instead of fixtures
- [ ] Backend exposes selected-object summary fields needed for live inspector range counters or explicitly documents the smallest additional route that owns them
- [ ] State derivation stays honest about unshipped export behavior instead of inventing fake runtime truth
- [ ] Backend integration tests cover the new summary behavior

### Test Intent

- Backend: prove derived review summary payloads from real persisted rows and exact frame or annotation state
- Frontend: none in this task; frontend wiring belongs to follow-up tasks
- Manual: inspect returned payloads and confirm they match existing persisted review facts

### Definition of Done

- [ ] Relevant backend tests pass
- [ ] Memory updated if contract truth changes
- [ ] Supporting docs updated if API contract changes
- [ ] Verification recorded honestly

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
