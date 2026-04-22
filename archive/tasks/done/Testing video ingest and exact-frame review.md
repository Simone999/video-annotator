---
id: task-testing-video-ingest-and-exact-frame-review
title: Testing video ingest and exact-frame review
status: done
completed: 2026-04-21
steps:
- creation
- planning
- execution
- wrap_up
tags:
- task
- testing
- backend
- frontend
- e2e
permalink: video-annotator/tasks/testing-video-ingest-and-exact-frame-review
---

## Creation Phase

### Description

Add durable backend and frontend test coverage for the video ingest and exact-frame review feature. Start from `[[Video Ingest and Exact-Frame Review]]`, carefully re-think backend integration, frontend integration, and browser E2E with the testing notes, and keep this task tied to the live exact-frame feature path rather than the new default mockup shell.

### Scope

- In scope: backend indexing and exact-frame retrieval coverage, frontend open or jump or step coverage, feature-note evidence updates, and honest manual execution records for the current shipped review flow
- Out of scope: new review UX, export work, SAM2 behavior, or any attempt to fake green coverage for decode and annotation-coupling gaps that are still unresolved

### Affected Features

- [[Video Ingest and Exact-Frame Review]]

### Testing Notes

- [[backend-api-integration-tests]]
- [[frontend-integration-tests]]
- [[e2e-tests]]

### Acceptance Criteria

- [x] Task note explicitly re-thinks backend integration vs frontend integration vs browser E2E with help from the testing notes before choosing coverage
- [x] Backend API integration covers startup indexing, deterministic video discovery, exact-frame fetch, and invalid-frame behavior based on real local review workflows
- [x] Frontend integration covers the live exact-frame feature path or dedicated harness, not the default mockup shell, for selecting a video, loading an exact frame, jump and step behavior, and playback-context separation from canonical frame truth
- [x] Browser E2E stays limited to optional smoke coverage when browser wiring itself is what needs proof
- [x] Missing or weak behaviors stay blocked or partial in the feature note instead of being represented as fake green coverage
- [x] Manual frontend checks are detailed enough that another operator can execute them without hidden context
- [x] `[[Video Ingest and Exact-Frame Review]]` is updated with new evidence links and honest execution status values

### Test Intent

- Backend: prove startup indexing, deterministic local discovery, exact-frame fetch, invalid-frame rejection, and decode-failure handling against real local media workflows; backend API integration is the main automated layer for canonical `frame_idx` truth and invalid-frame behavior
- Frontend: prove the reviewer can select a video, land on the canonical frame, jump, and step without drifting to browser-time truth; frontend integration is the main automated layer for the live review screen or dedicated harness, not the default mockup shell
- Manual: verify repeated frame stability, visible playback context, and failure handling that still needs a human eye; browser E2E stays optional smoke coverage only, not the default answer for this slice

### Definition of Done

- [x] Relevant backend tests pass
- [x] Relevant frontend tests pass
- [x] Feature note updated
- [x] Manual execution status recorded honestly
- [x] Docs or memory updated if behavior or contracts changed

## Planning Phase

### Planned Integration Tests

- Backend:
  - add `backend/tests/api/test_video_ingest_exact_frame.py` with one lifespan-driven startup indexing test that points `APP_DB_URL` at a temp sqlite file, points `VIDEO_SOURCE_DIR` at a temp video tree, stubs metadata extraction only, then proves `GET /api/videos` returns deterministic discovery order with stable ids across repeated startup
  - add one route test in the same file that uses the real FastAPI app boundary plus stubbed frame decode to prove `GET /api/videos/{video_id}/frame/{frame_idx}` returns `image/png` for an indexed frame and rejects out-of-range frame requests with the canonical backend message
- Frontend:
  - add `frontend/src/app/live-review-app.test.tsx` that renders `LiveReviewApp` with real `useVideoReviewWorkspace`, stubs `/api/videos`, `/api/videos/{id}`, `/api/videos/{id}/manifest`, `/api/videos/{id}/frame/{frame_idx}`, and `/api/videos/{id}/annotations/frame/{frame_idx}` at the request boundary, then proves select-video -> load exact frame -> next frame -> previous frame flow
  - keep assertions user-visible: selected video opens from library, `Canonical frame N` updates only after exact-frame load succeeds, and playback copy still states browser playback is contextual only while canonical frame truth comes from backend frame index state

### Planned E2E Tests

- Backend:
  - none; backend-owned truth is cheaper and clearer through FastAPI integration than browser E2E
- Frontend:
  - do not add committed browser E2E by default; live exact-frame path can be proven through frontend integration around `LiveReviewApp`
  - if browser smoke needs a browser entrypoint, add one tiny opt-in host adapter in `frontend/src/app/App.tsx` that mounts `LiveReviewApp` only when an explicit query param is present, then use that only for manual smoke and not as default host behavior

### Planned Implementation

- Step 1: move this task into real stage-2 shape, then add backend API integration tests first and run them to confirm current backend behavior or expose the smallest missing testability gap
- Step 2: add frontend integration around `LiveReviewApp`, using request-boundary stubs instead of shell fixtures or mocked hooks, and patch only the smallest harness/support code needed for a real screen test
- Step 3: run focused test commands, then repo-wide quality gates, then record exact evidence and any still-blocked browser/manual gaps in task and feature notes before Ralph bookkeeping

### Feature Matrix Updates

- Feature note updates needed before or during execution:
  - `[[Video Ingest and Exact-Frame Review]]` should record backend API integration as main automated proof for canonical frame indexing and invalid-frame behavior
  - `[[Video Ingest and Exact-Frame Review]]` should record frontend integration against `LiveReviewApp` or a dedicated harness rather than the default shell host
  - `[[Video Ingest and Exact-Frame Review]]` should keep browser smoke optional and call out any remaining live-review gaps honestly instead of implying full browser coverage

## Execution Phase

### Implementation Notes

- Re-read `[[backend-api-integration-tests]]`, `[[frontend-integration-tests]]`, and `[[e2e-tests]]` first so test-layer choice came from backend-vs-frontend ownership instead of old test inventory.
- Chose backend API integration for startup indexing, deterministic discovery, exact-frame PNG fetch, and invalid-frame rejection because backend owns canonical `frame_idx` truth and startup indexing side effects.
- Chose frontend integration for the live review path by rendering `frontend/src/app/live-review-app.tsx` with real `useVideoReviewWorkspace` and fake `/api` responses at request boundary; default shell stayed out of scope.
- Added one tiny opt-in host adapter in `frontend/src/app/App.tsx` so `?app=live-review` mounts `LiveReviewApp` for manual browser proof without changing the shell-first default host.
- Backend red test first failed because expected discovery order guessed root-level-first traversal; real contract is deterministic order by canonical `source_path`, so test was corrected to match backend truth instead of changing runtime behavior.
- First browser smoke attempt hit a stale local backend on `127.0.0.1:8000` that returned `500 Internal Server Error` from `/api/videos/{id}/manifest`; reran smoke against a fresh current-code backend on the same port and the live exact-frame flow passed.

## Wrap-Up Phase

### Verification

- Commands run:
  - `uv run --project backend pytest backend/tests/api/test_video_ingest_exact_frame.py`
  - `npm --workspace frontend run test -- src/app/App.test.tsx src/app/live-review-app.test.tsx`
  - `npm run lint`
  - `npm run typecheck`
  - `npm run test`
  - Browser verification:
    - fresh frontend dev server on `http://127.0.0.1:5175`
    - fresh backend dev server on `http://127.0.0.1:8000` with `APP_DB_URL=sqlite:////tmp/video-annotator-us007-browser.sqlite3` and `APP_MASKS_DIR=/tmp/video-annotator-us007-browser-masks`
    - Playwright smoke script opened `?app=live-review`, selected first indexed video, loaded frame `3`, stepped to frame `4`, stepped back to frame `3`, and saved `/tmp/us-007-live-review-harness.png`
- Results:
  - Focused backend API integration passed: 2 tests covering startup indexing, deterministic discovery, exact-frame PNG fetch, and invalid-frame rejection.
  - Focused frontend integration passed: 2 files, 4 tests covering default app routing and the live exact-frame harness flow.
  - Repo-wide `npm run lint`, `npm run typecheck`, and `npm run test` passed after the final import-order cleanup.
  - Manual browser smoke passed on the opt-in live-review harness against a fresh current-code backend and confirmed live selection plus canonical frame stepping.
  - Environment gotcha recorded honestly: an older backend already listening on `127.0.0.1:8000` returned `500` from `/manifest`; replacing it with a fresh current-code server removed the failure, so this task does not claim a current-code manifest bug.

### Final Summary

Added durable exact-frame proof at the right layers without touching the mockup shell path. Backend API integration now covers startup indexing, deterministic discovery, exact-frame PNG fetch, and invalid-frame rejection. Frontend integration now covers the real review workspace through `LiveReviewApp`, and an opt-in `?app=live-review` host switch gives manual browser proof without changing the shell-first default app entry.

### Completion Gate

- [x] Acceptance Criteria checkboxes updated to match reality
- [x] Definition of Done checkboxes updated to match reality
- [x] Only now may `status` change to `done`
