---
title: Fix review transport playback propagation and object colors
type: plan
status: active
permalink: video-annotator/plans/fix-review-transport-playback-propagation-and-object-colors
tags:
- plan
- frontend
- backend
- review
- transport
- propagation
- colors
---

# Fix review transport playback propagation and object colors

Bring review transport from shell parity into working parity.

## Summary

- Goal: make review transport, playback pause behavior, propagation controls, object color flow, and mockup truth work together.
- Success criteria: range bar resizes, start/end stay editable and synced, current-frame indicator stays separate, playback pause lands on viewed frame, thumbnails show real previews, object creation can choose palette color, and mask or box colors match object color.
- Audience: annotators using `/review/:videoId` and engineers auditing review drift versus behavior.

## Current State

- Transport couples current frame, selected range, and propagation boundary into one shared state.
- Playback preview does not update review frame identity on pause.
- Thumbnail strip mostly shows placeholders.
- Create-object flow is label-only and backend forces one default color.
- Canvas overlay ignores stored object colors.

## Locked Decisions

- Keep `DIR`, default to `both`.
- Current-frame blue indicator shows viewed frame only and must not resize propagation range.
- Propagation uses explicit seed frame plus explicit start and end range.
- Default seed is first manual annotated frame inside selected range.
- New object color uses fixed palette.
- Base review mockup html must add bottom nav buttons plus seed or range controls.

## Affected Features

- [[Video Ingest and Exact-Frame Review]]
- [[SAM2 Shell and Runtime]]
- [[Mask Editing and Cleanup]]

## Task Breakdown

1. Backend: add create-object color, propagation seed or range contract, and exact-frame preview width support.
2. Frontend: split playback, current frame, range, and seed state; wire transport, thumbnails, pause commit, object color flow, and overlay tinting.
3. Mockup and memory: update review html truth, add color-chooser mockup, and record new durable transport or color rules.
