---
title: Review m-3 runtime parity
type: note
permalink: video-annotator/tasks/review-m-3-runtime-parity
id: task-review-m-3-runtime-parity
status: done
completed:
steps:
- creation
- planning
- execution
- wrap_up
tags:
- task
- review
- backend
- frontend
- m-3
- sam2
---

# Review m-3 runtime parity

## Creation Phase

### Description

Review m-3 runtime code, docs, routing notes, and UI states after real SAM2 work. Fix actionable drift in same task.

Read first:
- [[Workflow]]
- [[Spec and PRD roadmap parity audit 2026-04-22]]
- [[SAM2 Shell and Runtime]]
- [[API]]
- [[Data Model]]
- `docs/spec.md`
- all linked m-3 task notes

Stage-2 rule: in planning phase, write concrete test plan and implementation plan first. In execution, follow written plan. Before `done`, run own review plus 2 subagent reviews and fix actionable findings.

### Scope

- In scope: code review, docs and memory drift, stale task links, and runtime/UI mismatches found after m-3 work
- Out of scope: new post-m-3 feature scope

### Affected Features

- [[SAM2 Shell and Runtime]]

### Acceptance Criteria

- [x] Run own review plus 2 subagent reviews and fix actionable findings before close
- [x] Feature notes, milestone notes, and task indexes match shipped m-3 runtime truth
- [x] Runtime and UI verification evidence is recorded honestly, including any environment blocker

### Test Intent

- Backend: rerun targeted m-3 backend checks after review fixes
- Frontend: rerun targeted m-3 frontend checks after review fixes
- Manual: browser-check real runtime states if environment allows; otherwise record blocker honestly

### Definition of Done

- [x] Planning phase records concrete tests and implementation plan before code
- [x] Own review plus 2 subagent reviews are recorded and actionable findings are fixed
- [x] Relevant tests and quality checks pass
- [x] Feature notes, task note, and routing indexes are updated honestly when truth changes

## Planning Phase

### Planned Integration Tests

- Frontend route truth: run focused frontend Vitest for `frontend/tests/integration/app/app-routes.test.tsx` and `frontend/tests/integration/video-review/review-page.test.tsx` after replacing dead `/review` expectation with real router coverage.
- Frontend live-review parity: rerun `frontend/tests/integration/video-review/live-review-screen.test.tsx` if runtime-note or route-copy edits touch live review expectations.
- Browser route proof: run Playwright review-route smoke on real app routes with seeded E2E backend so final parity note has honest browser evidence even if SAM2 assets stay missing.

### Planned E2E Tests

- `FRONTEND_E2E_PORT=3100 npm run test:e2e -- frontend/tests/e2e/review-navigation.spec.ts`
- If local runtime assets still missing, record blocker honestly instead of pretending real prompt or propagation browser proof ran.

### Planned Implementation

- Verify subagent review findings against current code and notes before fixing anything.
- Wrap real prompt predictor-call failures behind explicit `Sam2RuntimeExecutionError` so route layer keeps stable SAM2 runtime failure semantics.
- Remove dead `/review` route test truth from feature-level review-page tests and keep real route-map coverage in app-router tests.
- Repair m-3 runtime docs or memory drift:
  - task routing and indexes
  - milestone current-focus text
  - SAM2 feature current-state and evidence wording
  - engineering docs and memory specs with stale session example, fake live refine route, or old placeholder-blocker wording

### Feature Matrix Updates

- Update `[[SAM2 Shell and Runtime]]` and `[[Repo Current State and Feature Matrix]]` if parity review closes remaining m-3 review gap.
- Update `[[m-3: Real SAM2 Runtime]]` and milestone indexes if this pass closes milestone.
- Keep manual local-runtime blocker honest if browser proof cannot use real SAM2 assets.

## Execution Phase

### Implementation Notes

- Own review plus 2 subagent reviews found four real drifts:
  - prompt predictor exceptions leaked raw runtime errors instead of stable SAM2 execution errors
  - `frontend/tests/integration/video-review/review-page.test.tsx` invented impossible bare `/review` route truth
  - SAM2 API or memory docs still had stale session payload, fake-live refine route, or old placeholder-blocker wording
  - first Playwright browser run false-failed because setup reset E2E SQLite under live backend handle
- Fixed backend prompt error normalization in `backend/app/services/sam2.py` with direct unit coverage.
- Replaced dead route expectation with real app-router coverage for `/review` falling into not-found route.
- Updated docs or memory or AGENTS so m-3 runtime truth, confidence wording, and Playwright rerun guidance match shipped behavior.

## Wrap-Up Phase

### Verification

- Commands run:
  - `uv run --project backend pytest backend/tests/unit/services/test_sam2.py -k 'wraps_predictor_failures'`
  - `uv run --project backend pytest backend/tests/unit/services/test_sam2.py -k 'prompt_box'`
  - `npx vitest run tests/integration/app/app-routes.test.tsx tests/integration/video-review/review-page.test.tsx --coverage=false`
  - `FRONTEND_E2E_PORT=3100 npm run test:e2e -- frontend/tests/e2e/review-navigation.spec.ts`
  - `npm run backend:bootstrap:e2e`
  - `npm run backend:seed:e2e:review-navigation`
  - `FRONTEND_E2E_PORT=3100 npx playwright test -c tests/e2e/playwright.config.ts --project=chromium --no-deps frontend/tests/e2e/review-navigation.spec.ts`
  - `npm run lint`
  - `npm run typecheck`
  - `npm run test`
- Results:
  - First backend unit test failed red with raw `RuntimeError("predictor boom")`; green after service fix.
  - Focused frontend Vitest rerun passed.
  - Default Playwright command false-failed because setup reset `/tmp/video-annotator-playwright.sqlite3` under live backend and produced `disk I/O error` plus missing-column noise.
  - Manual bootstrap plus fresh servers plus `--no-deps` Playwright rerun passed for real `/review/:videoId` route navigation.
  - Repo quality gates passed: lint, typecheck, backend coverage gate, frontend Vitest suite.
  - Real prompt or propagation browser proof stays blocked in this shell because `SAM2_CONFIG_PATH` and `SAM2_CHECKPOINT_PATH` were not set.

### Final Summary

Closed final m-3 parity pass. Task fixed one backend runtime error-path gap, removed one dead frontend route test, repaired runtime docs or memory drift, and recorded honest browser evidence plus current local-runtime env blocker.

### Completion Gate

- [x] Acceptance Criteria checkboxes updated to match reality
- [x] Definition of Done checkboxes updated to match reality
- [x] Only now may `status` change to `done`
