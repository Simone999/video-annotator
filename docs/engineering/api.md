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
    "fps": 25.0,
    "frame_count": 8123,
    "width": 1920,
    "height": 1080,
    "duration_seconds": 324.92
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
  "fps": 25.0,
  "frame_count": 8123,
  "width": 1920,
  "height": 1080,
  "duration_seconds": 324.92
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
- Playback remains separate from canonical exact-frame review state.

---

### `GET /api/videos/{video_id}/manifest`

Return:

* video metadata
* object summary
* annotated frames
* keyframes

### Response

```json
{
  "video": {
    "id": "vid_001",
    "fps": 25.0,
    "frame_count": 8123,
    "width": 1920,
    "height": 1080,
    "duration_seconds": 324.92
  },
  "annotated_frames": [120, 121, 130, 220],
  "keyframes": [120, 130],
  "objects": [
    { "id": 1, "label": "left" }
  ]
}
```

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

---

## Annotations

### `GET /api/videos/{video_id}/annotations/frame/{frame_idx}`

Return persisted annotations for a specific canonical frame.

### Response

```json
{
  "frame_idx": 120,
  "annotations": [
    {
      "object_id": "object-1",
      "source": "sam2",
      "box_xywh_norm": [0.41, 0.29, 0.10, 0.16],
      "mask": {
        "path": "masks/vid_001/object_1/frame_000120.png"
      }
    }
  ]
}
```

### Notes

- route returns `200` with empty `annotations` when frame has no persisted mask-backed rows yet
- `box_xywh_norm` may be `null` for propagated rows that do not keep a prompt box
- frontend exact-frame reload should use this route, not stale in-memory prompt state, when re-opening canonical frame N

### `GET /api/videos/{video_id}/annotations/frame/{frame_idx}/object/{object_id}/mask`

Return one persisted annotation mask PNG for overlay rendering.

### Response

- `200 image/png`

### Errors

- `404 {"detail": "Indexed video not found"}` when the video id is unknown
- `404 {"detail": "Frame annotation not found"}` when the object/frame pair has no persisted mask
- `400 {"detail": "Frame index must be between 0 and N"}` when `frame_idx` is outside indexed video bounds

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
  "session_id": "sam2-session-001",
  "reused": false
}
```

### Errors

- `404 {"detail": "Indexed video not found"}` when the id is unknown
- `409 {"detail": "Indexed video source is not available"}` when persisted metadata points at a missing local file

### Notes

- session is scoped to one indexed video
- backend reuses one open session per video and refreshes `last_used_at` on reuse
- backend validates video ownership and local source-path availability before any SAM2 adapter work starts

---

### `DELETE /api/videos/{video_id}/sam2/session/{session_id}`

Close one persisted SAM2 session for the selected video.

### Response

- `204 No Content`

### Errors

- `404 {"detail": "SAM2 session not found"}` when the session does not belong to the selected video or does not exist

### `POST /api/videos/{video_id}/sam2/prompt-box`

Generate a mask from a box on one frame.

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
    "mask": {
      "path": "masks/video-2d49d3d0c7f79c43/object-1/frame_000120.png"
    }
  }
}
```

### Errors

- `400 {"detail": "Frame index must be between 0 and N"}` when `frame_idx` is outside indexed video bounds
- `400 {"detail": "Prompt box must define a positive in-frame area"}` when `box_xyxy_px` does not define a valid area
- `404 {"detail": "Indexed video not found"}` when the id is unknown
- `404 {"detail": "SAM2 session not found"}` when the session does not belong to selected video or is already closed

### Notes

- request `frame_idx` is canonical backend frame index, not browser playback time
- backend normalizes `box_xyxy_px` against persisted video width/height and upserts one `FrameAnnotation` row keyed by `(video_id, frame_idx, object_id)`
- backend persists mask PNG under configured mask root and stores relative `mask.path` metadata in SQLite

### `POST /api/videos/{video_id}/sam2/refine-mask`

Refine one frame with extra prompts or edited seed mask.

### `POST /api/videos/{video_id}/sam2/propagate`

Propagate one or more objects across a frame range.

### Request

```json
{
  "session_id": "sam2-session-001",
  "start_frame_idx": 120,
  "end_frame_idx": 180,
  "direction": "forward",
  "object_ids": ["object-1"]
}
```

### Response

```json
{
  "job_id": "job-001",
  "status": "queued",
  "progress_current": 0,
  "progress_total": 60
}
```

### Errors

- `400 {"detail": "Frame index must be between 0 and N"}` when `start_frame_idx` or `end_frame_idx` falls outside indexed video bounds
- `400 {"detail": "Forward propagation end frame must be greater than or equal to start frame"}` when a forward request points backward
- `400 {"detail": "Backward propagation end frame must be less than or equal to start frame"}` when a backward request points forward
- `404 {"detail": "Indexed video not found"}` when the id is unknown
- `404 {"detail": "SAM2 session not found"}` when the session does not belong to selected video or is already closed

### Notes

- propagation job excludes the seed `start_frame_idx`; progress counts only newly persisted frames
- request `direction` must be `forward`, `backward`, or `both`
- backend persists one `jobs` row immediately, then runs propagation in background against fresh DB sessions
- background worker upserts propagated masks into `frame_annotations` and stores partial/final frame lists in `result`

---

## Jobs

### `GET /api/jobs/{job_id}`

Return job status and progress.

### Response

```json
{
  "job_id": "job-001",
  "type": "sam2_propagation",
  "status": "running",
  "progress_current": 15,
  "progress_total": 60,
  "result": {
    "object_ids": ["object-1"],
    "persisted_frame_count": 15,
    "persisted_frame_indices": [121, 122, 123]
  },
  "error_message": null
}
```

### Errors

- `404 {"detail": "Job not found"}` when the id is unknown

### `POST /api/jobs/{job_id}/cancel`

Cancel a running job.

### Response

```json
{
  "job_id": "job-001",
  "status": "cancelling"
}
```

### Errors

- `404 {"detail": "Job not found"}` when the id is unknown

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
