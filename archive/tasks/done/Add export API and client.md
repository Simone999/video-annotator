---
title: Add export API and client
type: note
permalink: video-annotator/tasks/add-export-api-and-client
id: task-add-export-api-and-client
status: done
completed:
steps:
- creation
- planning
- execution
- wrap_up
tags:
- task
- backend
- frontend
- export
- m-5
- api
---

# Add export API and client

## Creation Phase

### Description

Add export create/download API routes and typed frontend client support.

Read first:
- [[Workflow]]
- [[Export]]
- [[Export API]]
- [[Export Format]]
- `docs/spec.md`
- `backend/app/api/videos.py`
- `backend/app/services/exports.py`
- `frontend/src/features/video-review/api.ts`

### Scope

- In scope: export create route, download route, typed client support, and explicit error handling
- Out of scope: live export UI or library state rendering

### Affected Features

- [[Export]]

### Acceptance Criteria

- [x] Backend exposes export create and download routes for deterministic artifacts
- [x] Frontend has typed client support for export create/download flow
- [x] Tests prove route behavior and client parsing

### Test Intent

- Backend: route tests for create/download success and not-found mapping
- Frontend: unit coverage for export create parsing and download URL building
- Manual: none in this slice; no user-visible UI yet

### Definition of Done

- [x] Planning phase records concrete tests and implementation plan before code
- [x] Relevant tests and quality checks pass
- [x] Feature notes, task note, and routing indexes are updated honestly when truth changes

## Planning Phase

### Planned Integration Tests

- Backend integration test in `backend/tests/integration/api/test_export_api.py` for:
  - create success serializes stable `export_id`
  - create persists export snapshot and deterministic zip contents
  - create maps unknown video to `404`
  - download streams `application/zip`
  - download maps unknown export id to `404`
- Frontend unit test in `frontend/tests/unit/video-review/api.test.ts` for:
  - create request serializes options and parses typed response
  - download helper returns stable API URL from `export_id`

### Planned E2E Tests

- None. Story does not change visible browser UI.

### Planned Implementation

- Add export request or response schemas in backend video schema module
- Extend export service with artifact creation or lookup helpers and explicit not-found errors
- Add `POST /api/videos/{video_id}/export` and `GET /api/exports/{export_id}` routes
- Add typed export client functions to `frontend/src/features/video-review/api.ts`
- Update feature or API docs if route contract truth changes

### Feature Matrix Updates

- `[[Export]]` verification strategy should mention route-level proof once tests land
- `[[Export API]]` should record response payload and route behavior if implementation adds concrete response fields

## Execution Phase

### Implementation Notes

- Added backend export-create route on `/api/videos/{video_id}/export` and dedicated download route on `/api/exports/{export_id}`.
- Added export service helpers to persist `ExportRecord`, write zip artifacts under configured exports dir, and resolve artifact paths by stable `export_id`.
- Added typed frontend `createVideoExport` and `getExportDownloadUrl` helpers in review API client.
- Kept route validation explicit: current backend supports honest export pairs only for PNG masks or boxes-only output.

## Wrap-Up Phase

### Verification

- Commands run:
- `uv run --project backend pytest backend/tests/integration/api/test_export_api.py -q`
- `npm --workspace frontend exec vitest run tests/unit/video-review/api.test.ts`
- `uv run --project backend pytest backend/tests/unit/services/test_exports.py backend/tests/integration/api/test_export_api.py -q`
- `npm run typecheck`
- `npm run lint`
- Results:
- Backend export route shard passed.
- Frontend export client shard passed.
- Focused backend export service plus route shard passed.
- Repo typecheck passed.
- Repo lint passed.
- Browser verification not applicable in this slice because no visible UI changed; later export UI story still needs real browser proof.

### Final Summary

- Shipped route-level export create/download flow plus typed frontend client support without pulling in review or library UI early.
- Durable export docs now describe `export_id` response shape and honest option combinations for current backend artifact writer.

### Completion Gate

- [x] Acceptance Criteria checkboxes updated to match reality
- [x] Definition of Done checkboxes updated to match reality
- [x] Only now may `status` change to `done`
