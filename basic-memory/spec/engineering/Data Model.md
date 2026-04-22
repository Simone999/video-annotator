---
title: Data Model
type: note
permalink: video-annotator/spec/engineering/data-model
tags:
- spec
- engineering
- data-model
- storage
---

# Data Model

Frame truth stays zero-based backend `frame_idx`. Playback time is never stored as annotation identity.

## Video
Fields stay:
- `id`
- `source_path`
- `display_name`
- `width`
- `height`
- `fps`
- `frame_count`
- `duration_seconds`

Shipped derived read-model fields for library UI:
- `review_state`
- optional `propagation_progress_percent` while state is `in_progress`
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
- shipped runtime does not derive `exported` yet because export completion is not persisted

## ObjectTrack
Fields stay:
- `id`
- `video_id`
- `label`
- `color`
- `status`

## FrameAnnotation
Persisted fields stay frame-scoped:
- `id`
- `video_id`
- `frame_idx`
- `object_id`
- `is_keyframe`
- `source`
- `box_x`
- `box_y`
- `box_w`
- `box_h`
- `mask_path`
- `mask_rle`

Agreed future field for mask metadata:
- nullable mask confidence for untouched SAM2 result

Confidence rule:
- untouched SAM2 mask may carry numeric confidence once persisted
- manual-only rows carry `null`
- corrected rows carry `null`
- backend storage and read paths now support persisted confidence; real local-runtime proof of non-null values still depends on installed SAM2 assets plus fresh browser verification

Inspector bbox is derived display data, not new persisted shape. Persisted box stays normalized `xywh`. Inspector may expose derived `bbox_xyxy_px` for current frame.

## Job
Async job model still owns propagation status and progress. That remains source for library progress bar while state is `in_progress`.

## Selected-object summary read model
Inspector needs backend-served summary for selected range:
- `object_id`
- `label`
- `bbox_xyxy_px | null`
- `mask_confidence | null`
- `track_summary.frames`
- `track_summary.propagated`
- `track_summary.corrected`

`frames` means total selected-range frames. `propagated` means frames in range with propagated mask. `corrected` means propagated frames later fixed by reviewer once correction provenance is persisted. Shipped runtime currently returns `corrected: null`.

## Observations
- [truth] Persisted annotation identity remains backend zero-based `frame_idx` #frames #data-model
- [library] Library state and propagation progress are read-model fields, not necessarily raw base-table columns #library #read-model
- [library] Library review-state transitions are explicit and must stay synchronized with product notes and API docs #library #states #read-model
- [mask] Confidence is nullable metadata and clears after manual correction #mask #confidence
- [bbox] Inspector bbox is derived display data; persisted box shape stays normalized `xywh` #bbox #annotations
- [summary] Selected-object inspector needs backend summary read model for bbox, confidence, and range counts #summary #inspector

## Relations
- relates_to [[Frame Indexing Contract]]
- relates_to [[Architecture]]
- relates_to [[API]]
- relates_to [[Export Format]]
