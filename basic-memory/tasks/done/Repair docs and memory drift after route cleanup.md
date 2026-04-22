---
id: task-repair-docs-and-memory-drift-after-route-cleanup
title: Repair docs and memory drift after route cleanup
status: done
completed: 2026-04-22 03:04:00 CEST
steps:
- creation
- planning
- execution
- wrap_up
tags:
- task
- docs
- memory
- cleanup
- routing
permalink: video-annotator/tasks/repair-docs-and-memory-drift-after-route-cleanup
---

# Repair docs and memory drift after route cleanup

## Creation Phase

### Description

Reconcile supporting docs, tracking notes, and current-truth memory with the shipped route-owned frontend, moved Playwright tree, explicit backend bootstrap flow, deleted `Review Workspace Ergonomics` feature note, and current selected-summary contract so future sessions stop inheriting stale guidance.

### Scope

- In scope: fix stale current-truth docs, indexes, active plans, current tasks, and current notes that still point at deleted route wiring, deleted feature-note ownership, deleted test paths, or outdated startup or contract assumptions
- In scope: adapt routing and task indexes to the new state where `Migrate E2E to Docker` is already in progress
- Out of scope: runtime UI changes, new backend endpoints, schema changes, or production-serving changes

### Affected Features

- [[Video Ingest and Exact-Frame Review]]
- [[SAM2 Shell and Runtime]]

### Acceptance Criteria

- [x] Current-truth docs and notes stop pointing at deleted `frontend/src/app/live-review-app.tsx` and old Playwright or Vitest tree locations where shipped truth has moved
- [x] Current active notes and plans stop relying on deleted `[[Review Workspace Ergonomics]]` as if it were still the owning feature note
- [x] `docs/runbooks/dev-setup.md`, `docs/spec.md`, and `docs/engineering/api.md` describe current bootstrap, route, repo-structure, and selected-summary contract truth without mixing shipped and planned states
- [x] Overview and audit notes touched by this cleanup are honest about any new feature-note ownership gap created by the deleted ergonomics note
- [x] Task indexes reflect the current moved state for `Migrate E2E to Docker`

### Test Intent

- Backend: none
- Frontend: none
- Verification: targeted search checks for stale paths, deleted feature-note references in current files, and stale bootstrap wording plus spot reads of touched files

### Definition of Done

- [x] Search checks confirm touched current-truth files no longer use stale paths or stale bootstrap claims
- [x] Task and note wrap-up truth is recorded honestly
- [x] Supporting docs and memory touched by this cleanup match current repo behavior

## Planning Phase

### Planned Integration Tests

- None. This task changes docs, tracking notes, and durable memory truth, not runtime behavior.

### Planned E2E Tests

- None. Existing browser proof already moved under `frontend/tests/e2e/` in the previous task.

### Planned Verification

- Use targeted `rg` checks for stale strings in touched current-truth files:
  - `frontend/src/app/live-review-app.tsx`
  - `tests/e2e/specs/`
  - `tests/e2e/fixtures/`
  - `frontend/tests/component/`
  - backend-startup claims that boot creates tables or auto-indexes videos
  - `[[Review Workspace Ergonomics]]` in active or current-truth files
- Re-read touched docs and notes after edits to confirm they now describe shipped truth or clearly frame history as historical.

### Planned Implementation

- Fix current supporting docs first: `docs/runbooks/dev-setup.md`, `docs/spec.md`, and `docs/engineering/api.md`.
- Update current notes, active plans, current tasks, and current feature notes after that so deleted feature-note ownership does not linger as live truth.
- Update current task and milestone indexes where the new state already moved notes.
- Record exact verification commands and remaining follow-up gaps in wrap-up.

## Execution Phase

### Implementation Notes
- Updated supporting docs so startup, repo layout, and selected-object summary wording reflect shipped backend and route-owned frontend truth instead of mixed planned or historical language.
- Repaired current-truth memory so deleted `[[Review Workspace Ergonomics]]` no longer acts like a live owning note in current milestone, decision, reference, and overview surfaces.
- Reconciled task routing by keeping `[[Migrate E2E to Docker]]` in progress, moving this cleanup task to done, and expanding `[[Done Tasks Index]]` to match the actual done-folder contents.

## Wrap-Up Phase

### Verification

- Commands run:
  - `rg -n "Review Workspace Ergonomics" basic-memory/notes basic-memory/plans/active basic-memory/tasks/todo basic-memory/tasks/in_progress basic-memory/milestones/in_progress basic-memory/reference basic-memory/decisions basic-memory/features docs`
  - `rg -n "frontend/src/app/live-review-app\\.tsx|frontend/tests/component/|tests/e2e/specs/|tests/e2e/fixtures/|bootstraps tables|auto-indexes|creates tables|indexes any supported local videos" docs basic-memory/notes basic-memory/plans/active basic-memory/tasks/in_progress basic-memory/tasks/todo basic-memory/milestones/in_progress basic-memory/reference basic-memory/decisions basic-memory/features`
- Results:
  - Current-truth directories returned no live refs to `[[Review Workspace Ergonomics]]`; current milestone, decision, and reference notes now route through surviving feature notes instead.
  - Targeted stale-path and stale-bootstrap searches only hit intentional current decision wording about the deleted file; touched current-truth docs and notes read back with shipped route and bootstrap truth.

### Final Summary

Supporting docs and current-truth memory now agree on explicit backend bootstrap, route-owned frontend structure, shipped selected-object summary wording, and the new state where the old ergonomics note is gone. Current review-workspace truth now routes through `[[Video Ingest and Exact-Frame Review]]`, `[[SAM2 Shell and Runtime]]`, and concrete follow-up tasks instead of a deleted feature note.

### Completion Gate

- [x] Acceptance Criteria checkboxes updated to match reality
- [x] Definition of Done checkboxes updated to match reality
- [x] Only now may `status` change to `done`
