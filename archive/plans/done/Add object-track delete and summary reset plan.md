---
title: Add object-track delete and summary reset plan
type: plan
status: done
permalink: video-annotator/plans/add-object-track-delete-and-summary-reset-plan
tags:
- plan
- backend
- frontend
- objects
- masks
- m-4
---

# Add object-track delete and summary reset plan

Add one whole-object delete path that removes stable track identity plus linked frame annotations, then reloads live review inspector and overlays from backend truth without stale selected-object summary.

## Summary
- Goal: ship backend and live-review whole-track delete for one selected object with honest summary or confidence reset and current review-route chrome direction intact.
- Success criteria: backend route deletes selected object track and linked annotations only, frontend refreshes manifest and current frame after delete, inspector falls back or clears without stale deleted-object data, and browser proof shows route still matches committed PNG direction.
- Audience: agent or engineer implementing `US-035` on `ralph/ui`.

## Current State
- Existing behavior: manual box delete removes one frame row, frame-local mask cleanup removes one mask, and whole-object mask cleanup clears masks but keeps track identity and box rows.
- Main gap: no route or UI action deletes one whole object track and reloads manifest-owned selection plus inspector summary truth.
- Constraint: keep current review-route layout direction from committed `docs/ui/video-review-1920x1080.png`; extend current inspector controls instead of redesigning shell.

## Assumptions And Open Questions
- Locked assumptions:
  - whole-track delete removes selected `ObjectTrack` and all linked `FrameAnnotation` rows instead of rewriting them into maskless leftovers
  - persisted mask PNG files tied to deleted rows must be removed with row deletion
  - selected-object fallback stays manifest-driven: first surviving object becomes selection, or `null` when none remain
- Open questions:
  - none current

## Affected Features
- [[Mask Editing and Cleanup]]
- [[Annotation Foundation and Manual Box Workflow]]

## Task Breakdown
1. [[Add object-track delete and summary reset]] — add backend route or service, frontend action, tests, and browser proof for whole-track delete with honest summary reset.
2. [[Review m-4 parity and drift]] — review full cleanup and delete slice after implementation lands.

## Handoff Notes
- Read first: `AGENTS.md`, `[[Workflow]]`, `[[Mask Editing and Cleanup]]`, `[[Annotation Foundation and Manual Box Workflow]]`, `backend/app/services/object_tracks.py`, `backend/app/api/videos.py`, `frontend/src/features/video-review/hooks/use-sam2-workspace.ts`, `frontend/src/features/video-review/hooks/use-live-review-controller.ts`, and `frontend/src/features/video-review/components/review-inspector-panel.tsx`.
- Red tests first:
  - backend integration proves selected object track delete removes linked annotations and keeps unrelated object rows reloadable
  - backend route unit test maps missing video or object to explicit HTTP errors and `204` success
  - frontend integration proves delete affordance, manifest-backed selection fallback, current-frame reload, and stale summary removal
  - focused workspace or controller test proves delete flow refreshes manifest before reloading current frame
- Keep implementation surgical: one backend service, one delete route, one frontend client path, one workspace action, one controller affordance, one inspector block.
