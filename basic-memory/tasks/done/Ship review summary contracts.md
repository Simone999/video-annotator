---
id: task-ship-review-summary-contracts
title: Ship review summary contracts
status: done
completed: 2026-04-21
steps:
- creation
- planning
- execution
- wrap_up
tags:
- task
- backend
- api
- review
- frontend
permalink: video-annotator/tasks/ship-review-summary-contracts
---

## Creation Phase

### Description

Add backend-derived summary contracts that let live library cards and live review inspector show honest persisted review state instead of fixture-only copy. Start from `backend/app/api/videos.py`, `backend/app/schemas/video.py`, and existing annotation storage truth before any frontend rewiring.

### Scope

- In scope: library-card summary fields, derived review state, last-reviewed or annotated summary fields, selected-object summary data needed for inspector counters or confidence display, and backend tests for those payloads
- Out of scope: replacing shell fixtures in the default app host, rebuilding the live review layout, shipping export artifacts, or adding keyboard controls

### Affected Features

- [[Review Workspace Ergonomics]]
- [[Video Ingest and Exact-Frame Review]]
- [[Annotation Foundation and Manual Box Workflow]]

### Acceptance Criteria

- [x] Backend exposes derived summary fields needed to drive live library cards from persisted review facts instead of fixtures
- [x] Backend exposes selected-object summary fields needed for live inspector range counters or explicitly documents the smallest additional route that owns them
- [x] State derivation stays honest about unshipped export behavior instead of inventing fake runtime truth
- [x] Backend integration tests cover the new summary behavior

### Test Intent

- Backend: prove derived review summary payloads from real persisted rows and exact frame or annotation state
- Frontend: none in this task; frontend wiring belongs to follow-up tasks
- Manual: inspect returned payloads and confirm they match existing persisted review facts

### Definition of Done

- [x] Relevant backend tests pass
- [x] Memory updated if contract truth changes
- [x] Supporting docs updated if API contract changes
- [x] Verification recorded honestly

## Planning Phase

### Planned Integration Tests

- Backend:
  - `backend/tests/api/test_review_summary_contracts.py`
  - prove `GET /api/videos` and `GET /api/videos/{video_id}` derive honest library review summary fields from persisted annotations plus active propagation jobs
  - prove `GET /api/videos/{video_id}/objects/{object_id}/summary` returns frame-scoped bbox plus range-scoped counters from persisted rows, while keeping unpersisted confidence or corrected history as honest `null`
  - cover honest edge rules: no export truth invented, no active object summary for wrong video, and empty current-frame box display returns `null` bbox while counters still work
- Frontend:
  - none in this task; backend-only contract work

### Planned E2E Tests

- Backend:
  - none planned; contract truth sits at FastAPI plus SQLite boundary, so backend API integration is stronger than browser E2E here
- Frontend:
  - none planned; shell or live UI wiring belongs to follow-up tasks after contract lands

### Planned Implementation

- Step 1: write failing backend API integration tests for list/detail summary fields and selected-object summary route, then run targeted `pytest`
- Step 2: add one backend review-summary service plus typed schemas and route wiring with no frontend changes
- Step 3: keep state derivation honest by limiting runtime states to facts current storage can prove; do not manufacture `exported` until export persistence exists
- Step 4: update feature note, task note, API docs, data-model docs, architecture docs, and Ralph tracking after verification

### Feature Matrix Updates

- Feature note updates needed before or during execution:
  - record that backend now ships review summary contracts for live library and selected-object inspector
  - keep live library wiring and single-stage review as separate follow-up tasks

## Execution Phase

### Implementation Notes

- Chose backend API integration after re-reading `[[backend-api-integration-tests]]` because live library status, summary counters, and selected-object inspector payloads are backend-owned truth at FastAPI plus SQLite boundary.
- Added `backend/tests/api/test_review_summary_contracts.py` first and watched it fail on missing `review_state` fields and missing selected-object summary route before production edits.
- Added `backend/app/services/review_summaries.py` as one dedicated read-model seam for derived library state, propagation percent, review summary facts, and selected-object summary queries.
- Wired `backend/app/api/videos.py` to use review-summary records for list, detail, and manifest payloads, and added `GET /api/videos/{video_id}/objects/{object_id}/summary` for live inspector wiring.
- Kept state derivation honest: runtime can emit `not_started`, `started`, `in_progress`, and `ready` from persisted annotation sources plus active `sam2_propagation` jobs, but it does not emit `exported` because export completion is still not persisted.
- Recorded the smallest honest inspector split in docs and memory: `mask_confidence` and `track_summary.corrected` ship as `null` until confidence metadata and reviewer-correction provenance are persisted.

## Wrap-Up Phase

### Verification

- Commands run:
  - `uv run --project backend pytest backend/tests/api/test_review_summary_contracts.py -q`
  - `uv run --project backend pyright`
  - `uv run --project backend pytest backend/tests/api -q`
  - `npm run lint`
  - `npm run typecheck`
  - `npm run test`
- Results:
  - targeted review-summary backend integration: pass
  - backend `pyright`: pass
  - backend API suite: pass
  - repo `lint`: pass
  - repo `typecheck`: pass
  - repo `test`: pass (`14` backend tests, `27` frontend tests)

### Final Summary

Added backend-derived review summary contracts for video list, detail, and manifest payloads, added a selected-object summary route for live inspector wiring, and documented the honest runtime limits around missing export facts, missing confidence persistence, and missing correction provenance.

### Completion Gate

- [x] Acceptance Criteria checkboxes updated to match reality
- [x] Definition of Done checkboxes updated to match reality
- [x] Only now may `status` change to `done`
