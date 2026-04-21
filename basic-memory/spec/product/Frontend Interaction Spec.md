---
title: Frontend Interaction Spec
type: note
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
- `Open Review` action

Library card states are `not_started`, `started`, `in_progress`, `ready`, and `exported`.

State meanings:
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
- track summary for selected range: `frames`, `propagated`, `corrected`

Counter meanings:
- `frames`: total frames in the selected range
- `propagated`: frames in the selected range with a propagated mask for the selected object
- `corrected`: propagated masks in the selected range later fixed by the reviewer

Confidence rule:
- present for untouched SAM2-generated mask
- `null` for manual-only rows
- `null` after reviewer correction

## Observations
- [screen] Frontend flow is video library first, annotation screen second #frontend #navigation
- [library] Library cards have a required minimum metadata set, not vague optional copy #library #ux
- [library] State model and transitions are product-facing requirements, not hidden engineering detail #library #states
- [screen] Annotation UX uses one review surface with playback and overlays, not separate playback and exact-frame panes #frontend #ux
- [truth] Canonical backend frame identity still controls all mutating actions #frames #frontend
- [rule] Edit and SAM2 actions are paused-only #editing #sam2
- [inspector] Inspector exposes bbox, nullable confidence, and selected-range counters with defined semantics #inspector #ux

## Relations
- depends_on [[Frame Indexing Contract]]
- depends_on [[API]]
- relates_to [[Product Requirements]]
- relates_to [[Architecture]]
- relates_to [[Delivery Plan and Risks]]