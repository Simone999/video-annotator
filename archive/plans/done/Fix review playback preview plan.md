---
title: Fix review playback preview plan
type: plan
status: done
permalink: video-annotator/plans/fix-review-playback-preview-plan
tags:
- plan
- frontend
- review
- playback
---

# Fix review playback preview plan

Tight frontend plan for review playback preview drift inside owned controller and nearby tests.

## Summary
- Goal: make play resume from shown paused frame, keep shown frame updates fast while playing, and keep pause fetch on exact backend frame for paused index.
- Success criteria: preview frame drives transport thumbnails and playhead during playback; pause commits paused frame through `loadExactFrame`; hook messages drop canonical-frame wording.
- Audience: task session implementing frontend review playback fixes.

## Current State
- Existing behavior: play seeks from `currentFrameIndex`, not always from the frame user currently sees after paused preview work.
- Main gaps: preview updates depend on sparse media events; timeline can lag during playback; some hook errors still say `canonical frame`.
- Constraints: frontend-only ownership in `use-live-review-controller.ts` and directly related tests; keep no stop button and keep backend frame truth only on pause or explicit exact-frame actions.

## Assumptions And Open Questions
- Locked assumptions: `requestVideoFrameCallback` should drive preview when browser supports it; fallback is `requestAnimationFrame`; `previewFrameIndex` is the shown-frame source during playback.
- Open questions: none after user brief.

## Affected Features
- [[Frontend Interaction Spec]]
- [[Frame Indexing Contract]]

## Task Breakdown
1. [[Fix review playback preview task]] — add red tests for resume, live preview updates, and wording.
2. [[Fix review playback preview task]] — implement minimal hook changes and verify targeted frontend tests.

## Handoff Notes
- Keep `currentFrameIndex` as paused exact-frame truth.
- Do not move playback truth into backend during play.
- Do not edit unrelated review UI files unless a directly related test forces it.
