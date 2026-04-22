---
title: Review m-2 parity and drift
type: note
permalink: video-annotator/tasks/review-m-2-parity-and-drift
id: task-review-m-2-parity-and-drift
status: done
completed: 2026-04-22 07:38:01 CEST
steps:
- creation
- planning
- execution
- wrap_up
tags:
- task
- review
- docs
- frontend
- m-2
- ui
---

# Review m-2 parity and drift

## Creation Phase

### Description

Review m-2 code, docs, memory routing, and live review UI after remaining timeline/range work lands. Selected-object summary truth is already shipped and should be treated as baseline, not open scope.

Read first:
- [[Workflow]]
- [[Spec and PRD roadmap parity audit 2026-04-22]]
- [[Video Ingest and Exact-Frame Review]]
- [[SAM2 Shell and Runtime]]
- `docs/spec.md`
- `docs/product/prd.md`
- `docs/ui/video-review.png`
- all linked m-2 task notes

Stage-2 rule: in planning phase, write concrete test plan and implementation plan first. In execution, follow written plan. Before `done`, run own review plus 2 subagent reviews and fix actionable findings.

### Scope

- In scope: code review, docs or memory drift, stale task or milestone links, and UI mismatches against mockup screenshots
- Out of scope: new feature scope beyond m-2 parity fixes

### Affected Features

- [[Video Ingest and Exact-Frame Review]]
- [[SAM2 Shell and Runtime]]

### Acceptance Criteria

- [x] Run own review plus 2 subagent reviews and fix actionable findings before close
- [x] Task, milestone, feature, and index notes match shipped m-2 truth after fix pass
- [x] Live review UI mismatches found during review are fixed or recorded honestly as follow-up gaps

### Test Intent

- Backend: rerun targeted m-2 backend-adjacent checks only if review changes backend-facing code
- Frontend: rerun targeted m-2 unit/integration/browser proof after fixes
- Manual: browser-check route-owned live review against current mockup screenshots after review fixes land

### Definition of Done

- [x] Planning phase records concrete tests and implementation plan before code
- [x] Own review plus 2 subagent reviews are recorded and actionable findings are fixed
- [x] Relevant tests and quality checks pass
- [x] Feature notes, task note, and routing indexes are updated honestly when truth changes

## Planning Phase

### Planned Integration Tests

- Frontend: rerun `frontend/tests/integration/video-review/live-review-screen.test.tsx` after review fixes so inspector summary truth, timeline transport, and route-owned chrome stay green.
- Frontend: rerun `frontend/tests/unit/video-review/review-transport-controls.test.tsx` only if review fixes touch timeline transport copy or interaction behavior.
- Backend: no targeted backend rerun unless review fixes touch API or summary-contract docs that require backend-adjacent verification.

### Planned E2E Tests

- Browser: seeded `/review/:videoId` smoke against fresh current-code backend and frontend dev servers. Check timeline markers, selected-range chrome, and selected-object summary against current mockup and recent shipped behavior.
- Browser automation: rerun `frontend/tests/e2e/review-navigation.spec.ts` if review fixes touch route-visible navigation or timeline behavior.

### Planned Implementation

- Run one local audit across current m-2 code, spec or PRD text, milestone or feature or index notes, and `docs/ui/video-review.png`.
- Run 2 parallel subagent review passes: one on live-review frontend code or tests, one on memory or docs routing for m-2 truth.
- Fix only actionable drift found in that audit. Prefer note or tracker cleanup; touch frontend code only if review finds a real m-2 UI mismatch still inside scope.
- Update task execution and wrap-up truth as findings close.

### Feature Matrix Updates

- Update `[[m-2: Review Workspace PRD Parity]]` if shipped checklist or remaining-scope text still lags selected-object summary truth.
- Update current-truth routing notes such as `[[Repo Current State and Feature Matrix]]` or `[[Auditing PRD Feature Coverage]]` if they still claim selected-range or selected-object summary gaps.
- Update affected feature notes only if audit finds their current-state text or owning-task routing still lags shipped m-2 behavior.

## Execution Phase

### Implementation Notes

- Own review found current-truth memory drift in `[[m-2: Review Workspace PRD Parity]]`, `[[Repo Current State and Feature Matrix]]`, `[[Auditing PRD Feature Coverage]]`, and `[[Spec and PRD roadmap parity audit 2026-04-22]]`.
- First subagent review confirmed milestone checklist drift plus missing shipped summary-task routing in `[[SAM2 Shell and Runtime]]`.
- Second subagent review found 4 actionable frontend issues inside m-2 scope: stale selected-object summary requests on frame jumps, scrubber math that ignored visible track inset, missing selected-range context in inspector summary, and stale transport wording that still implied interaction wiring had not landed.
- Fixed frontend drift by deriving selected range from sync-keyed propagation boundary state, sharing one timeline inset constant between pointer math and rendered chrome, and surfacing reviewer-facing range labels in transport plus inspector.
- Fixed memory routing drift by updating current-truth notes and closing m-2 milestone routing instead of rewriting older dated audit snapshots.

## Wrap-Up Phase

### Verification

- Commands run:
- `npx vitest run --coverage.enabled=false tests/integration/video-review/live-review-screen.test.tsx tests/unit/video-review/review-transport-controls.test.tsx`
- `npx vitest run --coverage.enabled=false tests/unit/video-review/use-live-review-controller.test.ts`
- `FRONTEND_E2E_PORT=3100 npx playwright test -c tests/e2e/playwright.config.ts frontend/tests/e2e/review-navigation.spec.ts`
- `node --input-type=module` Playwright smoke for `/review/video-2d62649f3590f8d0` with screenshot `/tmp/us020-m2-parity-browser.png`
- `npm run typecheck`
- `npm run lint`
- `npm run test`
- Results:
- Targeted frontend suites pass: `18` review integration or transport tests green plus `8` controller unit tests green.
- Browser automation passes on seeded route review flow, and direct Playwright smoke saved `/tmp/us020-m2-parity-browser.png` after verifying `Range direction`, `Range boundary frame`, and inspector `Range 7-199` on live route.
- `npm run typecheck` passes.
- `npm run lint` passes.
- `npm run test` passes with backend coverage gate `97.64%` statements / `90.35%` branches and frontend `125` tests green.
- Own review plus 2 subagent reviews are resolved in this task. No open m-2 follow-up gap remains after fix pass.

### Final Summary

- Closed m-2 review drift across both code and memory.
- Live review no longer emits stale summary-range fetches on frame jumps, timeline hit-testing now matches visible scrubber geometry, and inspector plus transport now show reviewer-facing range context.
- Current-truth roadmap, milestone, feature, and index notes now agree that m-2 is complete and remaining roadmap risk starts at m-3 runtime work.

### Completion Gate

- [x] Acceptance Criteria checkboxes updated to match reality
- [x] Definition of Done checkboxes updated to match reality
- [x] Only now may `status` change to `done`
