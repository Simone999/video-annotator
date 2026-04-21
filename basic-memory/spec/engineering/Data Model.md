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

Planned derived read-model fields for library UI:
- `review_state`
- optional propagation progress while state is `in_progress`

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

Agreed next field for mask metadata:
- nullable mask confidence for untouched SAM2 result

Confidence rule:
- untouched SAM2 mask may carry numeric confidence
- manual-only rows carry `null`
- corrected rows carry `null`

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

`frames` means total selected-range frames. `propagated` means frames in range with propagated mask. `corrected` means propagated frames later fixed by reviewer.

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