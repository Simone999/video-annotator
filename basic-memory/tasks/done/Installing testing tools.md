---
id: task-install-testing-tools
title: Installing testing tools
status: done
completed: 2026-04-20
steps:
- creation
- planning
- execution
- wrap_up
tags:
- task
- testing
- tooling
- frontend
- backend
permalink: video-annotator/tasks/installing-testing-tools
---

## Creation Phase

### Description

Bring repo manifests and shared test scaffolding in line with durable testing-guidance notes so future test work can use documented tools without ad-hoc setup.

### Scope

- In scope: npm and uv dependency updates, shared Vitest setup, MSW server scaffold, Storybook scaffold and smoke story, backend factory helpers, testing-doc updates, and durable memory updates
- Out of scope: product behavior changes, new feature implementation, visual-regression services, Chromatic, Storybook addon expansion, or broad test refactors unrelated to tooling setup

### Affected Features

- [[Testing tools]]

### Acceptance Criteria

- [x] Missing documented frontend tools are declared and installable from repo manifests
- [x] Shared frontend test setup provides `jest-dom`, `user-event`-ready environment, and reusable MSW server hooks
- [x] Storybook runs against current frontend code with one smoke story for an existing component
- [x] Backend dev dependencies include `factory-boy` plus reusable starter factories
- [x] `docs/runbooks/dev-setup.md` and `[[Testing tools]]` reflect the real toolchain and setup paths

### Test Intent

- Backend: add one small factory smoke test proving factory helpers build current SQLAlchemy models correctly
- Frontend: add one small tooling smoke test proving shared Vitest setup, `jest-dom`, and MSW work together
- Manual: build Storybook once to confirm config and story discovery work without inventing UI behavior checks

### Definition of Done

- [x] Relevant backend tests pass
- [x] Relevant frontend tests pass
- [x] Storybook build passes
- [x] Docs updated
- [x] Memory updated with durable tooling truth

## Planning Phase

### Planned Integration Tests

- Backend: `backend/tests/factories/test_model_factories.py` builds `Video` and `ObjectTrack` from reusable factories
- Frontend: `frontend/src/test/setup.test.tsx` renders a small DOM fixture, uses `@testing-library/jest-dom`, and proves MSW intercepts `fetch` in shared setup

### Planned E2E Tests

- Backend: none; this slice changes dev tooling, not runtime workflows
- Frontend: none; Storybook build is enough for the UI-isolation surface in this slice

### Planned Implementation

- Add failing frontend smoke test first, verify red, then add shared Vitest and MSW setup
- Add failing backend factory smoke test next, verify red, then add `factory-boy` dependency plus starter factories
- Add Storybook config and one smoke story around `ExactFrameCanvas`
- Update manifests, lockfiles, docs, and durable testing note after tooling behavior is proven

### Feature Matrix Updates

- Before coding: none beyond creating this task and linked plan
- After verification: update `[[Testing tools]]` with exact helper paths and setup commands

## Execution Phase

### Implementation Notes

- Added red-first smoke tests for frontend shared setup and backend model factories, then implemented only enough shared scaffolding to make them pass.
- Frontend now uses `frontend/src/test/setup.ts` for `jest-dom` plus MSW lifecycle hooks and `frontend/src/test/msw/server.ts` for shared request interception.
- Storybook scope stayed intentionally small: repo-root passthrough scripts, `frontend/.storybook/`, and one `ExactFrameCanvas` smoke story.
- `factory-boy` works for runtime test helpers here, but strict Pyright still dislikes its exported API. Local suppression in `backend/tests/factories/models.py` plus a durable engineering note was the smallest stable fix.
- Root npm workspace needed `@types/react` and `@types/react-dom` mirrored in `package.json` so hoisted Storybook declarations could typecheck from root `node_modules`.

## Wrap-Up Phase

### Verification

- Commands run:
  - `npm --workspace frontend run test -- src/test/setup.test.tsx`
  - `uv run --project backend pytest backend/tests/factories/test_model_factories.py -q`
  - `npm run lint`
  - `npm run typecheck`
  - `npm run test`
  - `npm run storybook:build`
- Results:
  - Frontend tooling smoke test passed: `1 passed`
  - Backend factory smoke test passed: `1 passed`
  - Repo lint passed
  - Repo typecheck passed
  - Repo tests passed: backend `6 passed`, frontend `16 passed`
  - Storybook build passed; Storybook warned it could not write `/home/simone/.storybook/settings.json`, but the build still completed successfully and the generated `frontend/storybook-static` artifact was cleaned from the worktree afterward

### Final Summary

Installed missing documented test tools, added shared frontend test setup and backend starter factories, scaffolded Storybook around `ExactFrameCanvas`, and synced docs plus durable memory so the repo now matches its testing-guidance note.

### Completion Gate

- [x] Acceptance Criteria checkboxes updated to match reality
- [x] Definition of Done checkboxes updated to match reality
- [x] Only now may `status` change to `done`
