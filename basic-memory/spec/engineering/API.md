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

Video list, detail, and manifest payloads now expose library-ready review metadata:
- `review_state`: `not_started | started | in_progress | ready | exported`
- `propagation_progress_percent` when `review_state = in_progress`
- `review_summary.object_count`
- `review_summary.annotated_frame_count`
- `review_summary.imported_frame_count`
- `review_summary.keyframe_count`
- `review_summary.manual_frame_count`
- `review_summary.propagated_frame_count`
- `review_summary.last_annotated_frame_idx`
- `review_summary.last_reviewed_frame_idx`

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
- shipped runtime does not emit `exported` yet because export completion is not persisted

Frame annotation payloads must expose current annotated box plus mask metadata. They use top-level nullable `mask_confidence`:
- `mask_confidence` present for untouched SAM2-generated masks
- `mask_confidence = null` for manual-only rows
- `mask_confidence = null` after reviewer correction

Bbox in inspector is display data from current annotated box. Persisted storage contract stays normalized `xywh`; inspector may expose derived `bbox_xyxy_px` for current frame display.

Selected-object summary contract now ships for annotation inspector:
`GET /api/videos/{video_id}/objects/{object_id}/summary?frame_idx={frame_idx}&start_frame_idx={start}&end_frame_idx={end}`

Response shape:
```json
{
  "video_id": "video-001",
  "object_id": "object-001",
  "label": "Pedestrian",
  "bbox_xyxy_px": [1114, 453, 1230, 802],
  "mask_confidence": null,
  "track_summary": {
    "frames": 58,
    "propagated": 55,
    "corrected": null
  }
}
```

Summary semantics:
- `frames`: total frames in selected range
- `propagated`: frames in range with propagated mask for object
- `corrected`: propagated masks later fixed by reviewer once correction provenance is persisted; shipped runtime keeps this `null` today
- `mask_confidence`: returns persisted current-frame confidence when the row is untouched `source = "sam2"`; real local-runtime browser proof still depends on installed SAM2 assets plus fresh browser verification

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
