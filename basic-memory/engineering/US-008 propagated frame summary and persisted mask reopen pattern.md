---
title: US-008 propagated frame summary and persisted mask reopen pattern
type: note
permalink: video-annotator/engineering/us-008-propagated-frame-summary-and-persisted-mask-reopen-pattern
tags:
- frontend
- sam2
- propagation
- annotations
- playwright
---

# US-008 propagated frame summary and persisted mask reopen pattern

Milestone-03 propagation already persisted frame results through the backend job and annotation storage paths, but the review UI still hid those saved frames after a job finished. The useful frontend pattern is to treat the job result as discovery metadata only: it tells the user which frames now have persisted SAM2 output, but it must not become the source of mask truth.

The frontend now parses propagation job results into a typed shape at the API boundary, normalizes them into workspace state, and renders a small saved-frame summary in the exact-frame pane. Each saved frame button calls the same `loadExactFrame(frameIdx)` workflow used everywhere else, which re-fetches `/frame/{frame_idx}` and `/annotations/frame/{frame_idx}` together. That keeps propagated-frame reopen behavior aligned with canonical backend frame index state and ensures overlays come from persisted annotation storage rather than transient job memory.

Browser verification used mocked `/api` routes behind local Vite. The key evidence was: completed propagation exposed frame buttons for `8` and `9`, clicking `Open frame 8` switched the canonical frame index to `8`, and the overlay mask URL resolved to `/api/videos/video-123/annotations/frame/8/object/object-1/mask`.

## Observations
- [pattern] Treat propagation job `result` as saved-frame discovery metadata, not as the durable source of propagated masks #frontend #sam2
- [pattern] Parse propagation result payloads at the API boundary, then normalize them into workspace state with camelCase fields before rendering UI #frontend #state
- [pattern] Opening a propagated frame from completion UI should call the normal exact-frame reload path so persisted annotations and masks come from `/annotations/frame/{frame_idx}` #frontend #annotations
- [verification] Playwright validation passed with mocked `/api` routes: saved frames became visible after completion, `Open frame 8` reloaded canonical frame `8`, and the overlay used `/api/videos/video-123/annotations/frame/8/object/object-1/mask` #playwright #validation

## Relations
- extends [[US-007 propagation UI polling and browser verification pattern]]
- extends [[US-006 exact-frame SAM2 reload and overlay pattern]]
- extends [[US-005 frontend SAM2 workspace client and state patterns]]
- relates_to [[Milestone 3: SAM2 Prompt + Propagation]]