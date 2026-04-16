---
title: 'm-2: Review Workspace Completion'
type: note
permalink: video-annotator/milestones/m-2-review-workspace-completion
tags:
- milestone
- roadmap
- frontend
- review
---

# m-2: Review Workspace Completion

This milestone finishes the operator-facing review workspace once annotation foundation is real.

## Status
Planned.

## Goal
Reviewer can open one video and navigate annotation work without typing raw frame numbers or raw object ids for every action.

## Depends On
- m-1 annotation foundation must ship first.

## Missing
- Auto-load frame `0` or first annotated frame on video open.
- Left-side object panel with object id, label, color, and current-frame presence.
- Previous and next annotated-frame navigation.
- Previous and next keyframe navigation.
- Timeline markers for annotated frames, keyframes, and propagation context.
- Adjustable mask opacity.
- Keyboard shortcuts for play or pause, frame step, frame jumps, tool switching, delete, and save.

## Acceptance Gate
- Opening a video loads playback and exact-frame review together with useful default frame selection.
- Reviewer can jump through annotated frames and keyframes without typing frame numbers each time.
- Object list shows stable object metadata and current-frame presence.
- Mask opacity can be adjusted during review.
- Core keyboard controls match `[[Frontend Interaction Spec]]`.

## Evidence
- `frontend/src/app/App.tsx` has playback pane and exact-frame pane, but no object panel, no annotated-frame navigation, no keyframe navigation, no timeline markers, and no mask opacity control.
- `frontend/src/app/app.css` sets fixed mask opacity classes instead of user-controlled opacity.
- `frontend/src/features/video-review/workspace.ts` loads exact frame and SAM2 job state, but not manifest-driven review navigation state.

## Dumb Subagent Check
One context-poor subagent can implement each task under this milestone by reading `[[Frontend Interaction Spec]]`, `[[Product Requirements]]`, `[[API]]`, `[[Test Plan]]`, and this note. If one task mixes object panel, timeline, shortcuts, and opacity together, split it.

## Observations
- [dependency] m-2 is frontend workflow polish that should land only after object and manual box persistence are real.
- [scope] m-2 is about review ergonomics, not new storage primitives.
- [guardrail] Each m-2 task should map to one visible operator capability.

## Relations
- part_of [[Milestones Index]]
- depends_on [[m-1: Annotation Foundation]]
- depends_on [[Frontend Interaction Spec]]
- depends_on [[Product Requirements]]
- depends_on [[API]]
- depends_on [[Test Plan]]
- relates_to [[Task Breakdown Guide]]
