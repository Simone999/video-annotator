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

Add durable backend and frontend test coverage for the video ingest and exact-frame review feature. Start from `[[Video Ingest and Exact-Frame Review]]`, refine the scenarios around real reviewer behavior, and record manual execution honestly in that feature note.

### Scope

- In scope: backend indexing and exact-frame retrieval coverage, frontend open or jump or step coverage, feature-note evidence updates, and honest manual execution records for the current shipped review flow
- Out of scope: new review UX, export work, SAM2 behavior, or any attempt to fake green coverage for decode and annotation-coupling gaps that are still unresolved

### Affected Features

- [[Video Ingest and Exact-Frame Review]]

### Acceptance Criteria

- [ ] Backend API integration covers startup indexing, deterministic video discovery, exact-frame fetch, and invalid-frame behavior based on real local review workflows
- [ ] Frontend integration covers selecting a video, loading an exact frame, jump and step behavior, and playback-context separation from canonical frame truth
- [ ] Browser E2E stays limited to optional smoke coverage when browser wiring itself is what needs proof
- [ ] Missing or weak behaviors stay blocked or partial in the feature note instead of being represented as fake green coverage
- [ ] Manual frontend checks are detailed enough that another operator can execute them without hidden context
- [ ] `[[Video Ingest and Exact-Frame Review]]` is updated with new evidence links and honest execution status values

### Test Intent

- Backend: prove startup indexing, deterministic local discovery, exact-frame fetch, invalid-frame rejection, and decode-failure handling against real local media workflows
- Frontend: prove the reviewer can select a video, land on the canonical frame, jump, and step without drifting to browser-time truth
- Manual: verify repeated frame stability, visible playback context, and failure handling that still needs a human eye

### Default automated boundary

- Frontend integration is the default for shipped open video, load frame, jump, next, previous, and visible canonical-frame UI behavior
- Backend API integration is the default for canonical `frame_idx` truth, exact-frame contract, invalid-frame bounds, and startup indexing behavior
- Browser E2E is optional smoke coverage only, not the default answer for this feature slice

### Definition of Done

- [ ] Relevant backend tests pass
- [ ] Relevant frontend tests pass
- [ ] Feature note updated
- [ ] Manual execution status recorded honestly
- [ ] Docs or memory updated if behavior or contracts changed

## Planning Phase

### Planned Integration Tests

- Backend: freeze startup indexing, deterministic discovery, exact-frame fetch, and invalid-frame handling against local media fixtures
- Frontend: freeze review-state selection, exact-frame load, jump, and step behavior while keeping backend frame truth canonical

### Planned E2E Tests

- Browser smoke only: cover one real reviewer path such as open video, load frame, and step behavior when browser wiring itself is the value under test
- Do not add browser E2E just because similar lower-layer tests already exist

### Planned Implementation

- Read `[[Video Ingest and Exact-Frame Review]]`, `[[API]]`, `[[Architecture]]`, and `[[Test Plan]]`
- Re-check the current shipped behavior against real reviewer workflows before choosing tests
- Prefer frontend integration for open, jump, step, and canonical-frame UI behavior
- Prefer backend API integration for exact-frame truth and invalid-frame behavior
- Add browser E2E only for one smoke path when lower layers are not enough
- Update the feature note tables before and after implementing tests

### Feature Matrix Updates

- Before coding: refine planned rows in `[[Video Ingest and Exact-Frame Review]]` if concrete scenarios change
- After verification: add evidence links and honest manual status values in the feature note

## Execution Phase

### Implementation Notes

Write progress, decisions, blockers, and manual-test observations here while work is active.

## Wrap-Up Phase

### Verification

- Commands run:
- Results:

### Final Summary

Summarize new coverage, blocked gaps, and manual verification evidence.
