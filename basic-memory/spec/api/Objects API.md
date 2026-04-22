---
title: Objects API
type: spec
canonical: true
domain: api
aliases:
- objects api
- object tracks api
- object metadata api
permalink: video-annotator/spec/api/objects-api
tags:
- spec
- api
- objects
- tracks
---

# Objects API

Route contracts for video-scoped object-track creation and object metadata lifecycle.

## Routes

### `POST /api/videos/{video_id}/objects`

Create new object.

#### Request

```json
{
  "label": "left"
}
```

#### Response

```json
{
  "id": "object-7f3a2a08a4c1",
  "label": "left",
  "color": "#00ffaa",
  "status": "active"
}
```

#### Errors

- `404 {"detail": "Indexed video not found"}` when id is unknown

#### Notes

- Object creation is video-scoped; backend refuses to create tracks for unknown videos.
- Initial object metadata defaults to `color = "#00ffaa"` and `status = "active"`.

### `PATCH /api/videos/{video_id}/objects/{object_id}`

Update object metadata.

### `DELETE /api/videos/{video_id}/objects/{object_id}`

Delete whole object track.

## Observations
- [route] Object routes are video-scoped, not global object endpoints. #objects #api
- [default] New objects default to `color = "#00ffaa"` and `status = "active"`. #objects #api
- [boundary] Object identity comes from persisted backend track ids, not UI-local temp state. #objects #api

## Relations
- indexed_by [[API]]
- relates_to [[Data Model]]
- relates_to [[Annotation Foundation and Manual Box Workflow]]
