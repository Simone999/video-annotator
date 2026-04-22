---
title: Clean frontend shared and router boundaries
type: note
permalink: video-annotator/tasks/in-progress/clean-frontend-shared-and-router-boundaries
id: task-clean-frontend-shared-and-router-boundaries
status: in_progress
steps:
- creation
- planning
- execution
- wrap_up
tags:
- task
- frontend
- routing
- shared
- react
- architecture
---

# Clean frontend shared and router boundaries

## Creation Phase

### Description

Clean frontend structure so `frontend/src/app/` keeps app wiring only, reusable frontend primitives move under `frontend/src/shared/`, and similar route-status shells reuse one shared primitive while domain wrappers keep copy and actions feature-owned.

### Scope

- In scope: move reusable API base-url helper and Material Symbols icon wrapper into `shared/`, move router provider ownership into `app/router.tsx`, add one shared route-status shell primitive with feature-owned wrappers, keep `src/main.tsx` as style entry, and split static review chrome out of `live-review-screen.tsx`
- Out of scope: top-level `src/pages/`, backend contract changes, route URL changes, new review business logic, or centralizing all loading or error state into one featureless status system

### Affected Features

- [[Video Ingest and Exact-Frame Review]]

### Acceptance Criteria

- [ ] `frontend/src/app/` contains only app bootstrap, providers, router, and store concerns
- [ ] Reusable API base-url and icon helpers live under `frontend/src/shared/`
- [ ] `frontend/src/main.tsx` stays sole runtime style-entry import site
- [ ] Similar full-screen route loading or empty or error shells reuse one shared primitive while feature wrappers keep domain copy and actions
- [ ] Library and review route pages stay feature-owned under `frontend/src/features/*/pages/`
- [ ] Relevant frontend tests, typecheck, and lint pass

### Test Intent

- Backend: none
- Frontend: write failing-first structure coverage for app or shared boundary ownership, then keep route and feature tests green through refactor
- Manual: none planned unless automated verification exposes layout regression that needs browser confirmation

### Definition of Done

- [ ] Relevant frontend tests pass
- [ ] Frontend typecheck passes
- [ ] Frontend lint passes
- [ ] Feature and docs or memory truth updated where structure references changed

## Planning Phase

### Planned Integration Tests

- Keep `frontend/tests/integration/app/app-routes.test.tsx` green while router ownership moves into `app/router.tsx`
- Keep touched library or review screen tests green while shared status primitive and review chrome extraction land

### Planned E2E Tests

- None required for this structure-only slice unless automated route coverage reveals unexpected runtime breakage

### Planned Implementation

- Add one failing structure test for shared helper ownership, shared route-status primitive, feature wrappers, and router module owning `BrowserRouter`
- Move reusable helpers into `frontend/src/shared/` and update imports plus tests
- Add shared route-status shell primitive and refactor library or review status panels into thin wrappers
- Move `BrowserRouter` ownership into `frontend/src/app/router.tsx` and keep `providers.tsx` non-router only
- Split static review top bar and rail into small feature-owned components without changing route or workspace behavior

### Feature Matrix Updates

- Update [[Video Ingest and Exact-Frame Review]] only if current-state or architecture wording becomes stale after structure cleanup

## Execution Phase

### Implementation Notes

- Started implementation session from approved plan and locked choices: keep `src/main.tsx`, keep feature-owned route pages, use shared primitive plus feature wrappers for similar route-status shells.

## Wrap-Up Phase

### Verification

- Commands run:
- Results:

### Final Summary

### Completion Gate

- [ ] Acceptance Criteria checkboxes updated to match reality
- [ ] Definition of Done checkboxes updated to match reality
- [ ] Only now may `status` change to `done`