---
title: Mask Editing and Cleanup
type: feature
canonical: true
domain: masks
aliases:
- mask cleanup
- refine mask
- corrected mask
status: draft
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
- Corrected mask state reopens later with clear source and keyframe metadata.

## Contracts

- Backend contracts:
  - `POST /api/videos/{video_id}/sam2/refine-mask`
  - refine backend seeds from persisted same-frame mask PNG instead of needing frontend seed-path payload
  - corrected mask writes reuse `FrameAnnotation.source = "sam2_edited"` instead of a new provenance field
  - corrected propagated rows keep `is_keyframe = false`; corrected keyframes keep `is_keyframe = true`
  - frame-local mask cleanup route
  - whole-object mask cleanup route
  - frame annotation reads must reopen corrected mask state
  - selected-object summary counts only non-keyframe `source = "sam2_edited"` rows as `track_summary.corrected`
- Frontend contracts:
  - paused review stage must support mask brush interaction on overlayed annotations
  - cleanup actions must scope correctly to one frame or one object
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
- Current backend evidence freezes corrected summary, confidence reset, and same-frame refine persistence contract.
- Future backend proof must still freeze cleanup scope.
- Future frontend and browser proof must cover brush editing, frame-local cleanup, and whole-object cleanup.

## Observations

- [status] Same-frame refine backend now ships; brush UI and cleanup flows remain unimplemented. #masks
- [scope] Manual annotation row delete belongs to manual-box workflow; this note owns mask-specific correction and cleanup. #masks #scope
- [guardrail] Do not confuse full annotation row delete with safe mask-only cleanup. #cleanup
- [contract] Corrected persistence reuses `source = "sam2_edited"`; only non-keyframe corrected rows count toward selected-range `corrected`. #masks #summary
- [testing] Existing persisted-mask reopen tests are prerequisite evidence only; they do not imply refine, brush, or cleanup workflows already ship. #testing
- [dependency] Stable persisted mask reopen is the main prerequisite that already exists today. #masks
- [retrieval] Use this note for refine-mask, mask cleanup, or corrected-mask reopen queries. #search

## Relations

- relates_to [[Product Requirements]]
- relates_to [[Frontend Interaction Spec]]
- relates_to [[API]]
