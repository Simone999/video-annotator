---
title: API
type: note
permalink: video-annotator/spec/engineering/api
tags:
- spec
- engineering
- api
- backend
---

# API

This note is canonical backend contract for video annotation APIs, SAM2 job endpoints, exact-frame retrieval, and annotation export workflows. Use it to answer practical API questions such as how to fetch exact video frame data, what annotation request payloads look like, what export endpoint payloads and options look like, how binary frame error responses should behave, and which job status fields polling returns. Backend-owned zero-based `frame_idx` is source of truth for every route that reads, writes, propagates, or exports annotations; clients must treat browser playback time as derived UI state, not annotation identity.

Video endpoints group into catalog, metadata, and binary frame access. `GET /api/videos` returns indexed videos, `GET /api/videos/{video_id}` returns one video, and `GET /api/videos/{video_id}/manifest` returns review metadata such as `frame_count`, `fps`, `duration_seconds`, `annotated_frames`, `keyframes`, and object summary. `GET /api/videos/{video_id}/frame/{frame_idx}` returns exact frame image bytes for persisted frame index, with optional `format=png|jpeg` and optional preview `width`. Success response is binary image payload, not JSON wrapper. Failure path for binary frame requests should switch to concise actionable JSON errors so decode failures, unsupported codecs, invalid frame indices, or missing local media are still diagnosable by clients.

Annotation routes keep request and response payloads frame-scoped and explicit. `GET /api/videos/{video_id}/annotations` returns all video objects plus frame annotations; `PUT /api/videos/{video_id}/annotations/frame/{frame_idx}` upserts annotation request payload for one frame; `DELETE /api/videos/{video_id}/annotations/frame/{frame_idx}/object/{object_id}` deletes one object annotation from one frame; `POST /api/videos/{video_id}/objects`, `PATCH /api/videos/{video_id}/objects/{object_id}`, and `DELETE /api/videos/{video_id}/objects/{object_id}` manage track metadata and whole-track deletion. Frame annotation responses should include frame identity, object identity, keyframe/source metadata, normalized box coordinates, and mask reference metadata.

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

SAM2 routes split into session lifecycle, same-frame prompting, same-frame refinement, and async propagation. `POST /api/videos/{video_id}/sam2/session` creates or reuses one session for video; `DELETE /api/videos/{video_id}/sam2/session/{session_id}` closes it. `POST /api/videos/{video_id}/sam2/prompt-box` accepts `session_id`, `frame_idx`, `object_id`, and either `box_xyxy_px` or `box_xywh_px`, then returns mask result for same canonical frame. `POST /api/videos/{video_id}/sam2/refine-mask` accepts same frame identity plus optional positive/negative points and optional edited mask seed, then returns updated mask for that frame. `POST /api/videos/{video_id}/sam2/propagate` starts background propagation with `session_id`, `start_frame_idx`, optional `end_frame_idx`, `direction` (`forward|backward|both`), and `object_ids`; route returns deterministic initial job snapshot instead of waiting for completion.

```json
{
  "session_id": "sam2_sess_01",
  "frame_idx": 120,
  "object_id": 1,
  "box_xyxy_px": [620, 280, 760, 470]
}
```

Job polling and export stay explicit. `GET /api/jobs/{job_id}` returns job status fields for propagation work: `id`, `type`, `video_id`, optional `object_id`, `session_id`, `status`, `progress_current`, `progress_total`, request `payload_json`, optional `result_json`, optional `error_message`, and lifecycle timestamps for queued/start/cancel/complete states. `POST /api/jobs/{job_id}/cancel` requests cancellation; workers must observe cancellation during propagation and surface terminal cancelled state without persisting extra late frames. Export uses `POST /api/videos/{video_id}/export` to create package with options such as `native_json`, `png_masks`, `boxes_only`, and `include_unannotated`, then `GET /api/exports/{export_id}` to download result. Across all non-binary failures, user-visible errors must stay concise and actionable for decode failure, unsupported codec, missing SAM2 model, GPU unavailable, out-of-memory, corrupt mask file, save conflict, failed export, and cancelled propagation.

## Observations
- [contract] `frame_idx` from backend indexing is canonical identity across exact-frame fetch, annotation request payloads, SAM2 prompt/refine calls, propagation jobs, and export output #api #frames
- [contract] `GET /api/videos/{video_id}/frame/{frame_idx}` returns raw image bytes on success and concise actionable JSON errors on failure #api #binary #errors
- [payload] Frame annotation responses should carry `video_id`, `frame_idx`, per-object metadata, normalized box coordinates, and mask reference data instead of browser-derived timing fields #annotations #payload
- [payload] SAM2 prompt-box and refine-mask requests must always include `session_id`, `frame_idx`, and `object_id`, with box or point inputs scoped to same frame #sam2 #payload
- [job] Propagation status polling should expose `status`, `progress_current`, `progress_total`, request payload, optional result frame indices, optional error text, and lifecycle timestamps #jobs #sam2
- [workflow] Export remains two-step: create package with explicit options through `POST /api/videos/{video_id}/export`, then download through `GET /api/exports/{export_id}` #export #api
- [error] User-visible API failures should be short, concrete, and actionable, especially for media decode, model availability, storage corruption, save conflicts, export failures, and cancelled propagation #errors #ux

## Relations
- depends_on [[Data Model]]
- depends_on [[Frame Indexing Contract]]
- relates_to [[Architecture]]
- relates_to [[SAM2 Integration]]
- relates_to [[Export Format]]
- relates_to [[Test Plan]]
- relates_to [[Delivery Plan and Risks]]
