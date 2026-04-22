---
id: task-testing-annotation-foundation-and-manual-box-workflow
title: Testing annotation foundation and manual box workflow
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
- manual-box
permalink: video-annotator/tasks/testing-annotation-foundation-and-manual-box-workflow
---

## Creation Phase

### Description

Add durable backend and frontend test coverage for manifest-backed object identity and saved manual box CRUD. Start from `[[Annotation Foundation and Manual Box Workflow]]`, carefully re-think backend integration, frontend integration, and browser E2E with the testing notes, and keep this task tied to the live manual-box feature path rather than the new default mockup shell.

### Scope

- In scope: manifest read coverage, object create or select coverage, saved manual box draw or reload or edit or delete coverage, and feature-note evidence updates
- Out of scope: SAM2 masks, export or import behavior, speculative object-management UX, or generic endpoint tests without operator value

### Affected Features

- [[Annotation Foundation and Manual Box Workflow]]

### Testing Notes

- [[backend-api-integration-tests]]
- [[frontend-integration-tests]]
- [[e2e-tests]]

### Acceptance Criteria

- [x] Task note explicitly re-thinks backend integration vs frontend integration vs browser E2E with help from the testing notes before choosing coverage
- [x] Backend integration and e2e scenarios cover manifest reads, object creation, manual annotation upsert and delete, and reload behavior with manual rows using `mask: null`
- [x] Frontend integration and e2e scenarios cover the live manual-box feature path or dedicated harness for object panel create or select, draw-save-reload, move, resize, and delete of saved manual boxes
- [x] Edge cases are selected from real corruption risks such as wrong-video object IDs, invalid frame writes, and stale reload state rather than generic endpoint guessing
- [x] Manual frontend checks document exact setup and steps for create, draw, reload, edit, and delete flows
- [x] `[[Annotation Foundation and Manual Box Workflow]]` is updated with evidence links and honest execution status values

### Test Intent

- Backend: prove manifest-backed identity, object creation, manual-row persistence, `mask: null` reload semantics, and delete behavior on real persistence paths
- Frontend: prove reviewers can create or select an object, draw a box, reload it, move it, resize it, and delete it while staying manifest-backed
- Manual: verify drag precision, refresh or reopen persistence, and stale-state risks that automation may miss

### Definition of Done

- [x] Relevant backend tests pass
- [x] Relevant frontend tests pass
- [x] Feature note updated
- [x] Manual execution status recorded honestly
- [x] Docs or memory updated if behavior or contracts changed

## Planning Phase

### Planned Integration Tests

- Backend:
  - `backend/tests/api/test_annotation_foundation_manual_box.py`
  - prove manifest-backed object create, manual annotation upsert, reload with `mask: null`, update, and delete on real FastAPI plus SQLite wiring
  - cover corruption risks with wrong-video object ids and invalid frame writes
- Frontend:
  - `frontend/src/app/live-review-app.test.tsx`
  - use mutable `MSW` fixture state to prove live review app can create object, draw-save manual box, reload it, move it, resize it, and delete it without touching shell host

### Planned E2E Tests

- Backend:
  - none planned; backend-owned truth here is route, validation, and persistence, so backend API integration gives stronger and faster signal than browser E2E
- Frontend:
  - none planned by default; live manual-box path can be covered with real React plus fake HTTP boundary, then checked manually in browser for drag ergonomics

### Planned Implementation

- Step 1: write backend API integration tests first and run targeted `pytest` to capture real failures before any production edits
- Step 2: write live-review frontend integration test and run targeted `vitest` to capture manual-box workflow gaps before any production edits
- Step 3: apply smallest code fixes only if new tests expose real workflow breakage, then run manual browser smoke for create, draw, reload, edit, and delete
- Step 4: update feature and task notes with exact evidence, commands, and honest blocked or done status

### Feature Matrix Updates

- Feature note updates needed before or during execution:
  - replace placeholder integration and manual-test rows with manual-box-specific evidence
  - record why browser E2E stayed out of scope for this story

## Execution Phase

### Implementation Notes

- Chose backend API integration after re-reading `[[backend-api-integration-tests]]` because manual-row persistence, `mask: null` reload semantics, wrong-video object ownership, and invalid frame rejection are backend-owned truth.
- Chose frontend integration after re-reading `[[frontend-integration-tests]]` because live manual-box workflow value sits in real React state, pointer interactions, and visible saved-box results while backend can stay fake at HTTP layer.
- Did not choose new browser E2E after re-reading `[[e2e-tests]]` because lower layers can prove this workflow more directly; browser work here is manual smoke for drag ergonomics, not default automated coverage.
- Added `backend/tests/api/test_annotation_foundation_manual_box.py` to cover object create, manual upsert or reload or update or delete, and corruption risks for wrong-video object ids plus invalid frame writes on real FastAPI plus SQLite wiring.
- Expanded `frontend/src/app/live-review-app.test.tsx` with mutable `MSW` state so live review now proves create object, draw-save, reload, move, resize, and delete flows without touching shell fixtures.
- Tightened `frontend/src/features/video-review/exact-frame-canvas.tsx` so move and resize commits derive from final `pointerup` coordinates rather than depending only on the last prior `pointermove`.
- Manual browser smoke passed on `http://127.0.0.1:5174/?app=live-review` against clean `backend:dev:e2e` state using `smoke.mp4`, unique object label `crate-1776747627500`, and screenshot `/tmp/us-008-live-manual-box.png`.

## Wrap-Up Phase

### Verification

- Commands run:
  - `uv run --project backend pytest backend/tests/api/test_annotation_foundation_manual_box.py -q`
  - `npm --workspace frontend run test -- src/app/live-review-app.test.tsx`
  - `npm run lint`
  - `npm run typecheck`
  - `npm run test`
  - `npm run backend:dev:e2e`
  - `npm run frontend:dev:e2e`
  - one-off `node --input-type=module` Playwright smoke against `http://127.0.0.1:5174/?app=live-review`
- Results:
  - targeted backend integration: pass
  - targeted frontend integration: pass
  - repo `lint`: pass
  - repo `typecheck`: pass
  - repo `test`: pass
  - manual browser smoke: pass, screenshot `/tmp/us-008-live-manual-box.png`

### Final Summary

Added backend API integration proof for manual-box persistence and corruption-risk rejection, added live-review frontend integration proof for create/draw/reload/move/resize/delete, and recorded browser smoke evidence for the same flow on the real local stack.

### Completion Gate

- [x] Acceptance Criteria checkboxes updated to match reality
- [x] Definition of Done checkboxes updated to match reality
- [x] Only now may `status` change to `done`
