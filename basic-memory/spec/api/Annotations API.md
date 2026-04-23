---
title: Annotations API
type: spec
canonical: true
domain: api
aliases:
- annotations api
- frame annotations api
- manual annotation api
permalink: video-annotator/spec/api/annotations-api
tags:
- spec
- api
- annotations
- manual-box
- frames
---

# Annotations API

Route contracts for annotation reads, frame-scoped manual annotation writes, and mask-only cleanup on one video.

## Routes

### `GET /api/videos/{video_id}/annotations`

Return all annotations for selected video.

### `GET /api/videos/{video_id}/annotations/frame/{frame_idx}`

Return annotations for one specific frame.

#### Response

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

#### Notes

- Frame reads must return persisted manual box rows even when no mask exists yet.
- Manual rows use `"mask": null`; SAM2 rows keep mask path metadata.
- Frame reads expose top-level nullable `mask_confidence`.
- Reviewer-visible confidence stays `null` unless current row is untouched `source = "sam2"`.
- Selected-object summary remains inspector's range-scoped confidence contract.
- Frontend exact-frame reload should hydrate editable saved-manual box state from returned manual rows so move, resize, and delete still work after reopening frame `N`.

### `PUT /api/videos/{video_id}/annotations/frame/{frame_idx}`

Upsert one manual annotation for one canonical frame.

#### Request

```json
{
  "object_id": "object-001",
  "is_keyframe": true,
  "box_xywh_norm": [0.41, 0.29, 0.10, 0.16]
}
```

#### Response

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

#### Notes

- Current shipped serializers differ between reads and writes for manual rows.
- `GET /api/videos/{video_id}/annotations/frame/{frame_idx}` returns manual rows as `"mask": null`.
- `PUT /api/videos/{video_id}/annotations/frame/{frame_idx}` currently echoes manual rows as `"mask": { "path": null }`.
- Manual writes clear any stored `mask_confidence`.
- Selected-object inspector still reads confidence from `GET /api/videos/{video_id}/objects/{object_id}/summary` because it also needs selected-range counters.

#### Errors

- `404 {"detail": "Indexed video not found"}` when selected video id is unknown
- `404 {"detail": "Object track not found"}` when object id is missing or belongs to different video
- `400 {"detail": "Frame index must be between 0 and N"}` when `frame_idx` is outside indexed bounds

### `DELETE /api/videos/{video_id}/annotations/frame/{frame_idx}/object/{object_id}`

Delete one object's annotation on one frame.

#### Response

- `204 No Content`

#### Errors

- `404 {"detail": "Indexed video not found"}` when selected video id is unknown
- `404 {"detail": "Frame annotation not found"}` when frame has no persisted row for object
- `400 {"detail": "Frame index must be between 0 and N"}` when `frame_idx` is outside indexed bounds

### `DELETE /api/videos/{video_id}/annotations/frame/{frame_idx}/object/{object_id}/mask`

Delete one object's saved mask on one frame without touching unrelated rows.

#### Response

- `204 No Content`

#### Notes

- If box truth still exists on that row, this route clears only `mask_path`, `mask_rle`, and `mask_confidence`.
- If the row was mask-only propagated state, this route deletes that row instead of leaving an empty ghost annotation.
- Later frame reads must either return the preserved row with `"mask": null` or no row at all when cleanup removed mask-only propagated state.

#### Errors

- `404 {"detail": "Indexed video not found"}` when selected video id is unknown
- `404 {"detail": "Frame annotation not found"}` when frame has no persisted mask for object
- `400 {"detail": "Frame index must be between 0 and N"}` when `frame_idx` is outside indexed bounds

## Observations
- [route] Annotation reads must return manual rows even when mask data is absent. #annotations #api
- [route] Manual writes clear stored `mask_confidence`. #mask #confidence #api
- [route] Frame-local mask cleanup preserves row truth and clears only mask fields. #annotations #cleanup #api
- [route] Current shipped serializers differ between frame-read and manual-write echoes for manual rows. #annotations #api
- [guardrail] Annotation routes stay frame-scoped on canonical backend `frame_idx`. #frames #api

## Relations
- indexed_by [[API]]
- relates_to [[Frame Indexing Contract]]
- relates_to [[Data Model]]
- relates_to [[Annotation Foundation and Manual Box Workflow]]
