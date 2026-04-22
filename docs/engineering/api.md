# API Specification

## Base path

`/api`

---

## Videos

### `GET /api/videos`
Return all indexed videos.

### Response
```json
[
  {
    "id": "video-2d49d3d0c7f79c43",
    "source_path": "/abs/path/to/data/videos/patient_001.mp4",
    "display_name": "patient_001.mp4",
    "review_state": "in_progress",
    "propagation_progress_percent": 68,
    "fps": 25.0,
    "frame_count": 8123,
    "width": 1920,
    "height": 1080,
    "duration_seconds": 324.92,
    "review_summary": {
      "object_count": 3,
      "annotated_frame_count": 58,
      "imported_frame_count": 0,
      "keyframe_count": 3,
      "manual_frame_count": 3,
      "propagated_frame_count": 55,
      "last_annotated_frame_idx": 220,
      "last_reviewed_frame_idx": 130
    }
  }
]
```

---

### `GET /api/videos/{video_id}`

Return metadata for one video.

### Response

```json
{
  "id": "video-2d49d3d0c7f79c43",
  "source_path": "/abs/path/to/data/videos/patient_001.mp4",
  "display_name": "patient_001.mp4",
  "review_state": "in_progress",
  "propagation_progress_percent": 68,
  "fps": 25.0,
  "frame_count": 8123,
  "width": 1920,
  "height": 1080,
  "duration_seconds": 324.92,
  "review_summary": {
    "object_count": 3,
    "annotated_frame_count": 58,
    "imported_frame_count": 0,
    "keyframe_count": 3,
    "manual_frame_count": 3,
    "propagated_frame_count": 55,
    "last_annotated_frame_idx": 220,
    "last_reviewed_frame_idx": 130
  }
}
```

### Errors

- `404 {"detail": "Indexed video not found"}` when the id is unknown

### Notes

- `source_path` is persisted backend metadata. Frontend playback should use the backend source route, not treat this filesystem path as a browser URL.

---

### `GET /api/videos/{video_id}/source`

Return the indexed local source video for contextual playback.

### Response

- `200 OK`
- `Content-Type: video/*` based on the indexed file suffix
- Body: raw video bytes streamed from local storage

### Errors

- `404 {"detail": "Indexed video not found"}` when the id is unknown

### Notes

- This route exists for playback context only.
- Playback remains contextual only.

---

### `GET /api/videos/{video_id}/manifest`

Return:

* review video metadata
* stable object summary
* annotated frame indices
* keyframe indices
* shipped review state, propagation progress, and review summary for the library view

### Response

```json
{
  "video": {
    "id": "video-2d49d3d0c7f79c43",
    "review_state": "in_progress",
    "propagation_progress_percent": 68,
    "fps": 25.0,
    "frame_count": 8123,
    "width": 1920,
    "height": 1080,
    "duration_seconds": 324.92,
    "review_summary": {
      "object_count": 3,
      "annotated_frame_count": 58,
      "imported_frame_count": 0,
      "keyframe_count": 3,
      "manual_frame_count": 3,
      "propagated_frame_count": 55,
      "last_annotated_frame_idx": 220,
      "last_reviewed_frame_idx": 130
    }
  },
  "annotated_frames": [120, 121, 130, 220],
  "keyframes": [120, 130],
  "objects": [
    {
      "id": "object-001",
      "label": "left hand",
      "color": "#00ffaa",
      "status": "active"
    }
  ]
}
```

### Errors

- `404 {"detail": "Indexed video not found"}` when the id is unknown

### Notes

- `annotated_frames` and `keyframes` stay keyed by backend zero-based `frame_idx`.
- `objects[].id` is stable persisted object identity, not UI-local temp state.
- Library review state values are `not_started`, `started`, `in_progress`, `ready`, and `exported`.
- `not_started` means no imported boxes and no saved review output yet.
- `started` means imported boxes exist, but no manual review save exists yet.
- `ready` means current saved state is ready for review or export.
- Importing boxes sets `review_state = started`.
- The first manual save moves `not_started` or `started` to `ready`.
- Starting propagation moves `ready` to `in_progress`, and completion returns it to `ready`.
- Any manual edit after `exported` moves the video back to `ready`.
- Importing new boxes over reviewed or exported work resets the video to `started` until the next manual save.
- Current runtime does not persist export completion yet, so shipped backend responses do not emit `review_state = exported`.
- Progress is propagation completion only and is visible only while a video is `in_progress`.
- `review_summary.last_reviewed_frame_idx` tracks reviewer-owned manual edits only; `review_summary.last_annotated_frame_idx` tracks any persisted annotation source.

---

### `GET /api/videos/{video_id}/frame/{frame_idx}`

Return the backend-decoded exact frame image for canonical zero-based frame index `frame_idx`.

### Response

- `200 OK`
- `Content-Type: image/png`
- Body: raw PNG bytes for requested exact frame

### Errors

- `400 {"detail": "Frame index must be between 0 and N"}` when `frame_idx` is negative or outside the indexed range for the selected video
- `404 {"detail": "Indexed video not found"}` when the id is unknown

### Notes

- `frame_idx` is backend-canonical and zero-based.
- Clients must not derive annotation truth from browser playback time.

### `GET /api/videos/{video_id}/objects/{object_id}/summary`

Return the selected-object summary for the main review surface.

### Query params

- `frame_idx`: canonical current frame for bbox and confidence display
- `start_frame_idx`: start of selected review range
- `end_frame_idx`: end of selected review range

### Response

```json
{
  "video_id": "video-2d49d3d0c7f79c43",
  "object_id": "object-001",
  "label": "Pedestrian",
  "bbox_xyxy_px": [620, 280, 760, 470],
  "mask_confidence": null,
  "track_summary": {
    "frames": 42,
    "propagated": 39,
    "corrected": null
  }
}
```

### Notes

- `bbox_xyxy_px` and `mask_confidence` are scoped to `frame_idx`.
- `track_summary` is scoped to `start_frame_idx` and `end_frame_idx`.
- `track_summary.frames` means total frames in the selected range, not only annotated frames.
- `track_summary.propagated` means frames in that selected range where this object has a propagated mask.
- `track_summary.corrected` means propagated masks in that selected range that were later fixed by the reviewer, not every manual edit.
- This endpoint now ships.
- `mask_confidence` returns persisted current-frame confidence only when that row is untouched `source = "sam2"`.
- Manual-only rows and corrected rows still return `mask_confidence = null`.
- Default local runtime still needs later adapter work before real prompt or propagation flows produce non-null confidence values.
- Current runtime returns `track_summary.corrected = null` until reviewer-correction provenance is persisted.

---

## Annotations

### `GET /api/videos/{video_id}/annotations`

Return all annotations for the video.

### `GET /api/videos/{video_id}/annotations/frame/{frame_idx}`

Return annotations for a specific frame.

### Response

```json
{
  "frame_idx": 120,
  "annotations": [
    {
      "object_id": "object-001",
      "source": "manual",
      "box_xywh_norm": [0.41, 0.29, 0.10, 0.16],
      "mask_confidence": null,
      "mask": null
    }
  ]
}
```

### Notes

- Frame reads must return persisted manual box rows even when no mask exists yet.
- Manual rows use `"mask": null`; SAM2 rows keep mask path metadata.
- Frame reads now expose top-level nullable `mask_confidence`.
- Reviewer-visible confidence stays `null` unless the current row is untouched `source = "sam2"`.
- Selected-object summary remains the inspector's range-scoped confidence contract.
- Frontend exact-frame reload should hydrate editable saved-manual box state from returned manual rows so move, resize, and delete still work after reopening frame `N`.

### `PUT /api/videos/{video_id}/annotations/frame/{frame_idx}`

Upsert one manual annotation for one canonical frame.

### Request

```json
{
  "object_id": "object-001",
  "is_keyframe": true,
  "box_xywh_norm": [0.41, 0.29, 0.10, 0.16]
}
```

### Response

```json
{
  "video_id": "vid_001",
  "frame_idx": 120,
  "object_id": "object-001",
  "is_keyframe": true,
  "source": "manual",
  "box_xywh_norm": [0.41, 0.29, 0.10, 0.16],
  "mask": {
    "path": null
  }
}
```

### Notes

- Current shipped serializers differ between reads and writes for manual rows.
- `GET /api/videos/{video_id}/annotations/frame/{frame_idx}` returns manual rows as `"mask": null`.
- `PUT /api/videos/{video_id}/annotations/frame/{frame_idx}` currently echoes manual rows as `"mask": { "path": null }`.
- Manual writes clear any stored `mask_confidence`.
- Selected-object inspector still reads confidence from `GET /api/videos/{video_id}/objects/{object_id}/summary` because it also needs selected-range counters.

### Errors

- `404 {"detail": "Indexed video not found"}` when the selected video id is unknown
- `404 {"detail": "Object track not found"}` when the object id is missing or belongs to a different video
- `400 {"detail": "Frame index must be between 0 and N"}` when `frame_idx` is outside indexed bounds

### `DELETE /api/videos/{video_id}/annotations/frame/{frame_idx}/object/{object_id}`

Delete one object's annotation on one frame.

### Response

- `204 No Content`

### Errors

- `404 {"detail": "Indexed video not found"}` when the selected video id is unknown
- `404 {"detail": "Frame annotation not found"}` when that frame has no persisted row for the object
- `400 {"detail": "Frame index must be between 0 and N"}` when `frame_idx` is outside indexed bounds

---

## Objects

### `POST /api/videos/{video_id}/objects`

Create a new object.

### Request

```json
{
  "label": "left"
}
```

### Response

```json
{
  "id": "object-7f3a2a08a4c1",
  "label": "left",
  "color": "#00ffaa",
  "status": "active"
}
```

### Errors

- `404 {"detail": "Indexed video not found"}` when the id is unknown

### Notes

- object creation is video-scoped; backend refuses to create tracks for unknown videos
- initial object metadata defaults to `color = "#00ffaa"` and `status = "active"`

### `PATCH /api/videos/{video_id}/objects/{object_id}`

Update object metadata.

### `DELETE /api/videos/{video_id}/objects/{object_id}`

Delete the whole object track.

---

## SAM2

### `POST /api/videos/{video_id}/sam2/session`

Create or reuse a SAM2 session.

### Response

```json
{
  "session_id": "sam2_sess_001"
}
```

### `POST /api/videos/{video_id}/sam2/prompt-box`

Generate a mask from a box on one frame.

- `POST /api/videos/{video_id}/sam2/session` still opens lightweight persisted session metadata first.
- Prompt runtime loads lazily on first prompt from `SAM2_CONFIG_PATH` and `SAM2_CHECKPOINT_PATH`.
- `SAM2_CONFIG_PATH` may be a direct `configs/...yaml` value or a file path that contains a `configs/` segment.
- If runtime config, checkpoint, optional dependencies, or requested device are unavailable, this route returns `503 Service Unavailable` with an explicit detail string.

### Request

```json
{
  "session_id": "sam2_sess_001",
  "frame_idx": 120,
  "object_id": "object-1",
  "box_xyxy_px": [620, 280, 760, 470]
}
```

### Response

```json
{
  "frame_idx": 120,
  "annotation": {
    "object_id": "object-1",
    "source": "sam2",
    "box_xywh_norm": [0.3229, 0.2593, 0.0729, 0.1759],
    "mask_confidence": null,
    "mask": {
      "path": "masks/video-123/object-1/frame_000120.png"
    }
  }
}
```

- Prompt response now echoes nullable persisted `mask_confidence` immediately.
- Untouched `source = "sam2"` rows may return numeric confidence.
- Manual-only or corrected rows still return `null`.

### `POST /api/videos/{video_id}/sam2/refine-mask`

Refine one frame with extra prompts or edited seed mask.

### `POST /api/videos/{video_id}/sam2/propagate`

Propagate one or more objects across a frame range.

### Request

```json
{
  "session_id": "sam2_sess_001",
  "start_frame_idx": 120,
  "end_frame_idx": 180,
  "direction": "forward",
  "object_ids": [1]
}
```

### Response

```json
{
  "job_id": "job_001"
}
```

---

## Jobs

### `GET /api/jobs/{job_id}`

Return job status and progress.

### Response

```json
{
  "id": "job_001",
  "status": "running",
  "progress_current": 15,
  "progress_total": 60
}
```

### `POST /api/jobs/{job_id}/cancel`

Cancel a running job.

---

## Export

### `POST /api/videos/{video_id}/export`

Create an export package.

### Request

```json
{
  "native_json": true,
  "png_masks": true,
  "boxes_only": false
}
```

### `GET /api/exports/{export_id}`

Download an export artifact.
