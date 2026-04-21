---
id: task-testing-video-ingest-and-exact-frame-review
title: Testing video ingest and exact-frame review
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
- e2e
permalink: video-annotator/tasks/testing-video-ingest-and-exact-frame-review
---

## Creation Phase

### Description

Add durable backend and frontend test coverage for the video ingest and exact-frame review feature. Start from `[[Video Ingest and Exact-Frame Review]]`, carefully re-think backend integration, frontend integration, and browser E2E with the testing notes, and keep this task tied to the live exact-frame feature path rather than the new default mockup shell.

### Scope

- In scope: backend indexing and exact-frame retrieval coverage, frontend open or jump or step coverage, feature-note evidence updates, and honest manual execution records for the current shipped review flow
- Out of scope: new review UX, export work, SAM2 behavior, or any attempt to fake green coverage for decode and annotation-coupling gaps that are still unresolved

### Affected Features

- [[Video Ingest and Exact-Frame Review]]

### Testing Notes

- [[backend-api-integration-tests]]
- [[frontend-integration-tests]]
- [[e2e-tests]]

### Acceptance Criteria

- [ ] Task note explicitly re-thinks backend integration vs frontend integration vs browser E2E with help from the testing notes before choosing coverage
- [ ] Backend API integration covers startup indexing, deterministic video discovery, exact-frame fetch, and invalid-frame behavior based on real local review workflows
- [ ] Frontend integration covers the live exact-frame feature path or dedicated harness, not the default mockup shell, for selecting a video, loading an exact frame, jump and step behavior, and playback-context separation from canonical frame truth
- [ ] Browser E2E stays limited to optional smoke coverage when browser wiring itself is what needs proof
- [ ] Missing or weak behaviors stay blocked or partial in the feature note instead of being represented as fake green coverage
- [ ] Manual frontend checks are detailed enough that another operator can execute them without hidden context
- [ ] `[[Video Ingest and Exact-Frame Review]]` is updated with new evidence links and honest execution status values

### Test Intent

- Backend: prove startup indexing, deterministic local discovery, exact-frame fetch, invalid-frame rejection, and decode-failure handling against real local media workflows; backend API integration is the main automated layer for canonical `frame_idx` truth and invalid-frame behavior
- Frontend: prove the reviewer can select a video, land on the canonical frame, jump, and step without drifting to browser-time truth; frontend integration is the main automated layer for the live review screen or dedicated harness, not the default mockup shell
- Manual: verify repeated frame stability, visible playback context, and failure handling that still needs a human eye; browser E2E stays optional smoke coverage only, not the default answer for this slice

### Definition of Done

- [ ] Relevant backend tests pass
- [ ] Relevant frontend tests pass
- [ ] Feature note updated
- [ ] Manual execution status recorded honestly
- [ ] Docs or memory updated if behavior or contracts changed

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
