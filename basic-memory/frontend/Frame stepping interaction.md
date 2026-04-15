---
title: Frame stepping interaction
type: note
permalink: video-annotator/frontend/frame-stepping-interaction
tags:
- frontend
- exact-frame
- navigation
---

# Frame stepping interaction

This note answers how previous and next frame controls should behave. Frame
stepping is not a separate state machine. It reuses the same backend exact-frame
fetch path as jump-to-frame so the canonical frame label, blob state, and
rendered image stay synchronized.

The selected video's persisted `frame_count` defines the navigation bounds.
Controls clamp target indices and disable at the boundaries instead of issuing
redundant requests that would only bounce off the backend.

## Observations
- [pattern] Previous and next controls clamp target indices with selected video `frame_count` and disable boundary buttons instead of issuing redundant requests. #frontend #ux
- [pattern] Frame stepping reuses the same exact-frame fetch path as jump-to-frame so canonical state, blob state, and rendered image stay in sync. #frontend #state
- [technique] UI tests for stepped navigation should wait for the input-sync effect after the canonical frame label changes because the input value updates on a later render. #testing #vitest
- [technique] Browser verification should assert disabled buttons at frame `0` and `frame_count - 1`. #playwright #verification

## Relations
- depends_on [[Video review workspace state]]
- depends_on [[Exact frame API]]
- relates_to [[Jump to frame interaction]]
- relates_to [[Live video smoke validation]]
