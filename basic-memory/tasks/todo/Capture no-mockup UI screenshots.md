---
id: task-capture-no-mockup-ui-screenshots
title: Capture no-mockup UI screenshots
status: todo
completed: null
steps:
- creation
- planning
- execution
- wrap_up
tags:
- task
- frontend
- screenshots
- storybook
- docs-ui
permalink: video-annotator/tasks/todo/capture-no-mockup-ui-screenshots
---

# Capture no-mockup UI screenshots

## Creation Phase

### Description

Save screenshot artifacts in `docs/ui` for route states and standalone panels that have no existing mockup, after the new style system is fully live.

Read first:
- [[Workflow]]
- [[Video Ingest and Exact-Frame Review]]
- [[SAM2 Shell and Runtime]]
- [[Migrate frontend chrome onto style system]]
- `docs/ui/DESIGN.md`

Stage-2 rule: write concrete tests and implementation plan before code. Use subagent review before task close.

### Scope

- In scope: route-state screenshots, standalone status-panel stories, Exact Frame Canvas screenshot, saved files under `docs/ui`, and honest memory verification notes.
- Out of scope: new route behavior, backend changes, or screenshot coverage for every leaf component.

### Affected Features

- [[Video Ingest and Exact-Frame Review]]
- [[SAM2 Shell and Runtime]]

### Acceptance Criteria

- [ ] `docs/ui` contains committed screenshots for no-mockup route states and standalone panels agreed in the plan.
- [ ] `VideoLibraryStatusPanel` and `ReviewRouteStatusPanel` have standalone stories or equivalent render targets for screenshot capture.
- [ ] Screenshot evidence reflects current real CSS and honest runtime state.

### Test Intent

- Frontend: add failing structural tests for required stories or screenshot targets and expected `docs/ui` artifact files.
- Manual: capture route-state screenshots from fresh local stack and standalone panel screenshots from Storybook.

### Definition of Done

- [ ] Planning phase records concrete tests and implementation plan before code.
- [ ] Relevant tests and quality checks pass.
- [ ] Own review plus subagent review findings are handled.
- [ ] Feature notes, task note, and memory notes record screenshot truth honestly.

## Planning Phase

### Planned Integration Tests

- Frontend:
  - add a tooling-style test that asserts required screenshot files exist in `docs/ui`
  - add or update story coverage assertions if needed for new standalone status-panel stories

### Planned E2E Tests

- Frontend:
  - manual browser screenshot capture for route states from fresh local stack
  - manual Storybook screenshot capture for standalone panels

### Planned Implementation

- Step 1: write failing file or story existence tests first.
- Step 2: add status-panel stories and any light wrapper needed for clean standalone rendering.
- Step 3: capture route and standalone screenshots and save them under `docs/ui`.
- Step 4: record screenshot paths and capture truth in memory.

### Feature Matrix Updates

- update recent verification or manual evidence sections if screenshot artifacts become new durable references

## Execution Phase

### Implementation Notes

- pending

## Wrap-Up Phase

### Verification

- Commands run:
- Results:

### Final Summary

- pending

### Completion Gate

- [ ] Acceptance Criteria checkboxes updated to match reality
- [ ] Definition of Done checkboxes updated to match reality
- [ ] Only now may `status` change to `done`