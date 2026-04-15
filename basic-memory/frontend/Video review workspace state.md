---
title: Video review workspace state
type: note
permalink: video-annotator/frontend/video-review-workspace-state
tags:
- frontend
- state
- exact-frame
---

# Video review workspace state

This note answers where the review workspace keeps canonical state and where it
should stop. The feature workspace owns selected-video state, exact-frame fetch
status, and the canonical `currentFrameIndex`. It does not own browser object
URL lifecycle and it does not derive annotation truth from playback time.

The important boundary is between typed data intake and UI rendering. Backend
JSON should be parsed at the feature API boundary before values enter React
state. Exact-frame blobs can live in feature state, but the component that
renders the image should own object URL creation and cleanup.

## Observations
- [pattern] Bootstrap selected-video workspace state from `GET /api/videos/{video_id}/manifest` instead of trusting `/api/videos` list payloads or a separate detail fetch; manifest is frontend source for objects and frame markers. #frontend #manifest

- [pattern] Parse backend JSON inside the feature API client before values enter React state or presentational components. #frontend #api
- [constraint] Keep canonical `currentFrameIndex` in feature state and reset it when the selected video changes. #frontend #state
- [pattern] Keep exact-frame response blobs in feature workspace state and let the rendering component own object URL creation and cleanup. #frontend #rendering
- [constraint] The backend-decoded frame index, not browser playback time, is the source of annotation truth. #architecture #frame-index

## Relations
- depends_on [[Exact frame API]]
- relates_to [[Video list selection]]
- relates_to [[Jump to frame interaction]]
- relates_to [[Frame stepping interaction]]
