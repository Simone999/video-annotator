# Product Requirements Document

## Product name

Video Annotation Reviewer

## Problem

Existing tools are either too generic, unreliable for exact frame review, or too heavy for a narrow single-team workflow.

We need a focused local-first application that lets users:

- open a video library and select work
- import existing boxes as review starting point
- inspect videos precisely
- jump to exact frames
- review sparse annotations
- create and edit boxes and masks
- use SAM2 as a preliminary annotator
- export consistent machine-readable annotations

## Primary user

ML engineer or technical annotator reviewing model-assisted annotations on videos.

## Main user stories

1. As a user, I want to open a video and inspect its annotations.
2. As a user, I want to jump to an exact frame number.
3. As a user, I want to step frame-by-frame in both directions.
4. As a user, I want to open the library, choose a video, and enter review.
5. As a user, I want to import existing boxes as seed review data.
6. As a user, I want to draw a box on the paused canonical frame.
7. As a user, I want to generate a mask from SAM2 using that box.
8. As a user, I want to propagate that mask through a selected frame range.
9. As a user, I want to correct or delete bad masks.
10. As a user, I want to export the final annotations.

## In scope

- local-first single-user workflow
- video library entry screen
- import existing boxes from the current pipeline format
- exact frame retrieval
- one main review surface with playback and overlayed annotations
- box creation/editing/deletion
- mask display/editing/deletion
- SAM2 prompt and propagation
- export JSON + PNG masks

## Out of scope

- multi-user collaboration
- cloud deployment
- audit/review workflows
- authentication
- general-purpose annotation platform features
- large-scale workforce/task management

## Core product principle

The backend-decoded frame is the source of truth. Browser playback time never becomes annotation truth.

## Library state model

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

Progress bar rule:
- the library progress bar means propagation completion only
- it is visible only while state is `in_progress`

## Library card requirements

Each library card must show:
- preview image
- display name
- state badge
- frame count
- FPS
- resolution
- last reviewed frame or `Not Started`
- one state detail line such as imported boxes, mask or object summary, or export summary
- propagation progress only while state is `in_progress`
- `Open Review` action

## Selected-object inspector requirements

The selected-object inspector must show:
- object id or class
- bbox coordinates from the current annotated box
- nullable mask confidence
- selected-range counters `frames`, `propagated`, and `corrected`

Counter meanings:
- `frames`: total frames in the selected range
- `propagated`: frames in the selected range with a propagated mask for the selected object
- `corrected`: propagated masks in the selected range later fixed by the reviewer

Confidence rule:
- numeric value only for untouched SAM2-generated masks
- `null` for manual-only masks
- `null` after reviewer correction

## Success criteria

The user can:
- open the video library and choose work
- import existing boxes
- open a video
- jump to frame N
- step frame-by-frame reliably
- draw a box on the paused review frame
- obtain a SAM2 mask
- correct the mask
- propagate through a selected range
- export the result deterministically

## Non-goals

- build a general-purpose labeling suite
- support every annotation type
