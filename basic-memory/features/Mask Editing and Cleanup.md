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
  - frame-local mask cleanup route
  - whole-object mask cleanup route
  - frame annotation reads must reopen corrected mask state
- Frontend contracts:
  - paused review stage must support mask brush interaction on overlayed annotations
  - cleanup actions must scope correctly to one frame or one object
- Data or storage contracts:
  - corrected mask state must reopen through frame annotation reads without corrupting unrelated annotation data

## Verification Strategy

- Durable evidence today:
  - `backend/tests/integration/api/test_sam2_shell_runtime.py`
  - `frontend/tests/integration/video-review/live-review-screen.test.tsx`
- That evidence proves reopen prerequisites only. It is not refine or cleanup proof.
- Future backend proof must freeze corrected-mask persistence and cleanup scope.
- Future frontend and browser proof must cover brush editing, frame-local cleanup, and whole-object cleanup.

## Observations

- [status] This feature area is mostly unimplemented; only prerequisite reopen behavior exists. #masks
- [scope] Manual annotation row delete belongs to manual-box workflow; this note owns mask-specific correction and cleanup. #masks #scope
- [guardrail] Do not confuse full annotation row delete with safe mask-only cleanup. #cleanup
- [testing] Existing persisted-mask reopen tests are prerequisite evidence only; they do not imply refine, brush, or cleanup workflows already ship. #testing
- [dependency] Stable persisted mask reopen is the main prerequisite that already exists today. #masks
- [retrieval] Use this note for refine-mask, mask cleanup, or corrected-mask reopen queries. #search

## Relations

- relates_to [[Product Requirements]]
- relates_to [[Frontend Interaction Spec]]
- relates_to [[API]]
