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

Create export package.

#### Request

```json
{
  "native_json": true,
  "png_masks": true,
  "boxes_only": false
}
```

#### Response

```json
{
  "export_id": "export-1234abcd"
}
```

#### Rules

- `native_json` must stay `true`
- current honest option pairs are:
  - `png_masks=true` with `boxes_only=false`
  - `png_masks=false` with `boxes_only=true`

### `GET /api/exports/{export_id}`

Download export artifact.

#### Response

- `application/zip` file download keyed by stable `export_id`

## Observations
- [route] Export creation is separate from artifact download. #export #api
- [option] Export create request currently exposes `native_json`, `png_masks`, and `boxes_only`. #export #api
- [response] Export create returns stable `export_id`; frontend clients build download URLs from `/api/exports/{export_id}`. #export #api
- [guardrail] Route rejects option combinations that current artifact writer cannot serve honestly. #export #validation
- [boundary] Artifact layout and `annotations.json` semantics stay in [[Export Format]], not this route note. #export #spec

## Relations
- indexed_by [[API]]
- relates_to [[Export Format]]
- relates_to [[Export]]
