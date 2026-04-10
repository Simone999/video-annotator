---
id: TASK-3.10
title: Stub SAM2 integration spec
status: Done
assignee:
  - codex
created_date: '2026-04-10 13:57'
updated_date: '2026-04-10 20:49'
labels:
  - milestone-0
  - docs
  - sam2
milestone: m-0
dependencies:
  - TASK-3.4
  - TASK-3.5
references:
  - docs/engineering/sam2-integration-spec.md
documentation:
  - docs/spec.md
  - AGENTS.md
parent_task_id: TASK-3
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Create the required SAM2 integration spec as a Milestone 0 foundation document that captures local-only assumptions and clearly defers unsupported implementation details.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 A SAM2 integration spec file exists in the engineering docs set.
- [x] #2 The document records only Milestone 0 baseline assumptions and explicitly defers implementation details to later milestones.
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Create `docs/engineering/sam2-integration-spec.md` as the required Milestone 0 SAM2 foundation document.
2. Record only the baseline architecture and reuse rules that are already defined: SAM2 is an assistive service, isolated behind a worker or service boundary, local-only, and separate from storage ownership.
3. Document the approved reuse boundaries from `~/projects/sam2/demo`: reuse session lifecycle logic, predictor wrapper, prompt flow, propagation flow, RLE helpers, and multipart streaming patterns; explicitly forbid copying Flask structure, demo auth/gallery flows, generic demo UX, or GraphQL assumptions.
4. Stub the future sections the spec requires: session lifecycle, prompt flow, propagation flow, serialization format, and cleanup behavior, but mark their implementation details as deferred to later milestones.
5. Call out what stays out of Milestone 0 scope: model download procedures, live inference behavior, GPU/runtime operations, prompt and propagation endpoints, and any implemented SAM2 UX.
6. Update `docs/engineering/README.md` so the SAM2 integration spec is discoverable.
7. Verify with `make format-check`, `make lint`, and `make typecheck`.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Attempted `doc_explorer` plan review for TASK-3.10, but the service returned a temporary high-demand error. Proceeding with the same checklist locally to avoid stalling Milestone 0 doc work.

Created `docs/engineering/sam2-integration-spec.md` and linked it from `docs/engineering/README.md`.

Local review checklist for this document was satisfied: kept the document at the Milestone 0 assumption/stub level; captured the service-boundary and reuse constraints from the spec; stubbed the required future sections without pretending they are implemented; explicitly deferred runtime, API, and UX details; and kept the README change limited to discoverability.

Verified on final state with `make format-check`, `make lint`, and `make typecheck`. `make typecheck` exited successfully but printed an informational Pyright message caused by an unrelated unstaged `backend/pyproject.toml` change in the working tree.

`doc_explorer` plan review failed because of temporary high demand, so document verification also used the same explicit local checklist plus direct inspection.
<!-- SECTION:NOTES:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Added `docs/engineering/sam2-integration-spec.md` as the Milestone 0 SAM2 foundation document and linked it from `docs/engineering/README.md`. The new spec records the local-only SAM2 service boundary, the approved and forbidden reuse boundaries from `~/projects/sam2/demo`, and stubs the required future sections for session lifecycle, prompt flow, propagation flow, serialization, and cleanup while explicitly deferring all implementation details to later milestones.

Verification:
- `make format-check`
- `make lint`
- `make typecheck` (successful exit; informational Pyright message came from an unrelated unstaged `backend/pyproject.toml` change)
- Local checklist-based document review after `doc_explorer` was unavailable
<!-- SECTION:FINAL_SUMMARY:END -->

## Definition of Done
<!-- DOD:BEGIN -->
- [x] #1 Run `make format-check`
- [x] #2 Run `make lint`
- [x] #3 Run `make typecheck`
- [x] #4 Run scoped tests or equivalent verification
<!-- DOD:END -->
