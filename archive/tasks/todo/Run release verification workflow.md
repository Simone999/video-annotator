---
title: Run release verification workflow
type: note
permalink: video-annotator/tasks/run-release-verification-workflow
id: task-run-release-verification-workflow
status: todo
completed:
steps:
- creation
- planning
- execution
- wrap_up
tags:
- task
- tests
- release
- m-7
- verification
---

# Run release verification workflow

## Creation Phase

### Description

Run release verification matrix across actionable v1 flows and record any still-blocked scope honestly.
Treat committed `docs/ui/video-library.png` and `docs/ui/video-review-1920x1080.png` as current 1920x1080 route truth during release verification. Use matching HTML mockups as guides only, not strict contract.

Read first:
- [[Workflow]]
- [[Spec and PRD roadmap parity audit 2026-04-22]]
- [[Stabilize frontend Vitest media environment and clean per-test teardown]]
- [[Video Ingest and Exact-Frame Review]]
- [[SAM2 Shell and Runtime]]
- [[Mask Editing and Cleanup]]
- [[Export]]
- `basic-memory/tests/e2e-tests.md`
- `docs/ui/video-library.png`
- `docs/ui/video-library.html`
- `docs/ui/video-review-1920x1080.png`
- `docs/ui/video-review.html`

Stage-2 rule: in planning phase, write concrete test plan and implementation plan first. In execution, follow written plan. Before `done`, run own review plus 2 subagent reviews and fix actionable findings.

### Scope

- In scope: cross-feature verification for review, SAM2, cleanup, export, Docker E2E workflow, 1920x1080 library/review route proof, and honest note of still-blocked import scope
- Out of scope: new feature implementation beyond fixes required to make verification trustworthy or intentional route redesign
- Precondition: repo `npm run test` must already pass from a clean start before this task begins the release matrix

### Affected Features

- [[Video Ingest and Exact-Frame Review]]
- [[SAM2 Shell and Runtime]]
- [[Mask Editing and Cleanup]]
- [[Export]]

### Acceptance Criteria

- [ ] Release verification matrix covers all actionable v1 flows with fresh evidence
- [ ] Still-blocked import scope is called out honestly instead of treated as passed
- [ ] Any actionable verification drift found in scope is fixed or routed before close
- [ ] Fresh 1920x1080 browser evidence confirms current library and review route direction still matches committed `docs/ui` PNG truth

### Test Intent

- Backend: run milestone-spanning backend checks required by verification matrix
- Frontend: run milestone-spanning frontend and browser checks required by verification matrix
- Manual: run final browser or Docker-smoke proof at 1920x1080 for current library and review routes

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
