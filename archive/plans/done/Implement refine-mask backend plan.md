---
title: Implement refine-mask backend plan
type: plan
status: done
permalink: video-annotator/plans/implement-refine-mask-backend-plan
tags:
- plan
- backend
- sam2
- masks
- m-4
---

# Implement refine-mask backend plan

Ship one same-frame refine backend path that reuses existing SAM2 session state, persists corrected-mask truth, and reopens through normal frame reads.

## Summary
- Goal: expose `POST /api/videos/{video_id}/sam2/refine-mask` with corrected persistence semantics for one existing persisted mask on one canonical frame.
- Success criteria: backend route persists `source = "sam2_edited"` with `mask_confidence = null`, preserves existing box and keyframe semantics, and backend tests prove reopen behavior.
- Audience: engineers implementing m-4 backend refine and later UI brush-edit work.

## Current State
- Existing behavior: prompt-box and propagation routes persist SAM2 masks, but no refine route exists and no persistence helper writes corrected same-frame masks.
- Main gaps: API schema missing, route missing, service seam missing, and no test proves corrected refine replaces existing mask bytes without breaking reopen reads.
- Constraints: canonical frame index stays source of truth; refine must stay same-frame; corrected rows reuse `source = "sam2_edited"` and clear confidence.

## Assumptions And Open Questions
- Locked assumptions:
  - refine uses one existing persisted annotation row for same `video_id`, `frame_idx`, and `object_id`
  - refine preserves stored normalized box and existing keyframe flag instead of recomputing box from points
  - refine may reuse persisted mask path and overwrite mask bytes for same frame or object target
- Open questions:
  - none current

## Affected Features
- [[Mask Editing and Cleanup]]
- [[SAM2 Shell and Runtime]]

## Task Breakdown
1. [[Implement refine-mask backend]] — ships route, service seam, corrected persistence, tests, and tracking updates.
2. [[Build paused mask refine UI]] — uses shipped backend route from live review surface.

## Handoff Notes
- Read first: `AGENTS.md`, `[[Workflow]]`, `[[Mask Editing and Cleanup]]`, `[[SAM2 API]]`, `backend/app/api/videos.py`, `backend/app/services/sam2.py`, `backend/app/services/frame_annotations.py`, and `backend/tests/integration/api/test_sam2_shell_runtime.py`.
- Write red tests first for route response, reopen payload, and replaced PNG bytes.
- Keep scope surgical: no cleanup routes, no summary reset work beyond corrected refine persistence, no frontend edits.
