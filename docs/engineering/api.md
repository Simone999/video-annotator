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

### `GET /api/videos/{video_id}/annotations`

Return all annotations for the video.

### `GET /api/videos/{video_id}/annotations/frame/{frame_idx}`

Return annotations for a specific frame.

### Response

```json
{
  "video_id": "vid_001",
  "frame_idx": 120,
  "annotations": [
    {
      "object_id": 1,
      "label": "left",
      "is_keyframe": true,
      "source": "manual",
      "box_xywh_norm": [0.41, 0.29, 0.10, 0.16],
      "mask": {
        "type": "png",
        "path": "masks/vid_001/object_1/frame_000120.png"
      }
    }
  ]
}
```

### `PUT /api/videos/{video_id}/annotations/frame/{frame_idx}`

Upsert annotations for a frame.

### Request

```json
{
  "annotations": [
    {
      "object_id": 1,
      "label": "left",
      "is_keyframe": true,
      "source": "manual",
      "box_xywh_norm": [0.41, 0.29, 0.10, 0.16],
      "mask_png_base64": "..."
    }
  ]
}
```

### `DELETE /api/videos/{video_id}/annotations/frame/{frame_idx}/object/{object_id}`

Delete one object's annotation on one frame.

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
