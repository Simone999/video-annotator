---
title: Mask Editing and Cleanup
type: note
permalink: video-annotator/features/mask-editing-and-cleanup
tags:
- feature
- masks
- editing
- cleanup
---

# Mask Editing and Cleanup

This feature owns manual correction of persisted masks after they already exist, including refine behavior, brush editing, deletion, cleanup, and corrected-state reopen.

## Summary

- Goal: let reviewers correct or safely remove persisted masks without corrupting unrelated annotation state
- Primary users: reviewers cleaning up wrong prompt or propagation outputs
- Owning task note: [[Testing mask editing and cleanup]]

## Scope

- In scope:
  - same-frame refine-mask API
  - brush add and brush erase tools
  - delete one mask on one frame without deleting unrelated row data
  - delete all masks for one object
  - corrected-mask persistence with updated source and keyframe semantics
  - reopen of edited-mask state
- Out of scope:
  - initial SAM2 prompt-box and propagation shell
  - export packaging
  - import

## Current State

- Shipped behavior: repo can reopen persisted prompt or propagation masks through normal frame reads, and full manual annotation rows can be deleted.
- Known gaps: no refine route, brush tools, mask-only delete routes, object-level cleanup route, corrected-mask persistence semantics, or reopen flow for edited masks exist yet.
- Current blockers: real mask-cleanup workflows stay blocked until refine and cleanup contracts exist.

## Target Behavior

- Reviewer can refine a mask on the same canonical frame, inspect the result, and persist corrected mask state.
- Reviewer can brush-add or brush-erase mask regions without losing object identity or unrelated frames.
- Reviewer can remove one wrong mask or clean all masks for one object with clear scope and predictable persistence behavior.
- Corrected mask state reopens as durable truth later, with clear source and keyframe metadata.

## Contracts and Dependencies

- Backend contracts:
  - future `POST /api/videos/{video_id}/sam2/refine-mask`
  - future mask delete and cleanup routes
  - frame annotation reads must reopen corrected mask state
- Frontend contracts:
  - exact-frame canvas must support mask brush interaction
  - cleanup actions must scope correctly to one frame or one object
- Data or storage contracts:
  - corrected mask state must reopen through frame annotation reads without corrupting unrelated annotation data
- External dependencies:
  - SAM2 shell and runtime
  - annotation persistence
  - mask storage on disk

## Evidence

- Specs:
  - [[Product Requirements]]
  - [[Frontend Interaction Spec]]
  - [[API]]
  - [[Data Model]]
- Milestone notes:
  - [[m-4: Mask Editing and Cleanup]]
- Code or test evidence:
  - concrete implementation and verification inventory intentionally lives in task notes and testing guidance, not in this feature note

## Linked Tasks

- [[Testing mask editing and cleanup]]

## Integration Tests

| ID | Surface | Scenario | Real-World Why | Setup/Fixtures | Automation Status | Evidence |
| --- | --- | --- | --- | --- | --- | --- |
| INT-001 | backend | Example integration scenario | Why operator or system cares | Fixtures or stack setup | planned | Link or note |
| INT-002 | frontend | Example integration scenario | Why operator or system cares | Fixtures or stack setup | planned | Link or note |

## E2E Tests

| ID | Scenario | Real-World Workflow | Environment | Automation Status | Evidence |
| --- | --- | --- | --- | --- | --- |
| E2E-001 | Example e2e scenario | Real workflow or failure path | Local stack or fixture env | planned | Link or note |

## Manual Tests

Use exact execution status values only:
- `✅ Done`
- `⚠️ Partially`
- `❌ Not Done`

| ID | Scenario | Setup | Steps | Expected Result | Execution Status | Execution Notes |
| --- | --- | --- | --- | --- | --- | --- |
| MAN-001 | Example manual scenario | Required environment | Concrete steps | What operator should see | ❌ Not Done | Write why and what is missing |

## Observations

- [status] This feature area is mostly unimplemented; only prerequisite view or reopen behavior exists.
- [guardrail] Do not confuse full annotation row delete with safe mask-only cleanup.
- [dependency] Stable persisted mask reopen is the main prerequisite that already exists today.
- [retrieval] Use this note for mask editing, refine-mask, mask cleanup, or corrected-mask reopen queries.

## Relations

- relates_to [[Repo Current State and Feature Matrix]]
- relates_to [[m-4: Mask Editing and Cleanup]]
- relates_to [[Product Requirements]]
- relates_to [[Frontend Interaction Spec]]
- relates_to [[API]]
