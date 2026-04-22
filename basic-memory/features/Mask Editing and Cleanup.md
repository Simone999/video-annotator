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

- Shipped behavior: repo can reopen persisted prompt or propagation masks through normal frame reads, and full manual annotation rows can be deleted through manual-box workflow. Those are prerequisites only, not real mask-editing or mask-cleanup workflows.
- Known gaps: no refine route, brush tools, mask-only delete routes, object-level cleanup route, corrected-mask persistence semantics, or reopen flow for edited masks exist yet.
- Current blockers: real mask-cleanup workflows stay blocked until refine and cleanup contracts plus paused-stage controls exist.

## Verification Evidence

- Backend prerequisite: `backend/tests/integration/api/test_sam2_shell_runtime.py` proves fake-adapter prompt or propagation masks persist and reopen through `GET /api/videos/{video_id}/annotations/frame/{frame_idx}`.
- Frontend prerequisite: `frontend/tests/integration/video-review/live-review-screen.test.tsx` proves `LiveReviewScreen` reloads and shows persisted SAM2 mask overlays from frame-annotation responses.
- Related non-goal evidence: `frontend/tests/integration/video-review/live-review-screen.test.tsx` proves `Delete saved box` deletes a whole manual annotation row; do not treat that as mask-only cleanup proof.
- Manual execution: blocked. Current app has no refine route, brush tool, one-frame mask cleanup action, or whole-object mask cleanup action to run honestly.

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
  - paused review stage must support mask brush interaction on overlayed annotations
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
- Code or test evidence:
  - concrete implementation and verification inventory intentionally lives in archive task notes and testing guidance, not in this feature note



## Integration Tests

| ID | Surface | Scenario | Real-World Why | Setup/Fixtures | Automation Status | Evidence |
| --- | --- | --- | --- | --- | --- | --- |
| INT-001 | backend | Reopen persisted prompt or propagation mask through frame-annotation read after fake-adapter SAM2 prompt or propagation work | Freezes prerequisite persisted-mask reopen truth so later refine or cleanup work starts from real backend evidence | Real FastAPI app, temp SQLite DB, fake `Sam2Service`, temp mask files | automated | `backend/tests/integration/api/test_sam2_shell_runtime.py` |
| INT-002 | frontend | Reload live review and show persisted SAM2 mask overlay from mocked frame-annotation payload | Proves current review UI can reopen existing persisted masks before any edit or cleanup workflow lands | `MSW` request-boundary stubs in `frontend/tests/integration/video-review/live-review-screen.test.tsx` | automated | `frontend/tests/integration/video-review/live-review-screen.test.tsx` |
| INT-003 | backend | Refine one persisted mask, persist corrected result, and reopen corrected state without corrupting unrelated rows | Future backend truth must freeze refine persistence and corrected-state reopen semantics once contract lands | Real FastAPI app, temp SQLite DB, fake or real mask service only at external boundary | blocked until route exists | missing `POST /api/videos/{video_id}/sam2/refine-mask` and corrected-mask persistence contract |
| INT-004 | backend | Remove one wrong mask from one frame without deleting unrelated row data | Future backend truth must freeze one-frame cleanup scope so mask deletion does not become whole-row corruption | Real FastAPI app, temp SQLite DB, persisted masks across adjacent frames | blocked until route exists | missing frame-local mask cleanup route and persistence semantics |
| INT-005 | backend | Remove all masks for one object across frames while leaving unrelated objects untouched | Future backend truth must freeze whole-object cleanup scope before UI can rely on it | Real FastAPI app, temp SQLite DB, persisted masks for multiple objects and frames | blocked until route exists | missing object-level mask cleanup route and persistence semantics |
| INT-006 | frontend | Brush-add or brush-erase one persisted mask, save it, and reload corrected result from paused review UI | Future review UI must prove visible correction workflow once brush controls exist | `LiveReviewScreen` with `MSW` or local stack once refine controls exist | blocked until controls exist | no paused-stage brush tools or refine save flow in current app |
| INT-007 | frontend | Trigger one-frame cleanup from paused review UI and verify only current-frame mask disappears after reload | Future review UI must prove one-frame cleanup affordance stays scoped correctly | `LiveReviewScreen` with `MSW` or local stack once frame cleanup control exists | blocked until controls exist | no frame-local mask cleanup action in current app |
| INT-008 | frontend | Trigger whole-object cleanup from paused review UI and verify unrelated objects remain after reload | Future review UI must prove object-level cleanup affordance stays scoped correctly | `LiveReviewScreen` with `MSW` or local stack once object cleanup control exists | blocked until controls exist | no whole-object mask cleanup action in current app |

## E2E Tests

No browser E2E rows yet. Router keeps current proof in prerequisite backend and frontend integration, and real browser workflow does not exist until refine and cleanup controls land end-to-end.

## Manual Tests

Use exact execution status values only:
- `✅ Done`
- `⚠️ Partially`
- `❌ Not Done`

| ID | Scenario | Setup | Steps | Expected Result | Execution Status | Execution Notes |
| --- | --- | --- | --- | --- | --- | --- |
| MAN-001 | Refine one propagated mask on one paused frame and reopen corrected state | Run local backend and frontend dev stack, open one real `/review/:videoId` route, use a video with existing persisted SAM2 mask | Load exact frame with persisted mask, enter refine mode, brush add and erase regions, save corrected mask, reload same frame, reopen app or frame | Corrected mask stays visible after reload, confidence clears if correction changes SAM2 output, and source or keyframe semantics update consistently | ❌ Not Done | Blocked because no refine route, no brush tools, and no corrected-mask persistence contract exist in current app |
| MAN-002 | Remove one wrong mask from one frame without deleting unrelated row data | Run local backend and frontend dev stack after frame-local cleanup action exists | Open frame with persisted mask, trigger one-frame cleanup, reload same frame, then inspect adjacent frames and same object metadata | Only target frame mask is removed; adjacent frames, object identity, and unrelated rows stay intact | ❌ Not Done | Blocked because current app has no mask-only delete route or UI action; existing `Delete saved box` workflow deletes whole manual annotation row instead |
| MAN-003 | Remove all masks for one object across frames with clear scope | Run local backend and frontend dev stack after object cleanup action exists | Open object with masks on multiple frames, trigger whole-object cleanup, reload affected frames, then inspect unrelated objects | All masks for selected object are gone, unrelated object data stays intact, and reload reflects cleanup consistently | ❌ Not Done | Blocked because current app has no whole-object mask cleanup route or UI action |

## Observations

- [status] This feature area is mostly unimplemented; only prerequisite view or reopen behavior exists.
- [guardrail] Do not confuse full annotation row delete with safe mask-only cleanup.
- [testing] Existing persisted-mask reopen tests are prerequisite evidence only; they do not imply refine, brush, or cleanup workflows already ship.
- [dependency] Stable persisted mask reopen is the main prerequisite that already exists today.
- [testing] Blocked refine and cleanup rows are now split by one backend or frontend workflow each, so future coverage follows router guidance instead of bundling several behaviors into one row. #testing #routing
- [retrieval] Use this note for mask editing, refine-mask, mask cleanup, or corrected-mask reopen queries.

## Relations

- relates_to [[Product Requirements]]
- relates_to [[Frontend Interaction Spec]]
- relates_to [[API]]
