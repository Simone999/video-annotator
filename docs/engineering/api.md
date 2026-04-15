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

* selected video metadata
* persisted object summaries
* distinct annotated frame indices
* distinct keyframe indices

### Response

```json
{
  "video": {
    "id": "vid_001",
    "source_path": "/abs/path/to/data/videos/patient_001.mp4",
    "display_name": "patient_001.mp4",
    "fps": 25.0,
    "frame_count": 8123,
    "width": 1920,
    "height": 1080,
    "duration_seconds": 324.92
  },
  "annotated_frame_indices": [120, 121, 130, 220],
  "keyframe_indices": [120, 130],
  "objects": [
    {
      "id": 1,
      "label": "left",
      "color": null,
      "status": "active"
    }
  ]
}
```

### Errors

- `404 {"detail": "Indexed video not found"}` when the id is unknown

### Notes

- `annotated_frame_indices` and `keyframe_indices` are sorted distinct backend-canonical `frame_idx` values.
- `objects` are returned in stable persisted id order for deterministic reloads.

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

### `GET /api/videos/{video_id}/annotations`

Return all persisted annotations for the selected video.

### Response

```json
{
  "video_id": "vid_001",
  "annotations": [
    {
      "frame_idx": 120,
      "object_id": 1,
      "is_keyframe": true,
      "source": "manual",
      "box_xywh_norm": [0.41, 0.29, 0.10, 0.16]
    },
    {
      "frame_idx": 121,
      "object_id": 1,
      "is_keyframe": false,
      "source": "sam2",
      "box_xywh_norm": [0.40, 0.30, 0.11, 0.16]
    }
  ]
}
```

### Errors

- `404 {"detail": "Indexed video not found"}` when the id is unknown

### Notes

- Results are sorted by canonical `frame_idx`, then `object_id`.
- `frame_idx` is always backend-canonical and zero-based.

### `GET /api/videos/{video_id}/annotations/frame/{frame_idx}`

Return all persisted annotations for one canonical frame.

### Response

```json
{
  "video_id": "vid_001",
  "frame_idx": 120,
  "annotations": [
    {
      "object_id": 1,
      "is_keyframe": true,
      "source": "manual",
      "box_xywh_norm": [0.41, 0.29, 0.10, 0.16]
    }
  ]
}
```

### Errors

- `400 {"detail": "Frame index must be between 0 and N"}` when `frame_idx` is negative or outside the indexed range for the selected video
- `404 {"detail": "Indexed video not found"}` when the id is unknown

### Notes

- Results are sorted by `object_id`.
- Empty frames return `200` with an empty `annotations` list.

### `PUT /api/videos/{video_id}/annotations/frame/{frame_idx}`

Create or update one or more object annotations on one canonical frame.

### Request

```json
{
  "annotations": [
    {
      "object_id": 1,
      "is_keyframe": true,
      "source": "manual",
      "box_xywh_norm": [0.41, 0.29, 0.10, 0.16]
    }
  ]
}
```

### Response

Returns the same shape as `GET /api/videos/{video_id}/annotations/frame/{frame_idx}` after the write commits.

### Errors

- `400 {"detail": "Frame index must be between 0 and N"}` when `frame_idx` is negative or outside the indexed range for the selected video
- `404 {"detail": "Indexed video not found"}` when the id is unknown
- `404 {"detail": "Object track not found for video: X"}` when any `object_id` does not belong to the selected video
- `422 Unprocessable Entity` when `box_xywh_norm` does not contain exactly four normalized values in `[0.0, 1.0]`

### Notes

- This route upserts only the object rows listed in the request. It does not delete other objects on the same frame.
- The persisted row key remains `(video_id, frame_idx, object_id)`.

### `DELETE /api/videos/{video_id}/annotations/frame/{frame_idx}/object/{object_id}`

Delete one object's annotation on one frame.

### Response

- `204 No Content`

### Errors

- `400 {"detail": "Frame index must be between 0 and N"}` when `frame_idx` is negative or outside the indexed range for the selected video
- `404 {"detail": "Indexed video not found"}` when the id is unknown
- `404 {"detail": "Frame annotation not found"}` when the selected row does not exist

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
  "id": 1,
  "label": "left",
  "color": null,
  "status": "active"
}
```

### Errors

- `404 {"detail": "Indexed video not found"}` when the id is unknown

### Notes

- Object creation is video-scoped.
- New objects persist immediately and appear in later manifest reloads for the same video.

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

### Request

```json
{
  "session_id": "sam2_sess_001",
  "frame_idx": 120,
  "object_id": 1,
  "box_xyxy_px": [620, 280, 760, 470]
}
```

### Response

```json
{
  "frame_idx": 120,
  "results": [
    {
      "object_id": 1,
      "mask": {
        "type": "rle",
        "size": [1080, 1920],
        "counts": "..."
      }
    }
  ]
}
```

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
