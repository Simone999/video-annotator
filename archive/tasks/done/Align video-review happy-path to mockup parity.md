---
title: Align video-review happy-path to mockup parity
type: note
permalink: video-annotator/tasks/align-video-review-happy-path-to-mockup-parity
id: task-align-video-review-happy-path-to-mockup-parity
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
- review
- ui
- mockup
---

# Align video-review happy-path to mockup parity

## Creation Phase

### Description

Rebuild the loaded review route shell so it matches the committed mockup direction while keeping real review behavior and legacy test contracts that still define shipped behavior.

### Scope

- In scope: review topbar, left annotations panel, surface header, transport, inspector order, compatibility labels/copy required by review tests, and durable memory for missing advanced-state mockups
- Out of scope: backend API changes, deleting current SAM2 or mask tooling, redesigning non-happy-path route shells, or inventing new advanced review UX

### Affected Features

- [[Video Ingest and Exact-Frame Review]]
- [[Mask Editing and Cleanup]]
- [[SAM2 Shell and Runtime]]

### Acceptance Criteria

- [x] loaded review shell matches mockup direction more closely across topbar, left panel, surface, transport, and inspector
- [x] `NEW OBJECT` uses dialog-driven creation on the happy path
- [x] export remains visible in the right sidebar
- [x] review integration and touched unit tests pass
- [x] durable note records that advanced review states still need dedicated mockups for future drift audits

### Test Intent

- Frontend: review integration file plus touched unit coverage for left panel and transport
- Manual: none required once targeted review tests lock the restored contracts

### Definition of Done

- [x] Relevant tests pass
- [x] Docs updated through durable memory note

## Planning Phase

### Planned Integration Tests

- `frontend/tests/integration/video-review/live-review-screen.test.tsx`

### Planned E2E Tests

- none for this slice

### Planned Implementation

- Rebuild loaded route shell toward mockup structure
- Restore only the old review-contract hooks still enforced by tests
- Record missing advanced-state mockup decision in durable memory

### Feature Matrix Updates

- durable decision note for future review drift audits

## Execution Phase

### Implementation Notes

- Reworked loaded review shell across `live-review-screen.tsx`, `review-topbar.tsx`, `review-video-list-panel.tsx`, `review-surface-panel.tsx`, `review-transport-controls.tsx`, and `review-inspector-panel.tsx`.
- Kept `NEW OBJECT` dialog flow on the happy path and preserved compatibility hooks that review tests still rely on.
- Restored exact contracts for frame-control accessibility, selected-range copy, refine helper copy, refined-mask save button naming, source display, and propagation result button naming.
- Kept export in the inspector footer and kept real mask/SAM2 workflow behavior.

## Wrap-Up Phase

### Verification

- Commands run:
- `node ../node_modules/vitest/vitest.mjs run tests/integration/video-review/live-review-screen.test.tsx`
- `node ../node_modules/vitest/vitest.mjs run tests/unit/video-review/review-video-list-panel.test.tsx tests/unit/video-review/review-transport-controls.test.tsx`
- `node ../node_modules/vitest/vitest.mjs run tests/integration/video-review/live-review-screen.test.tsx tests/unit/video-review/review-video-list-panel.test.tsx tests/unit/video-review/review-transport-controls.test.tsx`
- `npm run lint`
- `npm run typecheck`
- `npm --workspace frontend exec vitest -- run tests/integration/video-review/export-ui-flow.test.tsx --maxWorkers=1`
- `npm --workspace frontend exec vitest -- run tests/unit/video-review/review-inspector-panel.test.tsx --maxWorkers=1`
- `npm --workspace frontend exec vitest -- run tests/unit/video-review/use-live-review-controller-refine-save.test.ts --maxWorkers=1`
- `npm --workspace frontend exec vitest -- run tests/unit/video-review/use-live-review-controller-refine.test.ts --maxWorkers=1`
- `npm --workspace frontend exec vitest -- run tests/unit/video-review/review-video-list-panel.test.tsx --coverage --coverage.thresholds.lines=0 --coverage.thresholds.branches=0 --maxWorkers=1`
- `npm run test`
- Results:
- review integration passed: `21 passed`
- touched review unit tests passed: `6 passed`
- combined targeted run passed: `27 passed`
- `npm run lint` passed after repairing stale review test fixtures
- `npm run typecheck` passed after repairing stale review test fixtures
- targeted export, inspector, refine-save, refine, and video-list tests passed after aligning assertions with the staged mockup shell
- first full `npm run test` attempt exposed frontend coverage branch drift at `89.44% < 90%`
- final `npm run test` passed: backend `155 passed`, frontend `47 passed` files and `194 passed` tests, frontend branch coverage `90.26%`

### Final Summary

- Loaded review route now tracks the mockup shell much more closely without dropping current review behavior.
- Legacy review contracts still exercised by tests were restored where the mockup alone was not enough.
- Durable memory now needs to guide future drift audits on advanced review states instead of letting them silently treat those states as mockup mismatches.

### Completion Gate

- [x] Acceptance Criteria checkboxes updated to match reality
- [x] Definition of Done checkboxes updated to match reality
- [x] Only now may `status` change to `done`
