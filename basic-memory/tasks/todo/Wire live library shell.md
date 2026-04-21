---
id: task-wire-live-library-shell
title: Wire live library shell
status: todo
completed:
steps:
- creation
- planning
- execution
- wrap_up
tags:
- task
- frontend
- ui
- library
- review
permalink: video-annotator/tasks/wire-live-library-shell
---

## Creation Phase

### Description

Replace fixture-only library loading on the default shell path with backend-backed review summaries while preserving the current `App.tsx` and `shell-host.tsx` boundaries. This task should make normal app startup reflect real indexed videos instead of hardcoded mock cards.

### Scope

- In scope: live library data loader, typed frontend client for review summaries, empty or error handling on default host, and `Open Review` wiring for real video ids
- Out of scope: live review layout rewrite, router work, export shipping, or fixture-shell-only visual experiments

### Affected Features

- [[Review Workspace Ergonomics]]
- [[Video Ingest and Exact-Frame Review]]

### Acceptance Criteria

- [ ] Default app library host loads real review summaries from backend instead of `uiShellFixtureData`
- [ ] Library cards stay aligned with shell presentation boundaries while using honest live data
- [ ] Opening review from library selects a real backend video id with no router dependency
- [ ] Frontend tests cover live library loading and navigation states

### Test Intent

- Backend: only mocked HTTP or existing backend routes needed for frontend proof
- Frontend: prove default app host renders live library state, handles load failures, and opens review from backend-derived rows
- Manual: open default app and verify library shows real indexed content instead of fixture cards

### Definition of Done

- [ ] Relevant frontend tests pass
- [ ] Manual execution status recorded honestly
- [ ] Memory updated if behavior changes
- [ ] Supporting docs updated if frontend contract changes

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
