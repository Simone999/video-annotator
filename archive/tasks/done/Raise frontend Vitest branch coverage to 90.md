---
title: Raise frontend Vitest branch coverage to 90
type: note
permalink: video-annotator/tasks/raise-frontend-vitest-branch-coverage-to-90
id: task-raise-frontend-vitest-branch-coverage-to-90
status: done
completed:
steps:
- creation
- planning
- execution
- wrap_up
tags:
- task
- frontend
- tests
- coverage
- vitest
- m-7
---

# Raise frontend Vitest branch coverage to 90

## Creation Phase

### Description

Raise frontend Vitest branch coverage to repo gate. Current truth: `npm run test` now fails because frontend branch coverage is `88.88%`, below required `90%`. Old `Unknown% (0/0)` instrumentation problem is no longer blocker.

Read first:
- [[Workflow]]
- [[Testing tools]]
- `frontend/vite.config.ts`
- latest frontend coverage report from `npm run test`
- review-focused frontend test files around inspector, surface, API, and controller branches

Stage-2 rule: in planning phase, write concrete test plan and implementation plan first. In execution, follow written plan. Before `done`, run own review plus 2 subagent reviews and fix actionable findings.

### Scope

- In scope: targeted frontend tests or small supporting test-only changes that raise branch coverage to `90%` or higher
- Likely target areas from current report: review inspector branches, review surface branches, review API branches, and review controller branches
- Out of scope: reworking whole frontend test toolchain or reopening solved coverage instrumentation work

### Affected Features

- [[Video Ingest and Exact-Frame Review]]

### Acceptance Criteria

- [x] `npm run test` passes with frontend branch coverage at `90%` or higher
- [x] Coverage work stays focused on missing branch paths instead of test-tooling redesign
- [x] Task records which report areas were covered and why

### Test Intent

- Backend: none
- Frontend: targeted Vitest additions for current low-branch areas, then full `npm run test`
- Manual: none

### Definition of Done

- [x] Planning phase records concrete tests and implementation plan before code
- [x] Own review plus 2 subagent reviews are recorded and actionable findings are fixed
- [x] Relevant tests and quality checks pass
- [x] Feature notes, task note, and routing indexes are updated honestly when truth changes

## Planning Phase

### Planned Integration Tests

- Frontend unit tests in `api.test.ts`, `review-page.test.tsx`, `review-inspector-panel.test.tsx`, and `review-surface-panel.test.tsx` to cover the lowest-value branch gaps from the previous coverage report.

### Planned E2E Tests

- None. This is test-coverage hardening only.

### Planned Implementation

- Split large API contract tests into one behavior per case where useful.
- Add a no-`videoId` route case for the review page wrapper.
- Add inspector and surface conditional tests for export, mask visibility, propagated-frame open, paused refine state, and exact-frame messages.

### Feature Matrix Updates

- No durable feature-matrix change expected. This task should stay test-only.

## Execution Phase

### Implementation Notes

- Added test-only coverage in:
  - `frontend/tests/unit/video-review/api.test.ts`
  - `frontend/tests/unit/video-review/review-page.test.tsx`
  - `frontend/tests/unit/video-review/review-inspector-panel.test.tsx`
  - `frontend/tests/unit/video-review/review-surface-panel.test.tsx`
- Kept runtime code unchanged. Coverage gain came from exercising existing frontend-boundary parsing, wrapper routing, and review UI conditional branches.
- Split previously bundled API cases so failures point at one endpoint contract at a time.
- Added one paused-surface refine/error state and one no-param review route case because those were cheap branch wins with real user-facing behavior.
- Fixed review feedback on test quality:
  - remembered-opacity test now proves restore-to-previous-opacity with a non-default value
  - inspector summary assertions now match tile text content instead of stray numerals
  - bundled API failure-path tests were split

### Review Notes

- Subagent spec review: initial complaint was that the first coverage pass skipped review-surface conditionals; fixed by adding `review-surface-panel` coverage and re-running.
- Subagent quality review: initial complaints were bundled API tests, brittle numeral assertions, and weak remembered-opacity proof; all were fixed in the final test pass.
- Final rerun after fixes: spec review approved and quality review approved on the final test files.

## Wrap-Up Phase

### Verification

- Commands run:
- `npm exec --workspace frontend vitest run tests/unit/video-review/api.test.ts tests/unit/video-review/review-page.test.tsx tests/unit/video-review/review-inspector-panel.test.tsx tests/unit/video-review/review-surface-panel.test.tsx`
- `npm run lint`
- `npm run typecheck`
- `npm run test`
- Results:
- Focused frontend verification passed: `4` files, `43` tests.
- `npm run lint` passed.
- `npm run typecheck` passed.
- `npm run test` passed:
  - backend coverage gate passed at statements `97.50%`, branches `90.44%`
  - frontend full suite passed at `50` files / `234` tests
  - frontend coverage gate passed at lines `94.19%`, branches `90.25%`

### Final Summary

Raised frontend branch coverage above repo gate using test-only changes. Final blocker moved from frontend branches `88.88%` to green `90.25%`, with no intended runtime behavior change.

### Completion Gate

- [x] Acceptance Criteria checkboxes updated to match reality
- [x] Definition of Done checkboxes updated to match reality
- [x] Only now may `status` change to `done`
