---
title: Run release verification workflow
type: note
permalink: video-annotator/tasks/run-release-verification-workflow
id: task-run-release-verification-workflow
status: done
completed: 2026-04-28 18:24:00 CEST
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

- [x] Release verification matrix covers all actionable v1 flows with fresh evidence
- [x] Still-blocked import scope is called out honestly instead of treated as passed
- [x] Any actionable verification drift found in scope is fixed or routed before close
- [x] Fresh 1920x1080 browser evidence confirms current library and review route direction still matches committed `docs/ui` PNG truth

### Test Intent

- Backend: run milestone-spanning backend checks required by verification matrix
- Frontend: run milestone-spanning frontend and browser checks required by verification matrix
- Manual: run final browser or Docker-smoke proof at 1920x1080 for current library and review routes

### Definition of Done

- [x] Planning phase records concrete tests and implementation plan before code
- [x] Own review plus 2 subagent reviews are recorded and actionable findings are fixed
- [x] Relevant tests and quality checks pass
- [x] Feature notes, task note, and routing indexes are updated honestly when truth changes

## Planning Phase

### Planned Integration Tests

- repo precondition:
  - `npm run test`
- backend matrix:
  - `uv run --project backend pytest backend/tests/integration/api/test_annotation_foundation_manual_box.py backend/tests/integration/api/test_sam2_shell_runtime.py backend/tests/integration/api/test_review_summary_contracts.py backend/tests/integration/api/test_export_api.py -q`
- frontend integration matrix:
  - `npm --workspace frontend run test:integration -- tests/integration/video-review/live-review-screen.test.tsx tests/integration/video-review/export-ui-flow.test.tsx`
- targeted tooling only if verification fixes touch Docker harness again:
  - `uv run --project backend pytest backend/tests/unit/tooling/test_docker_e2e_compose.py backend/tests/unit/tooling/test_repo_test_commands.py -q`
  - `npm --workspace frontend exec vitest run tests/unit/tooling/docker-e2e-wrapper.test.ts`

### Planned E2E Tests

- host browser matrix:
  - `env -u BACKEND_HOST -u BACKEND_PORT -u FRONTEND_HOST -u FRONTEND_PORT -u VITE_API_BASE_URL -u APP_DB_URL -u APP_MASKS_DIR -u PLAYWRIGHT_RUN_MODE npm run test:e2e -- frontend/tests/e2e/routes.spec.ts frontend/tests/e2e/review-navigation.spec.ts`
- docker matrix:
  - `node scripts/docker-e2e.mjs test frontend/tests/e2e/routes.spec.ts frontend/tests/e2e/review-navigation.spec.ts`
  - record current Docker daemon blocker honestly if it still fails before container start
- 1920x1080 route evidence:
  - capture fresh browser screenshots for current library and review routes if browser verification stays green

### Planned Implementation

- Step 1: move task active and run precondition `npm run test`
- Step 2: run backend, frontend, and host-browser verification matrix
- Step 3: run docker wrapper proof and record blocker or fresh green evidence honestly
- Step 4: capture fresh 1920x1080 route evidence for library and review if verification stays trustworthy
- Step 5: fix only actionable verification drift found in scope, then rerun touched checks
- Step 6: run own review plus 2 subagent reviews, close task honestly, then hand off to final `m-7` parity review

### Feature Matrix Updates

- none expected unless verification exposes real feature-truth drift that must be routed

## Execution Phase

### Implementation Notes

- Precondition gate passed: full `npm run test` is green from the current tree.
- Release verification used that full repo test run as the broad backend plus frontend matrix, then added fresh host-browser proof, canonical Docker release-path blocker evidence, and fresh 1920x1080 route captures.
- Host browser matrix stayed green on the committed route specs.
- Canonical Docker release path is still blocked in this workspace before container start by Docker daemon `500` errors on `/var/run/docker.sock`.
- Initial manual screenshot pass inherited shell ports and was replaced by a clean-env rerun on true E2E ports.
- Fresh 1920x1080 screenshots were captured on clean E2E host ports for:
  - `/tmp/video-library-release-1920x1080-e2e.png`
  - `/tmp/video-review-release-1920x1080-e2e.png`
- Visual readback on those clean-env captures matched current route direction from committed `docs/ui/video-library.png` and `docs/ui/video-review-1920x1080.png`.
- Import scope remains blocked and was not treated as passed in this verification slice.

## Wrap-Up Phase

### Verification

- Commands run:
- `npm run test`
- `env -u BACKEND_HOST -u BACKEND_PORT -u FRONTEND_HOST -u FRONTEND_PORT -u VITE_API_BASE_URL -u APP_DB_URL -u APP_MASKS_DIR -u PLAYWRIGHT_RUN_MODE npm run test:e2e -- frontend/tests/e2e/routes.spec.ts frontend/tests/e2e/review-navigation.spec.ts`
- `npm run test:e2e:docker`
- `npm run backend:db:reset:e2e`
- `npm run backend:db:migrate:e2e`
- `npm run backend:seed:e2e`
- `npm run backend:seed:e2e:review-navigation`
- `env -u BACKEND_HOST -u BACKEND_PORT -u FRONTEND_HOST -u FRONTEND_PORT -u VITE_API_BASE_URL -u APP_DB_URL -u APP_MASKS_DIR npm run backend:dev:e2e`
- `env -u BACKEND_HOST -u BACKEND_PORT -u FRONTEND_HOST -u FRONTEND_PORT -u VITE_API_BASE_URL -u APP_DB_URL -u APP_MASKS_DIR npm run frontend:dev:e2e`
- `curl -sf http://127.0.0.1:8000/openapi.json`
- `curl -sf http://127.0.0.1:5173/`
- `curl -sf http://127.0.0.1:8001/openapi.json`
- `curl -sf http://127.0.0.1:3000/`
- `./node_modules/.bin/playwright screenshot --viewport-size=1920,1080 http://127.0.0.1:3000/ /tmp/video-library-release-1920x1080-e2e.png`
- `./node_modules/.bin/playwright screenshot --viewport-size=1920,1080 http://127.0.0.1:3000/review/video-2d62649f3590f8d0 /tmp/video-review-release-1920x1080-e2e.png`
- Results:
- `npm run test` passed end to end:
  - backend: `171 passed`, statements `97.50%`, branches `90.44%`
  - frontend: `51 passed (51)` and coverage gate passed with lines `94.19%`, branches `90.25%`
- host browser matrix passed with `3 passed (13.7s)` on setup plus `routes.spec.ts` plus `review-navigation.spec.ts`
- canonical Docker release path failed before container start with Docker daemon `500 Internal Server Error` during `npm run test:e2e:docker`, first on compose `down` container listing and then again on cleanup
- clean-env E2E backend and frontend servers came up on `127.0.0.1:8001` and `127.0.0.1:3000` for screenshot capture
- fresh clean-env 1920x1080 library and review screenshots were captured successfully and visually matched current committed route direction
- import stayed explicitly blocked and was not counted as verified scope
- own review plus 3 subagent reviews ran for this task
  - one spec reviewer found close-state routing lag and milestone checklist lag
  - one quality reviewer found wrong Docker command choice and wrong screenshot-port wording
  - one narrow quality reviewer found summary wording that understated blocked import scope

### Final Summary

Release verification now has fresh evidence for the current shipped host-verified v1 surface. Full repo tests passed, host browser routes passed, and fresh clean-env 1920x1080 library plus review screenshots match the committed UI direction. Canonical Docker release-path blocker evidence is still honestly present in this workspace because Docker daemon `500` errors stop the path before containers start, and import remains blocked scope rather than passed scope.

### Completion Gate

- [x] Acceptance Criteria checkboxes updated to match reality
- [x] Definition of Done checkboxes updated to match reality
- [x] Only now may `status` change to `done`
