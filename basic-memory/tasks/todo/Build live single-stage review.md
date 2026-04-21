---
id: task-build-live-single-stage-review
title: Build live single-stage review
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
- review
- workspace
- live
permalink: video-annotator/tasks/build-live-single-stage-review
---

## Creation Phase

### Description

Replace the split playback-plus-exact-frame live harness with one single-stage live review surface that matches `[[Frontend Interaction Spec]]` while keeping backend frame truth canonical. Reuse current workspace state and shell chrome where they help, but do not keep growing the old two-pane layout.

### Scope

- In scope: live review layout, stage overlays, object rail, bottom transport or timeline region, inspector placement, and migration of existing exact-frame or manual-box or SAM2 actions into that layout
- Out of scope: brand-new export features, new backend summary contracts outside the review surface needs, or fixture-only shell tweaks

### Affected Features

- [[Review Workspace Ergonomics]]
- [[Video Ingest and Exact-Frame Review]]
- [[Annotation Foundation and Manual Box Workflow]]
- [[SAM2 Shell and Runtime]]

### Acceptance Criteria

- [ ] Live review path no longer renders separate playback and exact-frame panes as primary UX
- [ ] Single-stage review surface keeps canonical frame loading and paused-only mutating actions intact
- [ ] Existing live manual-box and SAM2 interactions remain reachable from the new layout
- [ ] Frontend integration and browser proof cover the live single-stage review surface

### Test Intent

- Backend: reuse existing live routes; no new backend-only proof unless layout work forces contract changes
- Frontend: prove live review renders one review surface and keeps real workspace actions working
- Manual: browser-check live review flow on the real harness and record any blocked controls honestly

### Definition of Done

- [ ] Relevant frontend tests pass
- [ ] Browser verification recorded honestly
- [ ] Memory updated if behavior changes
- [ ] Supporting docs updated if layout or contract changes

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
