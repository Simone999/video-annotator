---
title: Add whole-object mask cleanup plan
type: plan
status: done
permalink: video-annotator/plans/add-whole-object-mask-cleanup-plan
tags:
- plan
- backend
- frontend
- masks
- cleanup
- m-4
---

# Add whole-object mask cleanup plan

Add one object-scoped mask cleanup path that clears persisted masks across frames without touching unrelated objects or turning cleanup into full track delete.

## Summary
- Goal: ship backend and live-review cleanup for one selected object's masks across frames while preserving box-backed rows and deleting mask-only propagated rows.
- Success criteria: backend route deletes only selected-object mask data, live review exposes distinct whole-object scope copy and action, current frame refreshes honestly after cleanup, and browser proof shows unrelated object masks stay intact.
- Audience: agent or engineer implementing `US-033` on `ralph/ui`.

## Current State
- Existing behavior: frame-local cleanup already uses per-row semantics that clear only mask fields when box truth exists and delete propagated mask-only rows.
- Main gap: no route or UI action applies same contract across all frames for one selected object.
- Constraint: keep current review-route layout direction from committed `docs/ui/video-review-1920x1080.png`; extend current inspector controls instead of redesigning shell.

## Assumptions And Open Questions
- Locked assumptions:
  - whole-object cleanup should reuse frame-local row semantics for every persisted row with `mask_path`, not invent new storage states.
  - current-frame UI should refresh from backend after cleanup so mask-only row deletion versus mask-field clearing stays honest.
  - unrelated object rows and masks must remain untouched.
- Open questions:
  - none current

## Affected Features
- [[Mask Editing and Cleanup]]

## Task Breakdown
1. [[Add whole-object mask cleanup]] — add backend route, frontend action, tests, and browser proof for object-scoped mask cleanup.
2. [[Review m-4 cleanup checkpoint]] — review cleanup slice after whole-object path lands.

## Handoff Notes
- Read first: `AGENTS.md`, `[[Workflow]]`, `[[Mask Editing and Cleanup]]`, `backend/app/services/frame_annotations.py`, `backend/app/api/videos.py`, `frontend/src/features/video-review/hooks/use-sam2-workspace.ts`, `frontend/src/features/video-review/hooks/use-live-review-controller.ts`, and `frontend/src/features/video-review/components/review-inspector-panel.tsx`.
- Red tests first:
  - backend integration proves selected object loses masks across frames while other object rows stay intact
  - backend route unit test maps route errors and `204`
  - frontend API or workspace or controller tests prove request path and current-frame refresh
  - live-review integration proves scope copy, current-frame refresh, and unrelated object still shows mask on next frame or same frame
- Keep implementation surgical: one new delete route, one workspace API path, one controller action, one inspector button block.
