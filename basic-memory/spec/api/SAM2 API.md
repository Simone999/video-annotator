---
title: SAM2 API
type: spec
canonical: true
domain: api
aliases:
- sam2 api
- prompt box api
- propagate api
permalink: video-annotator/spec/api/sam2-api
tags:
- spec
- api
- sam2
- jobs
- masks
---

# SAM2 API

Route contracts for SAM2 session lifecycle, prompt-based mask generation, planned refine route, and propagation job creation.

## Routes

### `POST /api/videos/{video_id}/sam2/session`

Create or reuse SAM2 session.

#### Response

```json
{
  "session_id": "sam2_sess_001",
  "reused": false
}
```

### `POST /api/videos/{video_id}/sam2/prompt-box`

Generate mask from box on one frame.

#### Notes

- `POST /api/videos/{video_id}/sam2/session` still opens lightweight persisted session metadata first.
- Prompt runtime loads lazily on first prompt from `SAM2_CONFIG_PATH` and `SAM2_CHECKPOINT_PATH`.
- `SAM2_CONFIG_PATH` may be direct `configs/...yaml` value or file path that contains `configs/` segment.
- If runtime config, checkpoint, optional dependencies, or requested device are unavailable, this route returns `503 Service Unavailable` with explicit detail string.

#### Request

```json
{
  "session_id": "sam2_sess_001",
  "frame_idx": 120,
  "object_id": "object-1",
  "box_xyxy_px": [620, 280, 760, 470]
}
```

#### Response

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

#### Notes

- Prompt response now echoes nullable persisted `mask_confidence` immediately.
- Untouched `source = "sam2"` rows may return numeric confidence when adapter provides one.
- Current real local-runtime path stays honest with `null` until runtime can prove confidence.
- Manual-only or corrected rows still return `null`.

### `POST /api/videos/{video_id}/sam2/refine-mask`

Not shipped yet. Planned same-frame follow-up route for m-4 mask editing and cleanup work.

#### Planned Request

```json
{
  "session_id": "sam2_sess_001",
  "frame_idx": 120,
  "object_id": "object-1",
  "positive_points": [[640, 320]],
  "negative_points": [[710, 410]],
  "seed_mask": {
    "path": "masks/video-123/object-1/frame_000120.png"
  }
}
```

#### Planned Response

```json
{
  "frame_idx": 120,
  "annotation": {
    "object_id": "object-1",
    "source": "sam2_edited",
    "box_xywh_norm": [0.3229, 0.2593, 0.0729, 0.1759],
    "mask_confidence": null,
    "mask": {
      "path": "masks/video-123/object-1/frame_000120.png"
    }
  }
}
```

#### Planned Notes

- Route stays on same canonical frame; it does not create propagation history by itself.
- Accepted corrected masks should persist through normal frame-annotation storage, not a separate temporary table.
- Persisted corrected rows reuse `source = "sam2_edited"` and clear `mask_confidence` to `null`.
- Corrected propagated rows keep `is_keyframe = false`; corrected keyframes keep `is_keyframe = true`.
- Selected-object summary should count only non-keyframe corrected rows toward `track_summary.corrected`.

### `POST /api/videos/{video_id}/sam2/propagate`

Propagate one or more objects across frame range.

#### Request

```json
{
  "session_id": "sam2_sess_001",
  "start_frame_idx": 120,
  "end_frame_idx": 180,
  "direction": "forward",
  "object_ids": ["object-1"]
}
```

#### Response

```json
{
  "job_id": "job_001",
  "status": "queued",
  "progress_current": 0,
  "progress_total": 60
}
```

#### Notes

- This route queues background work only; persisted mask writes arrive through job path.
- Default local runtime maps propagation onto official SAM2 `propagate_in_video(...)` calls behind `Sam2Service`.
- If backend memory lost one open runtime session after `POST /sam2/session` or prompt use, propagation start recreates process-local session state from persisted open DB row before queueing work.
- If that recovery needs indexed source file and it is missing, this route returns `409 {"detail": "Indexed video source is not available"}`.
- Missing runtime config or dependency failures do not change `202` create-job response; they appear on later `GET /api/jobs/{job_id}` reads as `status = "failed"` with explicit `error_message`.

## Observations
- [route] Session route creates or reuses lightweight persisted SAM2 session metadata. #sam2 #api
- [route] Prompt-box may return `503` when runtime config, checkpoint, dependency, or device setup fails. #sam2 #api
- [route] Propagation queues background work; many runtime failures surface later on job reads instead of create-job response. #sam2 #jobs #api
- [status] `refine-mask` is planned, not shipped; contract target is same-frame persisted `source = "sam2_edited"` output. #sam2 #api

## Relations
- indexed_by [[API]]
- relates_to [[SAM2 Integration]]
- relates_to [[Jobs API]]
- relates_to [[SAM2 Shell and Runtime]]
