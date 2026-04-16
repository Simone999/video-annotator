---
title: Data Model
type: note
permalink: video-annotator/spec/engineering/data-model
tags:
- spec
- engineering
- data-model
- storage
---

# Data Model

The storage model is split on purpose: relational state lives in the local database, while binary mask images live on local disk. This keeps the app local-first, makes frame-indexed annotation state queryable, and avoids treating SAM2 runtime memory as durable truth. The backend-decoded frame index is the canonical key that ties all persisted annotation state together.

`Video` is the root entity for one indexed source file and stores retrieval metadata such as `id`, `filepath`, `name`, `width`, `height`, `fps`, `frame_count`, and `duration_seconds`. `ObjectTrack` represents one tracked object within a video through fields such as `id`, `video_id`, `label`, `color`, and `status`; it becomes the durable identity that later frame annotations attach to across frames. Tracks get created when the backend first persists a new object for a video, typically at the first saved keyframe or first accepted SAM2-backed annotation for that object. `FrameAnnotation` is the per-frame persistence unit keyed in practice by `(video_id, frame_idx, object_id)`, with `is_keyframe`, `source`, box fields (`box_x`, `box_y`, `box_w`, `box_h`), optional `mask_rle`, and `mask_path` for the persisted mask image. This is how frame annotations persist: every saved frame upserts durable state for one object at one canonical backend frame index, and each additional saved frame extends that object's track across frames.

Mask files do not live in the database. The database stores `mask_path` as a relative path, while the actual PNG bytes live under local mask storage such as `masks/<video_id>/object_<object_id>/frame_<zero_padded_idx>.png`; the native export uses the same deterministic shape, for example `masks/vid_001/object_1/frame_000120.png`. This answers where masks live on disk and gives the persisted mask path pattern used for retrieval, export, and reopening saved overlays.

SAM2 persistence is split between session metadata and job metadata. `Sam2Session` stores only lifecycle fields such as `id`, `video_id`, `status`, `created_at`, and `last_used_at`; predictor internals stay outside the database behind the SAM2 adapter. `Job` stores background-work state with fields such as `id`, `type`, `video_id`, optional `object_id`, `status`, `progress_current`, `progress_total`, `payload_json`, `result_json`, and `error_message`. For propagation, `payload_json` carries request inputs such as the start frame and target frame set, while `result_json` is the durable summary of persisted work and includes `persisted_frame_count` and `persisted_frame_indices`. The session and job flow is therefore: create or reuse a video-scoped session, enqueue a propagation job, persist `FrameAnnotation` rows and mask files as frames complete, and expose the final saved frame indices through `result_json` for deterministic polling and reopen flows.

## Observations
- [model] The canonical persistence key is backend `frame_idx`, not browser playback time #frame-index
- [storage] Metadata belongs in DB rows, but mask binaries belong on local disk and are referenced by `mask_path` #storage
- [pattern] `FrameAnnotation` is the durable per-frame-per-object record, and prompt or propagation writes should upsert by `(video_id, frame_idx, object_id)` #annotations
- [pattern] `Sam2Session` persists lifecycle metadata only; runtime predictor state is intentionally non-persistent #sam2
- [pattern] Propagation `Job.result_json` should expose `persisted_frame_count` and `persisted_frame_indices` so clients can discover saved outputs without treating transient worker memory as truth #jobs
- [lifecycle] Object tracks get created when the backend first persists a new object for a video, usually from first saved keyframe annotation or first accepted SAM2 prompt result #tracks

## Relations
- depends_on [[Frame Indexing Contract]]
- pairs_with [[Export Format]]
- relates_to [[Architecture]]
- relates_to [[API]]
- relates_to [[SAM2 Integration]]
- relates_to [[Engineering Index]]
- relates_to [[Test Plan]]
