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

### Sam2Session
Represents persisted lifecycle metadata for one video-scoped SAM2 session.

Persisted row tracks reuse and cleanup metadata only. Predictor internals stay inside the SAM2 adapter/service boundary.

Fields:
- `id`
- `video_id`
- `status`
- `created_at`
- `last_used_at`
- `closed_at` optional

### Job
Represents async work such as propagation or export.

Fields:
- `id`
- `type`
- `video_id`
- `object_id` optional
- `session_id`
- `status`
- `progress_current`
- `progress_total`
- `payload_json`
- `result_json`
- `error_message`
- `cancel_requested_at` optional
- `started_at` optional
- `completed_at` optional

Rules:
- `type` may be `sam2_propagation` for milestone-03 background propagation work
- `progress_current` and `progress_total` are deterministic counters and must stay non-negative
- `payload_json` stores request metadata needed to resume or inspect work
- `result_json` stores serialized outputs after work produces persisted results

## Annotation rules

- one object may have annotations on many frames
- a frame may contain multiple objects
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
