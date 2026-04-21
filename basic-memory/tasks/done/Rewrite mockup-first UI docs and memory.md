---
title: Rewrite mockup-first UI docs and memory
type: task
permalink: video-annotator/tasks/in-progress/rewrite-mockup-first-ui-docs-and-memory
id: task-rewrite-mockup-first-ui-docs-and-memory
status: done
completed: 2026-04-21
steps:
- creation
- planning
- execution
- wrap_up
tags:
- task
- docs
- frontend
- api
- memory
---

## Creation Phase

### Description

Rewrite repo docs, mockup files, and current-truth memory notes so they match the agreed mockup-first library and single-stage review model.

### Scope

- In scope: PRD and engineering docs, `docs/ui` mockups, current-truth feature/spec/decision memory notes, and superseded markers for stale historical docs.
- Out of scope: runtime backend or frontend feature implementation, migrations, and API handlers.

### Affected Features

- [[Video Ingest and Exact-Frame Review]]
- [[Review Workspace Ergonomics]]
- [[SAM2 Shell and Runtime]]
- [[Export]]

### Acceptance Criteria

- [x] Current-truth docs describe a single review surface with playback and overlayed annotations instead of separate playback and exact-frame panes
- [x] Video-library docs describe selection flow, five-state review model, and propagation-only progress bar behavior
- [x] API and data-model docs describe nullable mask confidence and dedicated selected-object summary contract with bbox and track-summary fields
- [x] `docs/ui/video-library.html` removes the `Import Video` action and stays aligned with the agreed library behavior
- [x] Historical docs that still describe the superseded two-pane model are clearly archived or marked superseded
- [x] Current-truth memory notes and one durable decision note are updated to match the same model

### Test Intent

- Backend: no runtime changes in this pass; verify contract wording stays internally consistent with existing canonical frame rules.
- Frontend: verify mockup and current-truth UX docs agree on library screen and single-stage review model.
- Manual: render mockups with Playwright and inspect that the documented library screen matches the edited HTML.

### Definition of Done

- [x] Relevant docs updated
- [x] Relevant memory updated
- [x] Mockup render checked
- [x] Verification evidence recorded honestly

## Planning Phase

### Planned Integration Tests

- Backend: none; this is a docs-and-memory alignment pass
- Frontend: none; verify via search consistency and Playwright render of static mockups

### Planned E2E Tests

- Backend: none
- Frontend: render `docs/ui` mockups with Playwright after edits and inspect key changes

### Planned Implementation

- Step 1: update repo docs and mockups to match agreed UI and API contracts
- Step 2: update current-truth memory notes and add durable decision note
- Step 3: mark stale historical docs superseded and verify no live docs still claim separate playback and exact-frame panes

### Feature Matrix Updates

- Update affected feature notes and repo-state summary so they route readers to the new single-stage review model and library-state semantics

## Execution Phase

### Implementation Notes

- Work started from agreed plan in session dated 2026-04-21.
- Scope explicitly limited to docs, mockups, and memory truth.

## Wrap-Up Phase

### Verification

- Commands run:
  - `git diff --check`
  - `rg -n "Import Video|review_progress|playback pane|exact-frame pane|exact-frame canvas" docs basic-memory`
  - `./node_modules/.bin/playwright screenshot --full-page --viewport-size=1440,1100 --color-scheme=dark file:///home/simone/projects/video-annotator/docs/ui/video-library.html /tmp/video-library-mockup-updated.png`
  - `./node_modules/.bin/playwright screenshot --full-page --viewport-size=1440,1100 --color-scheme=dark file:///home/simone/projects/video-annotator/docs/ui/video-annotation.html /tmp/video-annotation-mockup-updated.png`
- Results:
  - `git diff --check` returned clean output.
  - Grep hits after fixes were limited to explicit current-truth negations and clearly archived historical docs or notes.
  - Updated Playwright renders were captured for both mockups and copied into `docs/ui/video-library-mockup.png` and `docs/ui/video-annotation-mockup.png`.

### Final Summary

Repo docs, UI mockups, and current-truth memory now align on mockup-first library flow, single-stage playback-plus-overlay review, derived library state/progress semantics, nullable mask confidence, and selected-object inspector summary contract.

### Completion Gate

- [x] Acceptance Criteria checkboxes updated to match reality
- [x] Definition of Done checkboxes updated to match reality
- [x] Only now may `status` change to `done`
