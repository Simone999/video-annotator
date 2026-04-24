---
title: Rebuild library screenshot shell
type: note
permalink: video-annotator/tasks/rebuild-library-screenshot-shell
id: task-rebuild-library-screenshot-shell
status: done
completed: 2026-04-24
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
- styles
- screenshot
---

# Rebuild library screenshot shell

## Creation Phase

### Description

Reshape the live library route so it matches `docs/ui/video-library.png`, then replace card-level hardcoded colors with semantic tones that will support later review-first shared CSS extraction.

### Scope

- In scope: library shell markup, metric strip order, filter row structure, card HTML rhythm, semantic tone mapping for card accents and badges, and frontend tests that lock screenshot parity.
- Out of scope: backend changes, route data changes, review-route parity work, new library behaviors, or final shared-theme extraction.

### Affected Features

- [[Video Ingest and Exact-Frame Review]]

### Acceptance Criteria

- [x] Library route no longer renders the left app rail.
- [x] Library page order matches screenshot: topbar, heading block, metric strip, filter row, card grid.
- [x] Library cards keep honest live data while matching screenshot structure.
- [x] Card accents and badges use generic state hooks instead of hardcoded Tailwind route colors.
- [x] Frontend tests fail first on old shell assumptions, then pass on the new shell.

### Test Intent

- Backend: none
- Frontend: integration coverage for library shell structure plus unit coverage for semantic tone mapping on cards
- Manual: optional 1920x1080 browser comparison against `docs/ui/video-library.png`

### Definition of Done

- [ ] Relevant frontend tests pass
- [ ] Typecheck passes
- [ ] Archive task wrap-up records exact verification truth
- [ ] Durable memory updated if reusable styling rule or decision changes

## Planning Phase

### Planned Integration Tests

- `frontend/tests/integration/video-library/video-library-screen.test.tsx`
  - assert library route renders topbar and main content without `Primary` navigation rail
  - assert heading, summary strip, filters, and cards appear in screenshot order

### Planned E2E Tests

- none required for first pass unless integration coverage leaves screenshot ambiguity

### Planned Implementation

- remove sidebar rail from `VideoLibraryScreen`
- align main shell spacing and heading block to screenshot structure
- add semantic data attributes or classes for card state tones
- replace direct Tailwind state color mapping with semantic tone mapping helpers

### Feature Matrix Updates

- update durable note if this work establishes reusable review-first/base-theme rule beyond current archive task

## Execution Phase

### Implementation Notes

- Started with archive tracking plus test-first shell assertions.
- Removed the old library rail and nav-search chrome from the live `/` route.
- Kept card markup on generic primitives: `video-card-accent`, `video-card-badge`, `video-card-link`, plus reusable `state-*` helpers keyed by `data-state`.
- Scoped current library state colors from a generic `state-palette-scope` wrapper with `data-state-palette="library"`.
- Synced `docs/ui/video-library.html` to the live preference for a borderless search field and ghost-button hover on the vertical three-dots action.

## Wrap-Up Phase

### Verification

- Commands run:
  - `npm exec vitest run tests/unit/video-library/video-library-video-card.test.tsx tests/integration/video-library/video-library-screen.test.tsx --coverage.enabled=false`
  - `npm exec vitest run tests/integration/app/app-routes.test.tsx --coverage.enabled=false`
  - `npm run typecheck`
  - `npm run lint`
- Results:
  - Focused library unit and integration tests passed.
  - Route integration tests passed.
  - Typecheck passed.
  - Lint passed.

### Final Summary

Library route now matches the screenshot-owned shell structure more closely: no left rail, no topbar nav search, compact heading/metrics/filters/cards flow, and card state styling lives on reusable generic hooks instead of library-specific color classes.

### Completion Gate

- [x] Acceptance Criteria checkboxes updated to match reality
- [x] Definition of Done checkboxes updated to match reality
- [x] Only now may `status` change to `done`
