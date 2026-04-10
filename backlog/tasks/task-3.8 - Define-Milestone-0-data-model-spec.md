---
id: TASK-3.8
title: Define Milestone 0 data model spec
status: Done
assignee:
  - codex
created_date: '2026-04-10 13:57'
updated_date: '2026-04-10 14:56'
labels:
  - milestone-0
  - docs
  - backend
milestone: m-0
dependencies:
  - TASK-3.4
  - TASK-3.5
  - TASK-3.6
references:
  - docs/engineering/data-model.md
documentation:
  - docs/spec.md
  - docs/product/requirements.md
  - docs/engineering/runbook.md
parent_task_id: TASK-3
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Write the initial Milestone 0 data model contract for local filesystem layout and the SQLite videos table that will store indexed metadata.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 The data model spec defines the initial videos table fields required by Milestone 0 indexing.
- [x] #2 The document covers local filesystem assumptions for repository-owned state relevant to Milestone 0.
- [x] #3 Object, mask, and later annotation lifecycle rules are explicitly deferred.
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Create `docs/engineering/data-model.md` as the Milestone 0 data model contract.
2. Define only the Milestone 0 SQLite metadata model needed for video indexing, centered on a single `videos` table.
3. Document the required fields for Milestone 0 indexing metadata: stable video identifier, local filepath, fps, frame_count, width, height, and duration_seconds, plus minimal uniqueness and integrity constraints to avoid duplicate indexing.
4. Document repository-owned storage boundaries for Milestone 0: `data/` for SQLite-backed metadata, `masks/` reserved for later mask artifacts, and `exports/` reserved for later export outputs.
5. State the frame indexing contract: backend-decoded frames are canonical, internal frame indices are zero-based, and browser `currentTime` never defines canonical annotation identity.
6. Explicitly defer object, annotation, mask, SAM2, propagation, and export lifecycle details to later milestone docs.
7. Update `docs/engineering/README.md` so the data model spec is discoverable.
8. Verify with `make format-check`, `make lint`, and `make typecheck`.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Plan reviewer approved keeping the SQLite path contract at the `data/` directory level without inventing a specific database filename.

Created `docs/engineering/data-model.md` and linked it from `docs/engineering/README.md`.

Reviewer checklist for this document covered: required `videos` fields, repository-owned storage boundaries, frame-index contract, uniqueness and integrity constraints, and explicit lifecycle deferrals.

Verified on final state with `make format-check`, `make lint`, and `make typecheck`. `make typecheck` exited successfully but printed an informational Pyright message caused by an unrelated unstaged `backend/pyproject.toml` change in the working tree.

Equivalent scoped verification for this docs-only task was reviewer approval against `docs/spec.md` plus direct inspection of the new data model spec.
<!-- SECTION:NOTES:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Added `docs/engineering/data-model.md` as the Milestone 0 data model contract and linked it from `docs/engineering/README.md`. The new spec defines the initial SQLite `videos` table contract for indexing metadata, documents the repository-owned storage boundaries for `data/`, `masks/`, and `exports/`, preserves the backend-canonical zero-based frame-index contract, and explicitly defers object, annotation, mask, SAM2, propagation, and export lifecycle details to later milestone docs.

Verification:
- `make format-check`
- `make lint`
- `make typecheck` (successful exit; informational Pyright message came from an unrelated unstaged `backend/pyproject.toml` change)
- Reviewer approval against `docs/spec.md` for the final document state
<!-- SECTION:FINAL_SUMMARY:END -->

## Definition of Done
<!-- DOD:BEGIN -->
- [x] #1 Run `make format-check`
- [x] #2 Run `make lint`
- [x] #3 Run `make typecheck`
- [x] #4 Run scoped tests or equivalent verification
<!-- DOD:END -->
