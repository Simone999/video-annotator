---
title: Export API
type: spec
canonical: true
domain: api
aliases:
- export api
- create export api
- download export api
permalink: video-annotator/spec/api/export-api
tags:
- spec
- api
- export
- download
---

# Export API

Route contracts for export creation and artifact download.

## Routes

### `POST /api/videos/{video_id}/export`

Create one full export package for one video.

#### Request

No request body.

#### Response

```json
{
  "export_id": "export-1234abcd"
}
```

#### Rules

- Route always creates the honest full package profile.
- Package contents stay `annotations.json` plus PNG mask files when persisted masks exist.
- Unknown `video_id` returns `404`.
- Missing review output for export returns `409`.

### `GET /api/exports/{export_id}`

Download export artifact.

#### Response

- `application/zip` file download keyed by stable `export_id`

## Observations
- [route] Export creation is separate from artifact download. #export #api
- [contract] Export create takes no request body and always builds the full package profile. #export #api
- [response] Export create returns stable `export_id`; frontend clients build download URLs from `/api/exports/{export_id}`. #export #api
- [boundary] Artifact layout and `annotations.json` semantics stay in [[Export Format]], not this route note. #export #spec

## Relations
- indexed_by [[API]]
- relates_to [[Export Format]]
- relates_to [[Export]]
