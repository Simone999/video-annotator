---
title: Product Requirements
type: spec
canonical: true
domain: product
aliases:
- prd
- product requirements document
- repo prd
permalink: video-annotator/spec/product/product-requirements
tags:
- spec
- product
- requirements
- scope
---

# Product Requirements

This product is local-first video annotation review for technical annotators and ML engineers. Main job: pick local video, inspect overlayed annotations on video, pause on canonical frames for review work, run SAM2 when needed, review propagation, then export deterministic results. Existing-box import remains planned product scope, but blocked today pending final mapping and shipped workflow delivery.

Primary flow starts in the video library. User opens library, picks one video, lands in a single review surface, plays video from current frame onward, pauses on exact frame, edits or runs SAM2, reviews propagation, then exports. Planned import flow should slot into that journey as optional seed-data setup once blocked import work lands. Playback exists on the main stage, but backend `frame_idx` stays canonical truth. Browser time never becomes annotation identity.

V1 scope includes video library selection, single review surface with playback and overlays, frame jump or step, box CRUD, mask display and cleanup, SAM2 prompt-box and propagation, propagation progress, local persistence, and one export action that produces one deterministic full-package zip with `annotations.json` plus persisted PNG masks when they exist. Existing-box import from current pipeline format remains planned v1 scope but is currently blocked, not shipped. Out of scope stays collaboration, auth, comments, audit, cloud deploy, broad dataset management, and autonomous labeling.

Shipped library state model is:
- `not_started`: indexed video with no imported boxes and no saved review output
- `in_progress`: propagation job is active
- `ready`: current saved state is ready for manual review or export
- `exported`: latest export matches current saved review state

Shipped state transitions:
- the first manual save moves `not_started` to `ready`
- pressing `Propagate` moves `ready` to `in_progress`, then back to `ready` when propagation finishes
- any manual edit after `exported` moves the video back to `ready`

Planned import-only state extension, blocked today:
- `started`: imported boxes exist, but the reviewer has not saved a manual review edit yet
- importing boxes moves a video to `started`
- the first manual save moves `started` to `ready`
- importing new boxes over already reviewed or exported work resets the video to `started` until the next manual save

Progress bar means propagation completion only and shows only in `in_progress`.

Library cards must provide a way to open review. Current shipped UI uses whole-card click to open review, not a separate visible `Open Review` button.

Editing rule is strict:
- playback may run on main stage
- create, edit, delete, save, and SAM2 actions are paused-only on canonical current frame

Selected-object UI must expose object id or class, bbox, nullable confidence, and visible selected-range summary tiles `Manual`, `Missing`, and `Propagated`.

Visible summary meanings:
- `Manual`: distinct frames in the selected range whose persisted source is `manual` or `sam2_edited`
- `Missing`: total selected-range frames not covered by manual or propagated annotations
- `Propagated`: frames in the selected range with a propagated mask for the selected object

Backend and API contracts may still return richer review-summary fields such as `track_summary.frames` and `track_summary.corrected`; current product/UI truth is only that shipped inspector tiles show `Manual / Missing / Propagated`.

Confidence rule:
- numeric only for untouched SAM2-generated masks
- `null` for manual-only masks
- `null` after reviewer correction

## Observations
- [journey] Product flow is library select -> single review surface -> paused exact-frame edits -> propagation review -> export, with import planned as optional seed-data setup once unblocked #product #workflow
- [truth] Main stage plays video with overlayed annotations, but backend `frame_idx` remains canonical truth #frames #frontend
- [rule] Mutating actions are paused-only on canonical current frame #editing #sam2
- [library] Shipped library states are `not_started`, `in_progress`, `ready`, and `exported`; import-specific `started` remains planned with blocked import workflow #library #states
- [library] Progress bar means propagation completion only and appears only in `in_progress` #library #progress
- [library] Library cards open review through whole-card click in current shipped UI, not a separate visible CTA button #library #ux
- [inspector] Selected-object inspector shows bbox, nullable confidence, and visible `Manual / Missing / Propagated` summary tiles; backend may still expose richer counters behind that UI #inspector #ux
- [scope] V1 ships review, SAM2 assist, cleanup, persistence, and export in one local-first workflow; existing-box import remains planned but blocked scope #scope

## Relations
- relates_to [[Frontend Interaction Spec]]
- relates_to [[Architecture]]
- relates_to [[Delivery Plan and Risks]]
- depends_on [[Frame Indexing Contract]]
