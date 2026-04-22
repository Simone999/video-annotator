# Data Model

## Frame indexing contract

Internal frame indices are zero-based unless an external adapter requires otherwise.

Rules:
- backend decoding is canonical
- frontend never derives annotation truth from browser playback time
- adapters convert only at system boundaries

Library review state is backend-owned derived read-model data. The library uses `not_started`, `started`, `in_progress`, `ready`, and `exported`. Progress is propagation completion only and is visible only while a video is `in_progress`.

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
- current runtime has no persisted export fact yet, so shipped backend responses do not derive `exported`

## Entities

### Video
Represents a source media file.

Fields:
- `id`
- `source_path`
- `display_name`
- `width`
- `height`
- `fps`
- `frame_count`
- `duration_seconds` optional

Derived read-model fields for library UI:
- `review_state`
- `propagation_progress_percent` optional
- `review_summary.object_count`
- `review_summary.annotated_frame_count`
- `review_summary.imported_frame_count`
- `review_summary.keyframe_count`
- `review_summary.manual_frame_count`
- `review_summary.propagated_frame_count`
- `review_summary.last_annotated_frame_idx`
- `review_summary.last_reviewed_frame_idx`

### ObjectTrack
Represents a logical object across frames.

Fields:
- `id`
- `video_id`
- `label`
- `color`
- `status`

Notes:
- object tracks can be created explicitly through `POST /api/videos/{video_id}/objects` before any frame annotation exists
- initial create defaults are `color = "#00ffaa"` and `status = "active"` until later object-edit flows change them

### FrameAnnotation
Represents one object's annotation on one frame.

Fields:
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
- `mask_rle` optional

Notes:
- persisted manifest summary reads `annotated_frames` and `keyframes` from `FrameAnnotation.frame_idx`
- `object_id` points at stable `ObjectTrack.id`
- one manifest read must only summarize rows for selected `video_id`
- manual frame-box writes upsert by `(video_id, frame_idx, object_id)` and update one persisted row instead of creating duplicates
- manual frame-box writes keep `source = "manual"` and clear any persisted `mask_path`, `mask_confidence`, or `mask_rle`
- frame-scoped read APIs must still return manual rows when `mask_path` is null, because saved exact-frame box reload depends on the row even before any mask exists
- frontend reload/edit state should rebuild current-frame saved-manual annotation state from returned manual rows keyed by `frame_idx` and `object_id`
- frame-scoped read APIs now expose top-level nullable `mask_confidence`
- only untouched `source = "sam2"` rows may return numeric `mask_confidence`; manual-only or corrected rows stay `null`
- selected-object summary now reuses persisted current-frame confidence when that row is untouched `source = "sam2"`

### SelectedObjectSummary
Derived review response, not a persisted table.

Fields:
- `video_id`
- `object_id`
- `label`
- `bbox_xyxy_px`
- `mask_confidence` optional
- `track_summary.frames`
- `track_summary.propagated`
- `track_summary.corrected`

Counter semantics:
- `track_summary.frames` means total frames in selected range
- `track_summary.propagated` means frames in selected range with propagated mask for this object
- `track_summary.corrected` means propagated masks in selected range later fixed by reviewer
- current runtime returns `track_summary.corrected = null` because correction provenance is not persisted yet

### Sam2Session
Represents an active predictor state for one video.

Fields:
- `id`
- `video_id`
- `status`
- `created_at`
- `last_used_at`

### Job
Represents async work such as propagation or export.

Fields:
- `id`
- `type`
- `video_id`
- `object_id` optional
- `status`
- `progress_current`
- `progress_total`
- `payload_json`
- `result_json`
- `error_message`

## Annotation rules

- one object may have annotations on many frames
- a frame may contain multiple objects
- one frame-object pair should have at most one persisted row
- masks are stored as files on disk
- boxes use normalized `xywh`
- `source` must be one of:
  - `manual`
  - `sam2`
  - `sam2_edited`
  - `imported`

## Keyframes

A keyframe is a frame where the user explicitly created or corrected an annotation.

Keyframes are important for:
- navigation
- UI markers
- future interpolation logic
