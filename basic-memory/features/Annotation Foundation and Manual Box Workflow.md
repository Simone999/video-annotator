---
title: Annotation Foundation and Manual Box Workflow
type: note
permalink: video-annotator/features/annotation-foundation-and-manual-box-workflow
tags:
- feature
- annotation
- objects
- manual-box
---

# Annotation Foundation and Manual Box Workflow

This feature owns stable object identity, manifest-backed selection, and persisted manual box CRUD on canonical backend frames.

## Summary

- Goal: let a reviewer create or select one persisted object and manage one saved manual box on frame `N`
- Primary users: reviewers doing exact-frame box correction before or without SAM2
- Owning task note: [[Testing annotation foundation and manual box workflow]]

## Scope

- In scope:
  - manifest read with object summary plus frame markers
  - stable object identity per video
  - object create from UI
  - manual frame annotation read, upsert, and delete
  - draw, reload, move, resize, and delete saved manual boxes
  - manual rows reopening with `mask: null`
- Out of scope:
  - mask brush editing
  - object visibility, lock, delete-whole-track, or richer panel controls
  - import and export behavior

## Current State

- Shipped behavior: manifest read, object create, manual annotation read, manual upsert, current-frame delete, manifest-backed object selection, and saved-box reload all ship on the core happy path.
- Known gaps: wrong-video object ids, out-of-range writes, and missing-row deletes remain less defined than the main flow.
- Current blockers: none beyond the remaining edge-case gaps.

## Target Behavior

- Reviewer opens a video, creates or selects an object, draws a box on frame `N`, reloads, still sees it, edits it, and deletes it without losing canonical frame identity.
- Object identity comes from backend persistence and manifest state, not local temp IDs or text inputs.
- Manual rows remain visible and editable even when no mask exists yet.

## Contracts and Dependencies

- Backend contracts:
  - `GET /api/videos/{video_id}/manifest`
  - `POST /api/videos/{video_id}/objects`
  - `GET /api/videos/{video_id}/annotations/frame/{frame_idx}`
  - `PUT /api/videos/{video_id}/annotations/frame/{frame_idx}`
  - `DELETE /api/videos/{video_id}/annotations/frame/{frame_idx}/object/{object_id}`
- Frontend contracts:
  - object selection stays manifest-backed
  - saved manual boxes are stored separately from generic frame annotations
  - manual rows from reload must use `mask: null`
- Data or storage contracts:
  - `ObjectTrack` persists stable `id`, `video_id`, `label`, `color`, and `status`
  - manual writes upsert one row by `(video_id, frame_idx, object_id)` with `source = manual`
- External dependencies:
  - manifest data must load with video selection
  - exact-frame view must already work

## Evidence

- Specs:
  - [[Product Requirements]]
  - [[Frontend Interaction Spec]]
  - [[API]]
  - [[Data Model]]
- Milestone notes:
  - [[m-1: Annotation Foundation]]
- Code or test evidence:
  - concrete implementation and verification inventory intentionally lives in task notes and testing guidance, not in this feature note

## Linked Tasks

- [[Testing annotation foundation and manual box workflow]]

## Integration Tests

| ID | Surface | Scenario | Real-World Why | Setup/Fixtures | Automation Status | Evidence |
| --- | --- | --- | --- | --- | --- | --- |
| INT-001 | backend | Example integration scenario | Why operator or system cares | Fixtures or stack setup | planned | Link or note |
| INT-002 | frontend | Example integration scenario | Why operator or system cares | Fixtures or stack setup | planned | Link or note |

## E2E Tests

| ID | Scenario | Real-World Workflow | Environment | Automation Status | Evidence |
| --- | --- | --- | --- | --- | --- |
| E2E-001 | Example e2e scenario | Real workflow or failure path | Local stack or fixture env | planned | Link or note |

## Manual Tests

Use exact execution status values only:
- `✅ Done`
- `⚠️ Partially`
- `❌ Not Done`

| ID | Scenario | Setup | Steps | Expected Result | Execution Status | Execution Notes |
| --- | --- | --- | --- | --- | --- | --- |
| MAN-001 | Example manual scenario | Required environment | Concrete steps | What operator should see | ❌ Not Done | Write why and what is missing |

## Observations

- [status] Manifest-backed object identity and manual box CRUD ship on the core happy path.
- [pattern] Manual rows with `mask: null` are critical for saved-box reload and editability.
- [risk] Wrong-video object ids, out-of-range writes, and missing-row deletes remain less defined than the main happy path.
- [retrieval] Use this note for object panel, manifest-backed selection, manual box CRUD, or saved manual reload queries.

## Relations

- relates_to [[Repo Current State and Feature Matrix]]
- relates_to [[m-1: Annotation Foundation]]
- relates_to [[Frontend annotation foundation client and state pattern]]
- relates_to [[Manual frame annotation route pattern]]
- relates_to [[API]]
- relates_to [[Data Model]]
