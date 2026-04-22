---
title: Product Requirements
type: spec
canonical: true
domain: product
permalink: video-annotator/spec/product/product-requirements
tags:
- spec
- product
- requirements
- scope
---

# Product Requirements

This product is local-first video annotation review for technical annotators and ML engineers. Main job: pick local video, optionally import existing boxes as seed data, inspect overlayed annotations on video, pause on canonical frames for review work, run SAM2 when needed, review propagation, then export deterministic results.

Primary flow starts in the video library. User opens library, picks one video, optionally imports boxes, lands in a single review surface, plays video from current frame onward, pauses on exact frame, edits or runs SAM2, reviews propagation, then exports. Playback exists on the main stage, but backend `frame_idx` stays canonical truth. Browser time never becomes annotation identity.

V1 scope includes video library selection, import of existing boxes from the current pipeline format, single review surface with playback and overlays, frame jump or step, box CRUD, mask display and cleanup, SAM2 prompt-box and propagation, propagation progress, local persistence, JSON export, and PNG mask export. Out of scope stays collaboration, auth, comments, audit, cloud deploy, broad dataset management, and autonomous labeling.

Library state model is part of product truth:
- `not_started`: indexed video with no imported boxes and no saved review output
- `started`: imported boxes exist, but the reviewer has not saved a manual review edit yet
- `in_progress`: propagation job is active
- `ready`: current saved state is ready for manual review or export
- `exported`: latest export matches current saved review state

State transitions:
- importing boxes moves a video to `started`
- the first manual save moves `not_started` or `started` to `ready`
- pressing `Propagate` moves `ready` to `in_progress`, then back to `ready` when propagation finishes
- any manual edit after `exported` moves the video back to `ready`
- importing new boxes over already reviewed or exported work resets the video to `started` until the next manual save

Progress bar means propagation completion only and shows only in `in_progress`.

Editing rule is strict:
- playback may run on main stage
- create, edit, delete, save, and SAM2 actions are paused-only on canonical current frame

Selected-object UI must expose object id or class, bbox, nullable confidence, and selected-range counters `frames`, `propagated`, and `corrected`.

Counter meanings:
- `frames`: total frames in the selected range
- `propagated`: frames in the selected range with a propagated mask for the selected object
- `corrected`: propagated masks in the selected range later fixed by the reviewer

Confidence rule:
- numeric only for untouched SAM2-generated masks
- `null` for manual-only masks
- `null` after reviewer correction

## Observations
- [journey] Product flow is library select -> optional import -> single review surface -> paused exact-frame edits -> propagation review -> export #product #workflow
- [truth] Main stage plays video with overlayed annotations, but backend `frame_idx` remains canonical truth #frames #frontend
- [rule] Mutating actions are paused-only on canonical current frame #editing #sam2
- [library] Library state model is `not_started`, `started`, `in_progress`, `ready`, `exported` with explicit transitions #library #states
- [library] Progress bar means propagation completion only and appears only in `in_progress` #library #progress
- [inspector] Selected-object inspector shows bbox, nullable confidence, and selected-range summary fields with defined counter meanings #inspector #ux
- [scope] V1 includes import, SAM2 assist, cleanup, persistence, and export in one local-first workflow #scope

## Relations
- relates_to [[Frontend Interaction Spec]]
- relates_to [[Architecture]]
- relates_to [[Delivery Plan and Risks]]
- depends_on [[Frame Indexing Contract]]