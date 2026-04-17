---
title: Frontend annotation foundation client and state pattern
type: note
permalink: video-annotator/engineering/frontend-annotation-foundation-client-and-state-pattern
tags:
- engineering
- frontend
- annotation
- state
- api
---

# Frontend annotation foundation client and state pattern

Milestone `US-005` added the frontend boundary needed before object-panel UI or manual box save flows. The key rule is simple: backend JSON gets parsed in `frontend/src/features/video-review/api.ts` before it reaches reducer state, and reducer state keeps canonical frame identity separate from object and annotation data.

Likely search queries:
- frontend manifest client state pattern
- manual annotation state frame_idx object_id frontend
- typed frontend client object create delete annotation

`getVideoManifest`, `createVideoObject`, `upsertManualFrameAnnotation`, and `deleteManualFrameAnnotation` are the typed client surface for annotation-foundation routes. Runtime assertions should stay in that API module so reducers and components receive typed values instead of raw `unknown` payloads.

Saved manual annotation state should be keyed by backend `frame_idx` and then `object_id`, for example `savedManualAnnotationsByFrame[frameIdx][objectId]`. Keep `objectSummaries`, `selectedObjectId`, and saved manual annotation state separate from canonical `currentFrameIndex`; do not overload frame navigation state to represent annotation persistence.

This pattern is intentionally smaller than UI wiring. Story `US-005` stops at typed client plus reducer state. Object-panel rendering, create-select UX, and draw or edit flows should build on this boundary instead of bypassing it.

## Observations
- [pattern] Parse manifest, object-create, and manual-annotation payloads in `frontend/src/features/video-review/api.ts` before reducer updates #frontend #api
- [pattern] Store saved manual annotations by backend `frame_idx` then `object_id`, separate from `currentFrameIndex` #frontend #state #frame-index
- [guardrail] Do not couple persisted annotation state to playback state or a single current-frame slot #frontend #annotation
- [scope] Annotation-foundation frontend groundwork ends at client and reducer boundaries; object-panel UI belongs in later stories #frontend #milestone

## Relations
- relates_to [[m-1: Annotation Foundation]]
- relates_to [[Frontend Interaction Spec]]
- relates_to [[Manual frame annotation route pattern]]
- relates_to [[API]]

- [pattern] Opening one review video should fetch both `GET /api/videos/{video_id}` and `GET /api/videos/{video_id}/manifest` before the workspace is considered ready, so frontend tests that mock video selection must stub both routes #frontend #tests #manifest
- [pattern] Review UI object selection should come from manifest-backed object buttons plus the reducer-owned `selectedObjectId`; do not reintroduce free-text object-id typing in the exact-frame form #frontend #objects #state
- [pattern] Object-panel UI tests should stub both `GET /api/videos/{video_id}/manifest` and `POST /api/videos/{video_id}/objects` so create-select flow stays deterministic without backend integration #frontend #tests #objects