---
id: TASK-3.9
title: Define Milestone 0 frontend interaction spec
status: Done
assignee:
  - codex
created_date: '2026-04-10 13:57'
updated_date: '2026-04-10 15:04'
labels:
  - milestone-0
  - docs
  - frontend
milestone: m-0
dependencies:
  - TASK-3.4
  - TASK-3.5
references:
  - docs/engineering/frontend-interaction-spec.md
documentation:
  - docs/spec.md
  - docs/product/requirements.md
  - AGENTS.md
parent_task_id: TASK-3
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Write the interaction contract for the empty two-pane frontend shell, including placeholder regions, reserved shortcuts, and explicit deferrals for later annotation behavior.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 The frontend interaction spec defines the placeholder two-pane layout for playback and exact-frame work.
- [x] #2 Reserved keyboard shortcuts from the spec are recorded without implying later-milestone behavior is already implemented.
- [x] #3 Selection rules, annotation tools, and timeline behavior beyond Milestone 0 are explicitly deferred.
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Create `docs/engineering/frontend-interaction-spec.md` as the Milestone 0 frontend interaction contract.
2. Define the placeholder shell layout for Milestone 0: left and right side regions may exist as placeholders, but the center area must preserve the spec’s two-pane workflow with playback on top and exact-frame work below.
3. Record the reserved keyboard shortcuts from `docs/spec.md` exactly, while stating that Milestone 0 only reserves these bindings and does not imply later interaction behavior is implemented yet.
4. Document only the minimum placeholder behavior needed for the empty shell: visible regions, placeholder labels, and the rule that canonical annotation work belongs to backend-driven exact-frame views rather than browser playback.
5. Explicitly defer selection rules, annotation tools, object panel behavior, and timeline behavior beyond placeholder regions to later milestone docs.
6. Update `docs/engineering/README.md` so the frontend interaction spec is discoverable.
7. Verify with `make format-check`, `make lint`, and `make typecheck`.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Document review checklist for this task: preserve the playback/exact-frame two-pane center workflow; record only the exact shortcut list from the spec; separate Milestone 0 placeholders from later annotation behavior; avoid implying selection, tool semantics, object panel actions, or timeline markers already exist; keep the README change limited to discoverability.

Created `docs/engineering/frontend-interaction-spec.md` and linked it from `docs/engineering/README.md`.

Document review checklist for this task was satisfied locally: preserved the playback/exact-frame two-pane center workflow, recorded only the exact shortcut list from the spec, separated Milestone 0 placeholders from later annotation behavior, deferred selection/tool/object-panel/timeline semantics, and kept the README change limited to discoverability.

Verified on final state with `make format-check`, `make lint`, and `make typecheck`. `make typecheck` exited successfully but printed an informational Pyright message caused by an unrelated unstaged `backend/pyproject.toml` change in the working tree.

`doc_explorer` review was attempted twice but failed because of temporary high demand, so final document verification fell back to the explicit local checklist plus direct inspection.
<!-- SECTION:NOTES:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Added `docs/engineering/frontend-interaction-spec.md` as the Milestone 0 interaction contract and linked it from `docs/engineering/README.md`. The new spec defines the empty shell layout around the two-pane center workflow, records the exact reserved shortcut list from `docs/spec.md` without implying the later behaviors already exist, preserves the backend-canonical exact-frame rule, and explicitly defers selection, tool, object-panel, and timeline semantics to later milestone docs.

Verification:
- `make format-check`
- `make lint`
- `make typecheck` (successful exit; informational Pyright message came from an unrelated unstaged `backend/pyproject.toml` change)
- Local checklist-based document review after two `doc_explorer` attempts failed due temporary high demand
<!-- SECTION:FINAL_SUMMARY:END -->

## Definition of Done
<!-- DOD:BEGIN -->
- [x] #1 Run `make format-check`
- [x] #2 Run `make lint`
- [x] #3 Run `make typecheck`
- [x] #4 Run scoped tests or equivalent verification
<!-- DOD:END -->
