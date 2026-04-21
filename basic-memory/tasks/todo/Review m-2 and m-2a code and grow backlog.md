---
id: task-review-m2-and-m2a-code-and-grow-backlog
title: Review m-2 and m-2a code and grow backlog
status: todo
completed: null
steps:
- creation
- planning
- execution
- wrap_up
tags:
- task
- review
- backlog
- roadmap
- milestone
permalink: video-annotator/tasks/review-m2-and-m2a-code-and-grow-backlog
---

## Creation Phase

### Description

Review current code against `[[m-2: Review Workspace Completion]]` and `[[m-2a: Mockup UI Shell]]`. Write one detailed report note, create concrete fix tasks from the gaps, append matching fix stories to `tools/ralph/prd.json`, then append a cloned copy of this review task after those new fix stories so the review or fix loop continues.

### Scope

- In scope: audit current frontend, backend contracts, tests, and backlog shape against `m-2` and `m-2a`; write one durable report note; create todo task notes for concrete fixes; append matching Ralph stories; append one follow-up re-review story after the new fix stories
- Out of scope: implementing the fixes in the same task, deleting existing backlog items, or archiving current todo tasks

### Affected Features

- [[Review Workspace Ergonomics]]
- [[Video Ingest and Exact-Frame Review]]
- [[Annotation Foundation and Manual Box Workflow]]

### Acceptance Criteria

- [ ] One durable report note exists with clear sections for what is good, what is missing, what is wrong, and what should improve
- [ ] Every concrete gap chosen for implementation becomes one todo task note with enough context for a clean-session implementer
- [ ] Matching fix stories are appended to `tools/ralph/prd.json`
- [ ] One cloned re-review story is appended after the new fix stories so the loop can run again later
- [ ] Task note wrap-up records exactly which report note and which new tasks or stories were created

### Test Intent

- Backend: none
- Frontend: none
- Manual: verify report note exists, new fix tasks exist, Ralph story order is correct, and the cloned re-review story sits after the newly added fix stories

### Definition of Done

- [ ] Report note created
- [ ] New fix task notes created
- [ ] `tools/ralph/prd.json` updated
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
