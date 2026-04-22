---
title: Load selected-object summary
type: note
permalink: video-annotator/tasks/load-selected-object-summary
id: task-load-selected-object-summary
status: done
completed: 2026-04-22 03:13:18 CEST
steps:
- creation
- planning
- execution
- wrap_up
tags:
- task
- frontend
- review
- m-2
- summary
- inspector
---

# Load selected-object summary

## Creation Phase

### Description

Add typed selected-object summary client and live review fetch flow so inspector can read backend bbox, confidence, and counter truth.

Read first:
- [[Workflow]]
- [[Video Ingest and Exact-Frame Review]]
- [[SAM2 Shell and Runtime]]
- [[API]]
- `docs/spec.md`
- `docs/product/prd.md`
- `backend/app/api/videos.py`
- `frontend/src/features/video-review/api.ts`
- `frontend/src/features/video-review/workspace.ts`
- `frontend/src/features/video-review/hooks/use-live-review-controller.ts`

Stage-2 rule: in planning phase, write concrete test plan and implementation plan first. In execution, follow written plan. Before `done`, run own review plus 2 subagent reviews and fix actionable findings.

### Scope

- In scope: typed client, parser, request lifecycle, reload triggers from object/frame/range state, and honest null handling
- Out of scope: summary field rendering polish or backend contract changes

### Affected Features

- [[Video Ingest and Exact-Frame Review]]
- [[SAM2 Shell and Runtime]]

### Acceptance Criteria

- [x] Frontend has typed client support for selected-object summary route
- [x] Live review fetches summary from current object, frame, and selected range instead of local guesses
- [x] Null confidence and null corrected-count values stay honest in state handling

### Test Intent

- Backend: none; route already exists
- Frontend: unit or integration coverage for client parsing and summary fetch lifecycle
- Manual: none in this slice

### Definition of Done

- [x] Planning phase records concrete tests and implementation plan before code
- [x] Own review plus 2 subagent reviews are recorded and actionable findings are fixed
- [x] Relevant tests and quality checks pass
- [x] Feature notes, task note, and routing indexes are updated honestly when truth changes

## Planning Phase

### Planned Integration Tests

- Extend `frontend/tests/integration/video-review/live-review-screen.test.tsx` with one failing story that records selected-object summary requests and proves reloads on object, frame, and current range inputs.

### Planned Unit Tests

- Extend `frontend/tests/unit/video-review/api.test.ts` with one parser test for the selected-object summary response shape plus one malformed-payload rejection.

### Planned E2E Tests

- None in this slice. Browser rendering stays for the next inspector task.

### Planned Implementation

- Add typed selected-object summary response types and a parser plus request helper in `frontend/src/features/video-review/api.ts`.
- Add controller-local summary request state in `frontend/src/features/video-review/hooks/use-live-review-controller.ts`.
- Derive current selected summary range from existing propagation inputs for now so the fetch can respond to current object, current frame, and current propagation range state before explicit selected-range state lands.
- Keep null confidence and null corrected count untouched in returned state. Do not render them yet in this task.

### Feature Matrix Updates

- Update `[[SAM2 Shell and Runtime]]` after implementation so pending summary rendering stays distinct from shipped summary fetch lifecycle.

## Execution Phase

### Implementation Notes

- Added typed selected-object summary types, request helper, and parser in `frontend/src/features/video-review/api.ts`.
- Added controller-local selected-object summary request state in `frontend/src/features/video-review/hooks/use-live-review-controller.ts` with stale-request protection through a request-id ref.
- Summary fetch now reloads from current selected object, canonical frame, and the current propagation-direction plus end-frame inputs.
- Current selected range is derived temporarily from propagation inputs until explicit selected-range state lands in the next task. Forward uses `current -> end`, backward uses `end -> current`, and `both` widens to `0 -> max(current, end)`.
- Null `mask_confidence` and null `track_summary.corrected` stay untouched in fetched state; this task does not render them yet.

## Wrap-Up Phase

### Verification

- Commands run:
- `npm --workspace frontend run test -- tests/unit/video-review/api.test.ts`
- `npm --workspace frontend run test -- tests/integration/video-review/live-review-screen.test.tsx`
- `npm run lint`
- `npm run typecheck`
- Results:
- Unit API tests pass, including selected-object summary parsing and malformed-payload rejection.
- Live review integration tests pass, including summary reloads across object, frame, and current range changes.
- `npm run lint` passes.
- `npm run typecheck` passes.
- Fresh tracker-repair verification on 2026-04-22 reran `npm --workspace frontend exec vitest run tests/unit/video-review/api.test.ts --coverage.enabled=false`, `npm --workspace frontend exec vitest run tests/integration/video-review/live-review-screen.test.tsx --coverage.enabled=false`, `npm run lint`, `npm run typecheck`, and `npm run test`.
- Fresh browser smoke on 2026-04-22 used `npm run backend:bootstrap:e2e`, `npm run backend:seed:e2e:review-navigation`, fresh `npm run backend:dev:e2e` on `127.0.0.1:8000`, `FRONTEND_E2E_PORT=3100 npm run frontend:dev:e2e`, and `dev-browser --browser us018-summary --headless` to prove selected-object summary requests reload from canonical frame `7` to `8` and selected range `7-199` to `3-7` to `3-8`; screenshot `/home/simone/.dev-browser/tmp/us018-selected-object-summary-browser.png`.
- Own review caught one lifecycle edge: frame navigation was resetting propagation end frame back to default and triggering a stale summary request. Added a failing integration assertion for the unwanted reset request, then fixed the reset.
- Subagent spec review approved the task scope after implementation.
- Subagent quality review found the range-reset-on-frame-change bug; follow-up re-review approved after the fix and stronger integration coverage.

### Final Summary

- Frontend now has typed selected-object summary client support and a live review fetch lifecycle.
- Summary requests now follow current object, frame, and current propagation-range inputs without rendering fake values yet.
- Inspector rendering remains the next task.

### Completion Gate

- [x] Acceptance Criteria checkboxes updated to match reality
- [x] Definition of Done checkboxes updated to match reality
- [x] Only now may `status` change to `done`
