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

- Shipped behavior: manifest read, object create, manual annotation read, manual upsert, current-frame delete, manifest-backed object selection, saved-box reload, and saved-box move or resize all ship on the live review path.
- Known gaps: no automated browser E2E is kept for this workflow because backend and frontend integration cover the durable truth more directly; drag ergonomics stay verified by manual browser smoke.
- Current blockers: none.

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
| INT-001 | backend | Create object, upsert manual row, reload it with `mask: null`, update it, delete it, and reject wrong-video object ids or invalid frame writes | Freezes canonical persistence truth so saved manual boxes cannot silently drift across videos or frames | Real FastAPI app, temp SQLite DB, temp indexed video stubs, fixed metadata inspector | automated | `backend/tests/api/test_annotation_foundation_manual_box.py` |
| INT-002 | frontend | Create object, draw-save manual box, reload it, move it, resize it, and delete it in `LiveReviewApp` with mutable request-boundary state | Proves live review UI keeps manifest-backed selection and saved-box editing coherent without default shell shortcuts | `MSW` mutable fixture store in `frontend/src/app/live-review-app.test.tsx` | automated | `frontend/src/app/live-review-app.test.tsx` |

## E2E Tests

| ID | Scenario | Real-World Workflow | Environment | Automation Status | Evidence |
| --- | --- | --- | --- | --- | --- |
| E2E-001 | No new automated browser E2E for manual box CRUD | Lower layers already prove backend truth and live review UI state transitions; browser drag proof stays manual for this story | local stack only when smoke-checking `?app=live-review` | not planned | manual smoke artifact `/tmp/us-008-live-manual-box.png` plus owning task note rationale |

## Manual Tests

Use exact execution status values only:
- `✅ Done`
- `⚠️ Partially`
- `❌ Not Done`

| ID | Scenario | Setup | Steps | Expected Result | Execution Status | Execution Notes |
| --- | --- | --- | --- | --- | --- | --- |
| MAN-001 | Create, draw, reload, edit, and delete one saved manual box in live review | Run `npm run backend:dev:e2e` and `npm run frontend:dev:e2e`, open `http://127.0.0.1:5174/?app=live-review`, choose `smoke.mp4`, create unique object label, load frame `7` | Draw one box on exact frame, reload frame, move box, resize box, reload frame again, delete saved box, reload once more | Saved manual box appears after draw, persists after reload, changes position and size after edit, then stays gone after delete and reload | ✅ Done | One-off Playwright browser smoke passed on 2026-04-21; screenshot `/tmp/us-008-live-manual-box.png` |

## Observations

- [status] Backend and frontend integration now cover object create, manual row reload with `mask: null`, saved-box move or resize, delete, wrong-video object ids, and invalid frame writes.
- [pattern] Manual rows with `mask: null` are critical for saved-box reload and editability.
- [pattern] Re-query the live-review exact-frame canvas after `Load frame` in DOM or browser tests because reload can remount the canvas node.
- [guardrail] Manual-box transforms should commit from final pointer coordinates, not only the last prior move event.
- [retrieval] Use this note for object panel, manifest-backed selection, manual box CRUD, or saved manual reload queries.

## Relations

- relates_to [[Repo Current State and Feature Matrix]]
- relates_to [[m-1: Annotation Foundation]]
- relates_to [[Annotation Foundation Persistence Patterns]]
- relates_to [[API]]
- relates_to [[Data Model]]
