# Data Model

## Frame indexing contract

Internal frame indices are zero-based unless an external adapter requires otherwise.

Rules:
- backend decoding is canonical
- frontend never derives annotation truth from browser playback time
- adapters convert only at system boundaries

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
- manual frame-box writes keep `source = "manual"` and clear any persisted `mask_path` or `mask_rle`

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
