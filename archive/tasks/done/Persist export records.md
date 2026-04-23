---
title: Persist export records
type: note
permalink: video-annotator/tasks/persist-export-records
id: task-persist-export-records
status: done
completed:
steps:
- creation
- planning
- execution
- wrap_up
tags:
- task
- backend
- export
- m-5
- data-model
---

# Persist export records

## Creation Phase

### Description

Persist export records and stale/current export derivation so library can tell `ready` from real `exported`.

Read first:
- [[Workflow]]
- [[Export]]
- [[Export Format]]
- [[API]]
- [[Data Model]]
- `docs/spec.md`
- `backend/app/db/models.py`
- `backend/app/services/review_summaries.py`

Stage-2 rule: in planning phase, write concrete test plan and implementation plan first. In execution, follow written plan. Before `done`, run own review plus 2 subagent reviews and fix actionable findings.

### Scope

- In scope: export record storage, stale/current derivation, and review-state read-model updates
- Out of scope: artifact generation or frontend UI

### Affected Features

- [[Export]]

### Acceptance Criteria

- [x] Backend persists enough export record truth to derive current versus stale export state
- [x] Library read model can emit real `exported` only when latest export matches saved review state
- [x] Tests prove post-edit fallback from `exported` back to `ready`

### Test Intent

- Backend: add model or service coverage for export-state derivation
- Frontend: none
- Manual: none

### Definition of Done

- [x] Planning phase records concrete tests and implementation plan before code
- [x] Own review plus 2 subagent reviews are recorded and actionable findings are fixed
- [x] Relevant tests and quality checks pass
- [x] Feature notes, task note, and routing indexes are updated honestly when truth changes

## Planning Phase

### Planned Integration Tests
- `backend/tests/integration/api/test_review_summary_contracts.py`
  - seed one video with manual review output and no export rows
  - assert list/detail routes return `review_state = ready`
  - persist one export record that snapshots current review output freshness
  - assert list/detail routes flip to `review_state = exported`
  - add one later manual edit on a new frame
  - assert same routes fall back to `review_state = ready`

### Planned Unit Tests
- `backend/tests/unit/services/test_review_summaries.py`
  - cover `_derive_review_state` for fresh export snapshot and stale export snapshot
  - keep `in_progress` stronger than exported when active propagation exists

### Planned E2E Tests

### Planned Implementation
- add persisted `ExportRecord` table with enough freshness snapshot truth to compare latest export against current review output
- add Alembic migration and legacy-copy support so local SQLite upgrades do not drop export rows later
- extend review-summary aggregation to derive latest review output timestamp and latest export snapshot
- update review-state derivation to emit `exported` only when latest export still matches current review output
- keep scope backend-only; no artifact builder or frontend UI yet

### Feature Matrix Updates

## Execution Phase

### Implementation Notes
- Added persisted `ExportRecord` storage with `review_output_updated_at` snapshot truth and Alembic migration coverage for current schema upgrades.
- Extended `review_summaries` to derive latest non-imported review-output freshness and latest export snapshot per video.
- `review_state` now emits `exported` only when the latest export snapshot still matches current review-output freshness; later edits fall back to `ready`.
- Added focused unit and integration coverage for fresh export, stale export, and active-propagation precedence.

## Wrap-Up Phase

### Verification

- Commands run:
- `uv run --project backend pytest backend/tests/unit/services/test_review_summaries.py backend/tests/integration/api/test_review_summary_contracts.py -q`
- `uv run --project backend pytest -q`
- `npm run typecheck`
- `npm run lint`
- Results:
- Focused backend unit and integration shards passed.
- Full backend test suite passed: `143 passed in 9.42s`.
- Typecheck passed.
- Lint passed.
- Own review found no actionable issues.
- Subagent review 1 found no actionable issues in state derivation or test coverage.
- Subagent review 2 found no actionable issues in schema or migration wiring; noted one non-blocking residual gap that no test currently exercises legacy-repair copying of pre-existing `export_records` rows.

### Final Summary
- Shipped backend export snapshot persistence and honest `exported` derivation without pulling in export routes or UI early.
- Durable docs and memory now describe `export_records` and the stale-to-ready fallback rule.

### Completion Gate

- [x] Acceptance Criteria checkboxes updated to match reality
- [x] Definition of Done checkboxes updated to match reality
- [x] Only now may `status` change to `done`
