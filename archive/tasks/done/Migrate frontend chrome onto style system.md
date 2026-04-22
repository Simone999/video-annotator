---
id: task-migrate-frontend-chrome-onto-style-system
title: Migrate frontend chrome onto style system
status: done
completed: 2026-04-22 04:53:40 CEST
steps:
- creation
- planning
- execution
- wrap_up
tags:
- task
- frontend
- styles
- routes
- mockup
permalink: video-annotator/tasks/done/migrate-frontend-chrome-onto-style-system
---

# Migrate frontend chrome onto style system

## Creation Phase

### Description

Move whole frontend route chrome and shared repeated component styling onto the new style system, while keeping runtime values honest and one-off layout utilities inline.

Read first:
- [[Workflow]]
- [[Video Ingest and Exact-Frame Review]]
- [[SAM2 Shell and Runtime]]
- `docs/ui/DESIGN.md`
- `docs/ui/video-library.html`
- `docs/ui/video-annotation.html`
- [[Extract frontend style foundation]]

Stage-2 rule: write concrete tests and implementation plan before code. Use one subagent review before task close.

### Scope

- In scope: library route, review route, route status panels, not-found route, repeated chrome classes, Material Symbols wrapper, and migration off long repeated inline class strings where the new utility classes fit.
- Out of scope: backend contracts, fake data, screenshot artifact capture, or standalone Storybook screenshot automation.

### Affected Features

- [[Video Ingest and Exact-Frame Review]]
- [[SAM2 Shell and Runtime]]

### Acceptance Criteria

- [x] `/`, `/review/:videoId`, library status, review status, and not-found surfaces use the new shared style system.
- [x] Repeated chrome moves into named CSS classes; one-off grid and spacing can stay inline.
- [x] Route data stays honest; no fake confidence, corrected counts, or exported truth is invented to match mockups.

### Test Intent

- Frontend: add failing integration or component assertions for new route or status shell classes and unchanged user-visible behavior.
- Manual: browser smoke only after code lands, mainly for later screenshot task.

### Definition of Done

- [x] Planning phase records concrete tests and implementation plan before code.
- [x] Relevant tests and quality checks pass.
- [x] Own review plus subagent review findings are handled.
- [x] Feature notes and task note are updated honestly when route chrome truth changes.

## Planning Phase

### Planned Integration Tests

- Frontend:
  - update route and screen tests for library, review, app routes, and status panels
  - assert `app-topbar`, `app-rail`, `metric-strip`, `video-card-shell`, `route-status-screen`, `route-status-card`, and workspace shell classes render on the right surfaces
  - keep existing behavior assertions for navigation, status copy, and honest placeholder values

### Planned E2E Tests

- Frontend:
  - no new committed browser suite in this slice
  - one manual smoke on local stack before screenshot task if needed to catch obvious CSS regressions

### Planned Implementation

- Step 1: write failing route or status shell assertions first.
- Step 2: add shared icon wrapper and migrate repeated chrome classes across library, review, status, and not-found surfaces.
- Step 3: keep one-off layout utilities inline and do not over-abstract leaf layout.
- Step 4: run frontend integration, typecheck, lint, and test commands needed for touched files.

### Feature Matrix Updates

- update feature-note current-state wording if the style system becomes the new route-chrome source

## Execution Phase

### Implementation Notes

- Wrote failing integration assertions first in `frontend/tests/integration/video-library/video-library-screen.test.tsx`, `frontend/tests/integration/video-review/live-review-screen.test.tsx`, and `frontend/tests/integration/app/app-routes.test.tsx` for `app-topbar`, `app-rail`, `metric-strip`, `video-card-shell`, `route-status-screen`, `route-status-card`, and workspace shell classes.
- Added shared icon wrapper `frontend/src/app/material-symbol-icon.tsx` and switched library or review chrome icons onto one Material Symbols path instead of duplicated ad-hoc wrappers.
- Migrated repeated route chrome and status surfaces onto shared classes in `frontend/src/styles/utilities.css`, including top bars, rails, route status cards, workspace panels, metric strips, video cards, and timeline shell.
- Restyled library and review components to use shared classes while keeping runtime data honest, including route status panels, not-found route shell, selected-object inspector, and transport footer.
- Kept selected-range timeline work out of scope. Transport footer now matches the style system without inventing new range behavior.
- User corrected the token-layer requirement during execution: `tokens.css` stays the filename and uses plain `@theme { ... }` sourced from `docs/ui/DESIGN.md`.
- One subagent reviewer covered the touched slice after local verification; no actionable findings were returned.

## Wrap-Up Phase

### Verification

- Commands run:
- `npm --workspace frontend exec -- vitest run --coverage=false tests/integration/video-library/video-library-screen.test.tsx tests/integration/video-review/live-review-screen.test.tsx tests/integration/app/app-routes.test.tsx`
- `npm --workspace frontend exec -- prettier --check src/main.tsx src/app/App.tsx src/app/router.tsx src/app/material-symbol-icon.tsx src/features/video-library/components/video-library-icon.tsx src/features/video-library/components/video-library-header.tsx src/features/video-library/components/video-library-sidebar.tsx src/features/video-library/components/video-library-summary-metrics.tsx src/features/video-library/components/video-library-filters.tsx src/features/video-library/components/video-library-video-card.tsx src/features/video-library/components/video-library-status-panel.tsx src/features/video-library/components/video-library-screen.tsx src/features/video-review/components/live-review-screen.tsx src/features/video-review/components/review-route-status-panel.tsx src/features/video-review/components/review-video-list-panel.tsx src/features/video-review/components/review-surface-panel.tsx src/features/video-review/components/review-inspector-panel.tsx src/features/video-review/components/review-transport-controls.tsx src/styles/app.css src/styles/tokens.css src/styles/base.css src/styles/utilities.css tests/unit/tooling/frontend-style-entry.test.ts tests/integration/video-library/video-library-screen.test.tsx tests/integration/video-review/live-review-screen.test.tsx tests/integration/app/app-routes.test.tsx`
- `npm --workspace frontend exec -- prettier --write src/features/video-review/components/live-review-screen.tsx src/features/video-review/components/review-video-list-panel.tsx tests/integration/app/app-routes.test.tsx`
- `npm --workspace frontend exec -- eslint src/main.tsx src/app/App.tsx src/app/router.tsx src/app/material-symbol-icon.tsx src/features/video-library/components/video-library-icon.tsx src/features/video-library/components/video-library-header.tsx src/features/video-library/components/video-library-sidebar.tsx src/features/video-library/components/video-library-summary-metrics.tsx src/features/video-library/components/video-library-filters.tsx src/features/video-library/components/video-library-video-card.tsx src/features/video-library/components/video-library-status-panel.tsx src/features/video-library/components/video-library-screen.tsx src/features/video-review/components/live-review-screen.tsx src/features/video-review/components/review-route-status-panel.tsx src/features/video-review/components/review-video-list-panel.tsx src/features/video-review/components/review-surface-panel.tsx src/features/video-review/components/review-inspector-panel.tsx src/features/video-review/components/review-transport-controls.tsx tests/unit/tooling/frontend-style-entry.test.ts tests/integration/video-library/video-library-screen.test.tsx tests/integration/video-review/live-review-screen.test.tsx tests/integration/app/app-routes.test.tsx --max-warnings=0`
- `npm --workspace frontend run typecheck`
- Results:
- Targeted frontend integration passed: `25` tests green across library route, review route, and app-route shells. jsdom still prints expected `HTMLMediaElement` play or pause not-implemented warnings during review tests.
- Prettier check first failed on three touched files, formatter was applied, and re-check passed.
- ESLint passed on all touched TypeScript runtime and test files.
- Frontend `typecheck` passed on current task-2 slice.

### Final Summary

- Library, review, status, and not-found surfaces now use shared route-chrome classes from `frontend/src/styles/` instead of long repeated ad-hoc strings.
- `main.tsx` still owns the single global style entry, `tokens.css` now carries the `DESIGN.md` token layer via plain `@theme { ... }`, and repeated icons now flow through one Material Symbols wrapper.
- The live review surface, inspector, and transport shell visually align with the mockup language while still rendering only honest backend-backed values or placeholders.

### Completion Gate

- [x] Acceptance Criteria checkboxes updated to match reality
- [x] Definition of Done checkboxes updated to match reality
- [x] Only now may `status` change to `done`
