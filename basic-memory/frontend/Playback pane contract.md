---
title: Playback pane contract
type: note
permalink: video-annotator/frontend/playback-pane-contract
tags:
- frontend
- playback
- api
---

# Playback pane contract

This note answers how the playback pane gets video bytes and what role playback
is allowed to play in review. The browser should load contextual playback from
`GET /api/videos/{video_id}/source`, while persisted `source_path` stays backend
metadata only.

Playback is intentionally separate from exact-frame truth. The pane exists to
help users watch the video and orient themselves, but canonical annotation state
still comes from the backend exact-frame path and the review workspace state.

## Observations
- [constraint] Frontend playback should use `GET /api/videos/{video_id}/source`; `source_path` remains backend metadata only. #frontend #backend #playback
- [constraint] The playback pane is contextual UI and must not own canonical frame selection or annotation truth. #ux #frame-index
- [pattern] Keep a backend playback URL helper in the frontend feature API module so components never compose source route strings ad hoc. #frontend #api

## Relations
- depends_on [[Video catalog API]]
- relates_to [[Video list selection]]
- relates_to [[Live video smoke validation]]
