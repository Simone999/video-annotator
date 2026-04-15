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
- [pattern] Keep active overlay drag gesture local to the exact-frame rendering component, but store only normalized draft box data in feature state keyed by canonical `frameIdx` and `objectId`; clear stale drafts when frame or selected object changes. #frontend #annotations #state

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

- [pattern] Keep persisted object lists and selected object identity in feature workspace state, but keep object-create form input plus submit/loading error state local to the UI component that owns the form. #frontend #objects #state
- [pattern] Reuse the same normalized draft box state for both new-box draw and saved-box move/resize flows; promote the selected object's persisted annotation into draft state locally, then persist through the existing frame upsert path instead of creating a separate edit payload. #frontend #annotations #state
- [gotcha] Browser drag math for resize handles depends on the real pointer hotspot inside the handle element, so Playwright/browser assertions should validate approximate persisted geometry or inspect saved payloads instead of assuming the handle center lands exactly on the box corner. #frontend #testing #playwright