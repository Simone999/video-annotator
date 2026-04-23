---
title: Mask Editing and Cleanup
type: feature
canonical: true
domain: masks
aliases:
- mask cleanup
- refine mask
- corrected mask
status: active
permalink: video-annotator/features/mask-editing-and-cleanup
tags:
- feature
- masks
- editing
- cleanup
---

# Mask Editing and Cleanup

This feature owns manual correction of persisted masks after they already exist, including refine behavior, brush editing, deletion, cleanup, and corrected-state reopen.

## Target Behavior

- Reviewer can refine a mask on the same canonical frame and persist corrected state.
- Reviewer can brush-add or brush-erase mask regions without losing object identity or unrelated frames.
- Reviewer can remove one wrong mask or clean all masks for one object with clear scope and predictable persistence behavior.
- Reviewer can delete one whole object track and all linked annotation rows when cleanup is not enough.
- Corrected mask state reopens later with clear source and keyframe metadata.

## Contracts

- Backend contracts:
  - `POST /api/videos/{video_id}/sam2/refine-mask`
  - `DELETE /api/videos/{video_id}/annotations/frame/{frame_idx}/object/{object_id}/mask`
  - `DELETE /api/videos/{video_id}/annotations/object/{object_id}/masks`
  - `DELETE /api/videos/{video_id}/objects/{object_id}`
  - refine backend seeds from persisted same-frame mask PNG instead of needing frontend seed-path payload
  - corrected mask writes reuse `FrameAnnotation.source = "sam2_edited"` instead of a new provenance field
  - corrected propagated rows keep `is_keyframe = false`; corrected keyframes keep `is_keyframe = true`
  - frame-local mask cleanup clears only mask fields when box truth still exists on that frame; mask-only propagated rows are deleted instead of leaving empty ghost rows
  - whole-object mask cleanup reuses that same per-row clear-or-delete contract across all rows for one selected object and must not touch unrelated object rows
  - whole-track delete removes selected `ObjectTrack`, all linked `FrameAnnotation` rows, and any backing mask PNG files for those deleted rows
  - frame annotation reads must reopen corrected mask state
  - selected-object summary counts only non-keyframe `source = "sam2_edited"` rows as `track_summary.corrected`
- Frontend contracts:
  - paused review stage must support mask brush interaction on overlayed annotations
  - cleanup actions must scope correctly to one frame or one object
  - whole-track delete must refetch manifest before current-frame reload so selected-object fallback and summary reset come from backend truth
- Data or storage contracts:
  - corrected mask state must reopen through frame annotation reads without corrupting unrelated annotation data
  - corrected rows keep `mask_confidence = null` even when replaced SAM2 row used to have numeric confidence
  - refine route stays same-frame and returns persisted annotation payload for accepted corrected mask
  - refine preserves existing box truth; propagated rows without box coordinates stay `box_xywh_norm = null`

## Verification Strategy

- Durable evidence today:
  - `backend/tests/integration/api/test_review_summary_contracts.py`
  - `backend/tests/integration/api/test_sam2_shell_runtime.py`
  - `frontend/tests/integration/video-review/live-review-screen.test.tsx`
- `frontend/tests/unit/video-review/workspace.test.ts`
- `frontend/tests/unit/video-review/state.test.ts`
- Current backend evidence freezes corrected summary, confidence reset, same-frame refine persistence, and frame-local cleanup scope.
- Current backend evidence freezes corrected summary, confidence reset, same-frame refine persistence, frame-local cleanup scope, and whole-object cleanup isolation.
- Current backend evidence also freezes whole-track delete scope through `backend/tests/integration/api/test_annotation_foundation_manual_box.py`.
- Current frontend and browser evidence freeze same-frame refine plus frame-local cleanup, whole-object cleanup, and whole-track delete interactions on live review.

## Observations

- [status] Same-frame refine, frame-local cleanup, whole-object cleanup, and whole-track delete now ship. #masks
- [scope] Manual annotation row delete belongs to manual-box workflow; this note owns mask-specific correction and cleanup. #masks #scope
- [guardrail] Do not confuse full annotation row delete with safe mask-only cleanup. #cleanup
- [contract] Corrected persistence reuses `source = "sam2_edited"`; only non-keyframe corrected rows count toward selected-range `corrected`. #masks #summary
- [contract] Frame-local cleanup preserves row truth only when box data still exists; mask-only propagated rows should be deleted so summary counters do not keep ghost frames. #cleanup #contract
- [contract] Whole-object cleanup must apply that same row-level rule across every selected-object frame and leave unrelated object rows untouched. #cleanup #contract
- [contract] Whole-track delete is stronger than cleanup: it removes the selected object row, all linked annotation rows, and their mask PNG files, then frontend must refetch manifest before current-frame reload. #objects #cleanup #contract
- [testing] Existing persisted-mask reopen tests are prerequisite evidence only; they do not imply refine, brush, or cleanup workflows already ship. #testing
- [dependency] Stable persisted mask reopen is the main prerequisite that already exists today. #masks
- [retrieval] Use this note for refine-mask, mask cleanup, or corrected-mask reopen queries. #search

## Relations

- relates_to [[Product Requirements]]
- relates_to [[Frontend Interaction Spec]]
- relates_to [[API]]
