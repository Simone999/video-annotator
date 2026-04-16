---
title: 'm-4: Mask Editing and Cleanup'
type: note
permalink: video-annotator/milestones/m-4-mask-editing-and-cleanup
tags:
- milestone
- roadmap
- masks
- editing
---

# m-4: Mask Editing and Cleanup

This milestone adds manual correction on top of persisted masks.

## Status
Planned.

## Goal
Reviewer can correct a mask, mark the frame as corrected, and remove bad masks or whole-track mask state safely.

## Missing
- Brush add tool.
- Brush erase tool.
- Delete one mask on one frame.
- Delete all masks for one object.
- Manual correction keyframe marker and persisted source update for edited masks.
- Reopen flow for edited mask state.

## Acceptance Gate
- User can add to or erase from one persisted mask on one exact frame.
- User can delete one frame mask without deleting unrelated frame annotations.
- User can delete all masks for one object with clear scope.
- Edited masks reopen as persisted corrected state and corrected frames are marked as keyframes.

## Evidence
- `frontend/src/features/video-review/exact-frame-canvas.tsx` only renders boxes and mask overlays. It has no brush interaction.
- `frontend/src/app/App.tsx` exposes prompt and propagation controls, but no mask editing or cleanup controls.
- `backend/app/api/videos.py` has mask read route only. No mask edit or delete routes exist.

## Dumb Subagent Check
One context-poor subagent can implement each m-4 task by reading `[[Product Requirements]]`, `[[Frontend Interaction Spec]]`, `[[API]]`, `[[Data Model]]`, `[[Test Plan]]`, and this note. If one task includes brush UX plus backend deletion rules plus correction-keyframe storage, split it.

## Observations
- [scope] m-4 is about manual correction and cleanup after masks already exist.
- [dependency] m-4 depends on m-1 persistence and m-3 runtime path, but its tasks should still stay independently testable.
- [guardrail] Separate brush behavior, delete behavior, and corrected-keyframe persistence into distinct tasks.

## Relations
- part_of [[Milestones Index]]
- depends_on [[m-1: Annotation Foundation]]
- depends_on [[m-3: SAM2 Runtime and Refinement]]
- depends_on [[Product Requirements]]
- depends_on [[Frontend Interaction Spec]]
- depends_on [[API]]
- depends_on [[Data Model]]
- depends_on [[Test Plan]]
- relates_to [[Task Breakdown Guide]]
