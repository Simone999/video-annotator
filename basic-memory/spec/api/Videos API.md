---
title: Videos API
type: spec
canonical: true
domain: api
aliases:
- videos api
- manifest api
- summary api
- exact frame api
- video manifest api
permalink: video-annotator/spec/api/videos-api
tags:
- spec
- api
- videos
- manifest
- review
---

# Videos API

Use this note for videos API, manifest API, exact-frame API, and selected-object summary API queries.

Route contracts for indexed-video reads, contextual source playback, manifest API metadata, exact-frame API fetches, and selected-object summary API reads.

## Routes

### `GET /api/videos`

Return all indexed videos.

#### Response

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

### `GET /api/videos/{video_id}`

Return metadata for one video.

#### Response

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

#### Errors

- `404 {"detail": "Indexed video not found"}` when id is unknown

#### Notes

- `source_path` is persisted backend metadata. Frontend playback should use backend source route, not treat this filesystem path as browser URL.

### `GET /api/videos/{video_id}/source`

Return indexed local source video for contextual playback.

#### Response

- `200 OK`
- `Content-Type: video/*` based on indexed file suffix
- body: raw video bytes streamed from local storage

#### Errors

- `404 {"detail": "Indexed video not found"}` when id is unknown

#### Notes

- This route exists for playback context only.
- Playback remains contextual only.

### `GET /api/videos/{video_id}/manifest`

Return review video metadata, stable object summary, annotated frame indices, keyframe indices, and shipped review-state metadata for library view.

#### Response

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

#### Errors

- `404 {"detail": "Indexed video not found"}` when id is unknown

#### Notes

- `annotated_frames` and `keyframes` stay keyed by backend zero-based `frame_idx`.
- `objects[].id` is stable persisted object identity, not UI-local temp state.
- Library review state values are `not_started`, `started`, `in_progress`, `ready`, and `exported`.
- `not_started` means no imported boxes and no saved review output yet.
- `started` means imported boxes exist, but no manual review save exists yet.
- `ready` means current saved state is ready for review or export.
- Importing boxes sets `review_state = started`.
- First manual save moves `not_started` or `started` to `ready`.
- Starting propagation moves `ready` to `in_progress`, and completion returns it to `ready`.
- Any manual edit after `exported` moves video back to `ready`.
- Importing new boxes over reviewed or exported work resets video to `started` until next manual save.
- `review_state = exported` only when the latest persisted export snapshot still matches current saved review output.
- Progress is propagation completion only and is visible only while video is `in_progress`.
- `review_summary.last_reviewed_frame_idx` tracks reviewer-owned manual edits only; `review_summary.last_annotated_frame_idx` tracks any persisted annotation source.

### `GET /api/videos/{video_id}/frame/{frame_idx}`

Return backend-decoded exact frame image for canonical zero-based frame index `frame_idx`.

#### Response

- `200 OK`
- `Content-Type: image/png`
- body: raw PNG bytes for requested exact frame

#### Errors

- `400 {"detail": "Frame index must be between 0 and N"}` when `frame_idx` is negative or outside indexed range for selected video
- `404 {"detail": "Indexed video not found"}` when id is unknown

#### Notes

- `frame_idx` is backend-canonical and zero-based.
- Clients must not derive annotation truth from browser playback time.

### `GET /api/videos/{video_id}/objects/{object_id}/summary`

Return selected-object summary for main review surface.

#### Query params

- `frame_idx`: canonical current frame for bbox and confidence display
- `start_frame_idx`: start of selected review range
- `end_frame_idx`: end of selected review range

#### Response

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
    "corrected": 3
  }
}
```

#### Notes

- `bbox_xyxy_px` and `mask_confidence` are scoped to `frame_idx`.
- `track_summary` is scoped to `start_frame_idx` and `end_frame_idx`.
- `track_summary.frames` means total frames in selected range, not only annotated frames.
- `track_summary.propagated` means frames in selected range where object has propagated mask.
- `track_summary.corrected` means non-keyframe `source = "sam2_edited"` rows in selected range, not every manual edit.
- This endpoint ships today.
- `mask_confidence` returns persisted current-frame confidence only when row is untouched `source = "sam2"`.
- Manual-only rows and corrected rows still return `mask_confidence = null`.
- Default local runtime serves prompt and propagation through `Sam2Service`; prompt setup failures return `503`, while propagation setup failures surface on job reads as `status = "failed"` plus explicit `error_message`.
- Corrected keyframes do not increment `track_summary.corrected`.

## Observations
- [route] Video list, detail, and manifest routes expose derived review-state metadata for library UI. #videos #api
- [route] Exact-frame route returns backend-decoded PNG bytes keyed by canonical zero-based `frame_idx`. #frames #api
- [route] Selected-object summary is dedicated inspector contract, not manifest overload. #summary #api
- [guardrail] `source_path` is backend metadata only; contextual playback should use source route. #videos #playback
- [retrieval] Use this note for manifest API, exact-frame API, or selected-object summary API queries. #search

## Relations
- indexed_by [[API]]
- relates_to [[Frame Indexing Contract]]
- relates_to [[Data Model]]
- relates_to [[Frontend Interaction Spec]]
- relates_to [[Video Ingest and Exact-Frame Review]]
