---
title: Exact frame API test seam
type: note
permalink: video-annotator/backend/exact-frame-api-test-seam
tags:
- backend
- testing
- frames
---

# Exact frame API test seam

This note answers how to test the exact-frame endpoint without depending on
real media fixtures. The important seam is the exact-frame loader, not the
video decoder implementation.

Tests seed indexed `Video` rows through the normal database seam, patch the
frame loader used by the route, then assert binary response bytes and error
status codes through the real application. That keeps the test focused on route
behavior, validation order, and response shape.

## Observations
- [technique] For API tests that care about returned bytes rather than decoder internals, patch `app.api.videos.load_exact_video_frame`. #testing #frames
- [pattern] Seed indexed `Video` rows through the database seam and assert response bytes plus `400` and `404` behavior through `create_app()`. #fastapi #pytest
- [constraint] Exact-frame tests should validate `frame_idx` against stored `Video.frame_count`, not against browser playback state or fixture duration guesses. #testing #validation

## Relations
- depends_on [[Backend API test database seam]]
- relates_to [[Exact frame API]]
- relates_to [[Live video smoke validation]]
