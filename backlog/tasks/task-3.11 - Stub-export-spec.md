---
id: TASK-3.11
title: Stub export spec
status: Done
assignee:
  - codex
created_date: '2026-04-10 13:57'
updated_date: '2026-04-10 20:56'
labels:
  - milestone-0
  - docs
  - export
milestone: m-0
dependencies:
  - TASK-3.4
  - TASK-3.5
references:
  - docs/engineering/export-spec.md
documentation:
  - docs/spec.md
  - docs/product/requirements.md
parent_task_id: TASK-3
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Create the required export spec as a Milestone 0 foundation document that records the local-only export direction while deferring implementation details to later milestones.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 An export spec file exists in the engineering docs set.
- [x] #2 The document distinguishes Milestone 0 baseline assumptions from later export implementation work.
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Create `docs/engineering/export-spec.md` as required Milestone 0 export foundation document.
2. Record only baseline export assumptions already defined: local-only exports, intended native JSON plus PNG masks direction, deterministic and reloadable outputs, and repository-owned `exports/` storage.
3. Stub future sections required by the spec: native JSON schema, mask directory layout, and versioning strategy, but mark all implementation details as deferred to later milestones.
4. Call out what stays out of Milestone 0 scope: export execution flow, archive or download behavior, filtering or option behavior, and any implemented export UI or API beyond placeholders.
5. Update `docs/engineering/README.md` so export spec is discoverable.
6. Verify with `make format-check`, `make lint`, and `make typecheck`.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Attempted `doc_explorer` plan review for TASK-3.11, but service returned temporary high-demand error. Proceeding with same checklist locally to avoid stalling Milestone 0 doc work.

Created `docs/engineering/export-spec.md` and linked it from `docs/engineering/README.md`.

Local checklist pass: kept document at Milestone 0 assumption/stub level, captured only spec-defined export constraints, stubbed required future sections without implying implementation, deferred runtime/API/UI details, README change stayed discoverability-only.

Verified on final state with `make format-check`, `make lint`, and `make typecheck`. `make typecheck` exited successfully but printed informational Pyright message from unrelated unstaged `backend/pyproject.toml` change in working tree.

Attempted `doc_explorer` plan review, but service unavailable due temporary high demand. Final doc validation used same explicit local checklist plus direct inspection.
<!-- SECTION:NOTES:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Added `docs/engineering/export-spec.md` as Milestone 0 export foundation document and linked it from `docs/engineering/README.md`. New spec records local-only export assumptions, intended native JSON plus PNG mask direction, deterministic and reloadable output goals, and repository-owned `exports/` storage, while stubbing native JSON schema, mask directory layout, and versioning strategy for later milestones.

Verification:
- `make format-check`
- `make lint`
- `make typecheck` (successful exit; informational Pyright message came from unrelated unstaged `backend/pyproject.toml` change)
- Local checklist-based document review after `doc_explorer` plan review was unavailable
<!-- SECTION:FINAL_SUMMARY:END -->

## Definition of Done
<!-- DOD:BEGIN -->
- [x] #1 Run `make format-check`
- [x] #2 Run `make lint`
- [x] #3 Run `make typecheck`
- [x] #4 Run scoped tests or equivalent verification
<!-- DOD:END -->
