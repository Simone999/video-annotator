---
id: task-migrate-frontend-chrome-onto-style-system
title: Migrate frontend chrome onto style system
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
- styles
- routes
- mockup
permalink: video-annotator/tasks/todo/migrate-frontend-chrome-onto-style-system
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

Stage-2 rule: write concrete tests and implementation plan before code. Use subagent review before task close.

### Scope

- In scope: library route, review route, route status panels, not-found route, repeated chrome classes, Material Symbols wrapper, and migration off long repeated inline class strings where the new utility classes fit.
- Out of scope: backend contracts, fake data, screenshot artifact capture, or standalone Storybook screenshot automation.

### Affected Features

- [[Video Ingest and Exact-Frame Review]]
- [[SAM2 Shell and Runtime]]

### Acceptance Criteria

- [ ] `/`, `/review/:videoId`, library status, review status, and not-found surfaces use the new shared style system.
- [ ] Repeated chrome moves into named CSS classes; one-off grid and spacing can stay inline.
- [ ] Route data stays honest; no fake confidence, corrected counts, or exported truth is invented to match mockups.

### Test Intent

- Frontend: add failing integration or component assertions for new route or status shell classes and unchanged user-visible behavior.
- Manual: browser smoke only after code lands, mainly for later screenshot task.

### Definition of Done

- [ ] Planning phase records concrete tests and implementation plan before code.
- [ ] Relevant tests and quality checks pass.
- [ ] Own review plus subagent review findings are handled.
- [ ] Feature notes and task note are updated honestly when route chrome truth changes.

## Planning Phase

### Planned Integration Tests

- Frontend:
  - update route and screen tests for library, review, app routes, and status panels
  - assert new shared shell classes render on route and status surfaces
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