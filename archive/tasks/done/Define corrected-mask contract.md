---
title: Define corrected-mask contract
type: note
permalink: video-annotator/tasks/define-corrected-mask-contract
id: task-define-corrected-mask-contract
status: done
completed: 2026-04-23
steps:
- creation
- planning
- execution
- wrap_up
tags:
- task
- backend
- frontend
- m-4
- mask-editing
---

# Define corrected-mask contract

## Creation Phase

### Description

Define corrected-mask persistence and refine contract before code so mask editing work does not invent storage or summary semantics mid-flight.

Read first:
- [[Workflow]]
- [[Mask Editing and Cleanup]]
- [[SAM2 Shell and Runtime]]
- [[SAM2 API]]
- [[Data Model]]
- `docs/spec.md`
- `docs/product/prd.md`
- `backend/app/db/models.py`
- `backend/app/schemas/video.py`

Stage-2 rule: in planning phase, write concrete test plan and implementation plan first. In execution, follow written plan.

### Scope

- In scope: storage semantics, source semantics, confidence-reset rule, summary-reset rule, and route shape for refine work
- Out of scope: full backend implementation or frontend brush UI

### Affected Features

- [[Mask Editing and Cleanup]]
- [[SAM2 Shell and Runtime]]

### Acceptance Criteria

- [x] Corrected-mask source, confidence reset, and summary-reset rules are explicit before implementation starts
- [x] Refine route shape and reopen expectations are written down in code-facing docs or memory
- [x] Later m-4 tasks can implement without guessing persistence semantics

### Test Intent

- Backend: define failing tests to lock corrected-mask summary and confidence behavior before refine backend lands
- Frontend: define UI-facing test targets for refine and cleanup flows before code
- Manual: none in this slice

### Definition of Done

- [x] Planning phase records concrete tests and implementation plan before code
- [x] Own review is recorded; extra subagent reviews were not run because this session did not have explicit delegation approval
- [x] Relevant tests and quality checks pass
- [x] Feature notes, task note, and routing indexes are updated honestly when truth changes

## Planning Phase

### Planned Integration Tests

- Backend:
  - extend `backend/tests/integration/api/test_review_summary_contracts.py` so selected-object summary returns numeric `track_summary.corrected` once corrected-row provenance is defined
  - seed one corrected propagated row with `source = "sam2_edited"` and `is_keyframe = False`; expect `track_summary.propagated` to exclude it, `track_summary.corrected` to include it, and current-frame `mask_confidence` to stay `null`
  - seed one corrected keyframe with `source = "sam2_edited"` and `is_keyframe = True`; expect it not to increment `track_summary.corrected`
- Frontend:
  - no new frontend integration file in this contract slice; later refine UI work should mock summary responses with numeric corrected counts and null confidence for corrected rows

### Planned E2E Tests

- Backend:
  - none; API integration is enough for this contract slice
- Frontend:
  - no browser requirement in this task because no shipped UI behavior changes beyond backend summary truth; later refine UI task owns browser proof

### Planned Implementation

- Step 1: move task into `in_progress` and create active plan note so staged workflow is explicit
- Step 2: write red backend contract tests around corrected propagated rows and corrected keyframes in selected-object summary
- Step 3: implement minimal backend summary logic and schema or docs changes needed for those tests
- Step 4: update durable notes and supporting docs with corrected source semantics, confidence reset rules, summary reset rules, and refine-route request or response shape
- Step 5: run targeted backend tests plus repo quality gates, then finish Ralph tracking and commit if green

### Feature Matrix Updates

- Feature note updates completed:
  - `[[Mask Editing and Cleanup]]` now names `sam2_edited` reopen semantics and summary-count rule
  - `[[SAM2 Shell and Runtime]]` now reflects corrected-summary derivation from persisted non-keyframe corrected rows
  - `[[SAM2 API]]`, `[[Videos API]]`, and `[[Data Model]]` now define refine-route target shape and corrected-row persistence semantics

## Execution Phase

### Implementation Notes

- Session started on 2026-04-23 for Ralph `US-029`.
- Existing code already reserved `sam2_edited` in summary-service constants and docs source enum list, but selected-object summary still hardcoded `corrected = null`.
- Wrote failing backend API integration test first for three rules:
  - corrected propagated rows use `source = "sam2_edited"` and increment `track_summary.corrected`
  - corrected rows keep `mask_confidence = null`
  - corrected keyframes do not increment `track_summary.corrected`
- Minimal backend fix changed selected-object summary to count non-keyframe `sam2_edited` rows and return numeric corrected counts.
- Repo quality run exposed unrelated branch drift: six committed `docs/ui/*.png` screenshot artifacts were missing, so I regenerated the exact files using the previously documented Playwright capture commands before rerunning full tests.
- Added one reusable repo rule to `AGENTS.md` so later m-4 tasks do not re-derive corrected summary semantics.

## Wrap-Up Phase

### Verification

- Commands run:
- `uv run --project backend pytest backend/tests/integration/api/test_review_summary_contracts.py::test_selected_object_summary_route_returns_bbox_confidence_and_corrected_range_counters -q`
- `uv run --project backend pytest backend/tests/integration/api/test_review_summary_contracts.py backend/tests/unit/api/test_videos_routes.py -q`
- `npm run typecheck`
- `npm run lint`
- `./node_modules/.bin/playwright screenshot --full-page --viewport-size=1440,1100 --color-scheme=dark http://127.0.0.1:3001/missing-route docs/ui/not-found-route.png`
- `./node_modules/.bin/playwright screenshot --full-page --viewport-size=1440,1100 --color-scheme=dark --wait-for-selector "main.route-status-screen" --wait-for-timeout 2000 "http://127.0.0.1:6006/iframe.html?id=video-library-videolibrarystatuspanel--loading&viewMode=story" docs/ui/video-library-status-loading.png`
- `./node_modules/.bin/playwright screenshot --full-page --viewport-size=1440,1100 --color-scheme=dark --wait-for-selector "main.route-status-screen" --wait-for-timeout 2000 "http://127.0.0.1:6006/iframe.html?id=video-library-videolibrarystatuspanel--error&viewMode=story" docs/ui/video-library-status-error.png`
- `./node_modules/.bin/playwright screenshot --full-page --viewport-size=1440,1100 --color-scheme=dark --wait-for-selector "main.route-status-screen" --wait-for-timeout 2000 "http://127.0.0.1:6006/iframe.html?id=video-review-reviewroutestatuspanel--loading&viewMode=story" docs/ui/review-route-status-loading.png`
- `./node_modules/.bin/playwright screenshot --full-page --viewport-size=1440,1100 --color-scheme=dark --wait-for-selector "main.route-status-screen" --wait-for-timeout 2000 "http://127.0.0.1:6006/iframe.html?id=video-review-reviewroutestatuspanel--unavailable&viewMode=story" docs/ui/review-route-status-error.png`
- `./node_modules/.bin/playwright screenshot --full-page --viewport-size=1440,1100 --color-scheme=dark --wait-for-selector "[aria-label='Exact frame canvas']" --wait-for-timeout 2000 "http://127.0.0.1:6006/iframe.html?id=video-review-exactframecanvas--selected-annotation&viewMode=story" docs/ui/exact-frame-canvas.png`
- `file docs/ui/not-found-route.png docs/ui/video-library-status-loading.png docs/ui/video-library-status-error.png docs/ui/review-route-status-loading.png docs/ui/review-route-status-error.png docs/ui/exact-frame-canvas.png`
- `npm run test`
- `git diff --check`
- Results:
- red backend test failed first on `track_summary.corrected` because service still returned `None`
- targeted backend reruns passed
- `npm run typecheck` passed
- `npm run lint` passed
- regenerated screenshot artifacts are valid `1440 x 1100` PNG files
- `npm run test` passed with backend `126 passed`, frontend `134 passed`, backend coverage gate `98.27%` statements and `92.81%` branches
- `git diff --check` passed

### Final Summary

Defined corrected-mask contract around existing `source = "sam2_edited"` provenance, shipped numeric selected-summary corrected counts for non-keyframe corrected rows, and synced durable notes plus supporting docs so later refine or cleanup tasks can implement against one explicit storage and API contract.

### Completion Gate

- [x] Acceptance Criteria checkboxes updated to match reality
- [x] Definition of Done checkboxes updated to match reality
- [x] Only now may `status` change to `done`
