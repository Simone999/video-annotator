---
title: Jump to frame interaction
type: note
permalink: video-annotator/frontend/jump-to-frame-interaction
tags:
- frontend
- exact-frame
- interaction
---

# Jump to frame interaction

This note answers when the review UI is allowed to change the visible frame
number after a user types a target frame. The jump input is draft UI state.
Only a successful backend exact-frame fetch is allowed to update the canonical
`currentFrameIndex`.

That rule keeps the frame label, exact-frame image, and annotation identity
aligned around backend truth. The feature workspace owns request state and blob
state, while the rendering component owns browser object URL lifecycle for the
displayed image.

## Observations
- [pattern] Treat jump input as draft UI state and update canonical `currentFrameIndex` only after the backend exact-frame request succeeds. #frontend #ux
- [behavior] Render the exact frame from backend PNG bytes rather than from browser playback position. #frontend #exact-frame
- [technique] Frontend tests can stub `URL.createObjectURL` and `URL.revokeObjectURL` to verify repeated same-frame reloads without real media fixtures. #testing #vitest
- [technique] Browser verification for jump flow can intercept list, detail, source, and frame routes, then assert the canonical frame label and exact-frame image render. #playwright #verification

- [pattern] After an exact-frame fetch succeeds, load that frame's annotation rows as a follow-up request so annotation errors do not blank an already rendered backend frame. #frontend #annotations
- [pattern] Render box overlays inside a relative wrapper sized by the displayed image element so normalized `xywh` percentages map to the actual backend frame pixels on screen. #frontend #overlay

## Relations
- depends_on [[Video review workspace state]]
- depends_on [[Exact frame API]]
- relates_to [[Frame stepping interaction]]
- relates_to [[Live video smoke validation]]
