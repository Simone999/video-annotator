# Product Requirements Document

## Product name

Video Annotation Reviewer

## Problem

Existing tools are either too generic, unreliable for exact frame review, or too heavy for a narrow single-team workflow.

We need a focused local-first application that lets users:

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
4. As a user, I want to draw a box on a frame.
5. As a user, I want to generate a mask from SAM2 using that box.
6. As a user, I want to propagate that mask through a selected frame range.
7. As a user, I want to correct or delete bad masks.
8. As a user, I want to export the final annotations.

## In scope

- local-first single-user workflow
- exact frame retrieval
- video playback pane
- frame-accurate annotation pane
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

The backend-decoded frame is the source of truth.

## Success criteria

The user can:
- open a video
- jump to frame N
- step frame-by-frame reliably
- draw a box
- obtain a SAM2 mask
- correct the mask
- propagate through a selected range
- export the result deterministically

## Non-goals

- build a general-purpose labeling suite
- support every annotation type