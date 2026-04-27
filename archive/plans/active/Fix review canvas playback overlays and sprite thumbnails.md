---
title: Fix review canvas playback overlays and sprite thumbnails
type: plan
status: done
permalink: video-annotator/plans/fix-review-canvas-playback-overlays-and-sprite-thumbnails
tags:
- plan
- frontend
- backend
- review
- playback
- thumbnails
- export
---

# Fix review canvas playback overlays and sprite thumbnails

## Summary

- Goal: make play-time overlays visible, keep paused exact-frame truth, align video/frame zoom, speed up bottom previews, and auto-start export downloads.
- Success: one visible stage renders play and pause, play shows persisted boxes and masks, pause swaps to backend exact frame for same frame index, thumbnails stay loaded during play, and export buttons start download.

## Locked Decisions

- Preview frame may stay browser-timed during play.
- Paused edit and export truth must reconcile to backend exact frame for same frame index.
- One visible canvas stage is allowed.
- Hidden native video may stay as playback or audio source.
- Playback overlays use preloaded persisted annotation metadata, not draft edit state.
- Bottom previews switch from per-frame requests to backend sprite windows with predictive preload.

## Task Breakdown

1. Backend: annotated-frame bootstrap route plus thumbnail sprite route and tests.
2. Frontend: one canvas stage, playback overlay cache, sprite strip use, export auto-download, and tests.
3. Docs and memory: update contracts, renderer rule, and thumbnail strategy notes.

## Outcome

- Backend added annotated-frame bootstrap and thumbnail sprite routes.
- Frontend ships shared stage geometry, play-time persisted overlays, sprite-backed timeline thumbnails, and export auto-download.
- Docs and durable memory reflect the new review-stage and export rules.
