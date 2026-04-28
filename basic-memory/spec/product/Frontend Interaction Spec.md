---
title: Frontend Interaction Spec
type: spec
canonical: true
domain: product
permalink: video-annotator/spec/product/frontend-interaction-spec
tags:
- spec
- product
- frontend
- ux
---

# Frontend Interaction Spec

Frontend has two screens: video library first, annotation screen second.

Video library comes first. It lists indexed videos with derived review state and a minimum card field set that is required, not optional.

Required library card fields:
- preview image
- display name
- state badge
- frame count
- FPS
- resolution
- last reviewed frame or `Not Started`
- one state detail line such as imported-box summary, mask or object summary, or export summary
- propagation progress only while state is `in_progress`
- review-open affordance; current shipped UI uses whole-card click instead of a separate visible `Open Review` button

Shipped library card states are `not_started`, `in_progress`, `ready`, and `exported`.

Shipped state meanings:
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

Progress bar is propagation-only and only visible while state is `in_progress`.

Annotation screen is a single review surface. No separate playback pane plus exact-frame pane. Main stage shows video playback with overlayed annotations. User can play from current frame onward for context, then pause to act on canonical current frame.

Editing model stays strict. Step, jump, seek, and pause must resolve to explicit backend frame identity. Draw, move, resize, delete, save, prompt-box, and propagation actions are paused-only. Browser time can help visual playback, but it never defines annotation truth.

Layout truth for annotation screen:
- left rail: navigation and object list
- main stage: video with overlayed annotations and top transport metadata
- bottom bar: transport, thumbnails or timeline, and range controls
- right inspector: selected-object details, box tools, mask tools, SAM2 controls, export actions

Selected-object inspector shows:
- object id or class
- bbox coordinates from current annotated box
- nullable mask confidence
- visible selected-range summary tiles: `Manual`, `Missing`, `Propagated`

Visible summary meanings:
- `Manual`: distinct frames in selected range whose persisted source is `manual` or `sam2_edited`
- `Missing`: total selected-range frames not covered by manual or propagated annotations
- `Propagated`: frames in the selected range with a propagated mask for the selected object

Backend response payloads may still include richer track-summary fields such as `frames` or `corrected`. Frontend durable truth for current shipped UI is only that visible inspector tiles read `Manual / Missing / Propagated`.

Confidence rule:
- present for untouched SAM2-generated mask
- `null` for manual-only rows
- `null` after reviewer correction

Export affordance is one `Export` action that creates one full-package zip.

## Observations
- [screen] Frontend flow is video library first, annotation screen second #frontend #navigation
- [library] Library cards have a required minimum metadata set, not vague optional copy #library #ux
- [library] Review-open affordance is required, but current shipped UI uses whole-card click rather than a separate visible button #library #ux
- [library] Shipped state model is `not_started`, `in_progress`, `ready`, and `exported`; import-specific `started` remains blocked planned truth #library #states
- [screen] Annotation UX uses one review surface with playback and overlays, not separate playback and exact-frame panes #frontend #ux
- [truth] Canonical backend frame identity still controls all mutating actions #frames #frontend
- [rule] Edit and SAM2 actions are paused-only #editing #sam2
- [inspector] Inspector exposes bbox, nullable confidence, and visible `Manual / Missing / Propagated` tiles; richer backend counters may still exist behind API payloads #inspector #ux
- [export] Current shipped export UX is one action for one full package, not selectable user-facing modes #export #ux

## Relations
- depends_on [[Frame Indexing Contract]]
- depends_on [[API]]
- relates_to [[Product Requirements]]
- relates_to [[Architecture]]
- relates_to [[Delivery Plan and Risks]]
