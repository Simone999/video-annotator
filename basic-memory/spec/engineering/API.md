---
title: API
type: note
permalink: video-annotator/spec/engineering/api
tags:
- spec
- engineering
- api
- backend
---

# API

This note keeps backend contract truth for video review. Baseline routes already ship for indexed videos, manifest, exact-frame reads, manual annotation writes, SAM2 shell routes, and job polling. This note also records agreed contract additions required by the mockup-first UI so future implementation does not drift.

Canonical rule does not change: backend-owned zero-based `frame_idx` is annotation truth. Playback time is derived UI state only.

Video list and detail payloads must expose library-ready review metadata:
- `review_state`: `not_started | started | in_progress | ready | exported`
- optional propagation progress fields when `review_state = in_progress`

State meanings:
- `not_started`: indexed video with no imported boxes and no saved review output yet
- `started`: imported boxes exist, but the reviewer has not saved a manual review edit yet
- `in_progress`: propagation job is currently running for the video
- `ready`: current saved state is ready for manual review or export
- `exported`: latest export reflects current saved review state

Transition rules:
- importing boxes sets `review_state = started`
- the first manual save moves `not_started` or `started` to `ready`
- starting propagation moves `ready` to `in_progress`, and completion returns it to `ready`
- any manual edit after `exported` moves the video back to `ready`
- importing new boxes over reviewed or exported work resets the video to `started` until the next manual save

Frame annotation payloads must expose current annotated box plus mask metadata. Mask metadata now includes nullable confidence:
- `mask.confidence` present for untouched SAM2-generated masks
- `mask.confidence = null` for manual-only rows
- `mask.confidence = null` after reviewer correction

Bbox in inspector is display data from current annotated box. Persisted storage contract stays normalized `xywh`; inspector may expose derived `bbox_xyxy_px` for current frame display.

New selected-object summary contract is required for annotation inspector:
`GET /api/videos/{video_id}/objects/{object_id}/summary?frame_idx={frame_idx}&start_frame_idx={start}&end_frame_idx={end}`

Response shape:
```json
{
  "object_id": "object-001",
  "label": "Pedestrian",
  "bbox_xyxy_px": [1114, 453, 1230, 802],
  "mask_confidence": 0.94,
  "track_summary": {
    "frames": 58,
    "propagated": 55,
    "corrected": 3
  }
}
```

Summary semantics:
- `frames`: total frames in selected range
- `propagated`: frames in range with propagated mask for object
- `corrected`: propagated masks later fixed by reviewer

Job polling still exposes propagation status and progress. Library progress bar must read propagation completion only and only while job is active.

## Observations
- [contract] Backend `frame_idx` remains canonical identity for review, annotation, SAM2, and export #api #frames
- [library] Video list and detail contracts need derived `review_state` plus optional propagation progress for library cards #library #api
- [library] Library review-state transitions are explicit and must not be inferred differently by frontend and backend #library #states #api
- [payload] Mask payload now includes nullable confidence with clear reset rules after manual work #mask #confidence #api
- [inspector] Selected-object inspector needs dedicated range-scoped summary endpoint, not manifest overload #inspector #api
- [summary] Track summary fields mean total selected-range frames, propagated frames, and corrected propagated frames #summary #api
- [progress] Job polling remains propagation progress source; library progress bar is not generic review percent #jobs #progress

## Relations
- depends_on [[Data Model]]
- depends_on [[Frame Indexing Contract]]
- relates_to [[Architecture]]
- relates_to [[SAM2 Integration]]
- relates_to [[Export Format]]
- relates_to [[Test Plan]]
- relates_to [[Delivery Plan and Risks]]