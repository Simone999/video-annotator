---
title: Wire export UI and exported state
type: note
permalink: video-annotator/tasks/wire-export-ui-and-exported-state
id: task-wire-export-ui-and-exported-state
status: in_progress
completed:
steps:
- creation
- planning
- execution
- wrap_up
tags:
- task
- frontend
- export
- m-5
- library
---

# Wire export UI and exported state

## Creation Phase

### Description

Wire live export trigger or download UI and show real exported/stale state in library and review surfaces.
Keep current 1920x1080 library and review direction from committed `docs/ui` PNG truth. Use matching HTML mockups as guides only, not strict contract.

Read first:
- [[Workflow]]
- [[Export]]
- [[Video Ingest and Exact-Frame Review]]
- [[Export Format]]
- `docs/spec.md`
- `docs/product/prd.md`
- `docs/ui/video-library.png`
- `docs/ui/video-library.html`
- `docs/ui/video-review-1920x1080.png`
- `docs/ui/video-review.html`
- `frontend/src/features/video-library/loader.ts`
- `frontend/src/features/video-library/components/video-library-video-card.tsx`
- `frontend/src/features/video-review/components/review-inspector-panel.tsx`

Stage-2 rule: in planning phase, write concrete test plan and implementation plan first. In execution, follow written plan. Before `done`, run own review plus 2 subagent reviews and fix actionable findings.

### Scope

- In scope: review export trigger, download affordance, library exported-state copy, stale-export fallback UI, and preserving current 1920x1080 library/review route direction
- Out of scope: import or Docker hardening work, or redesigning current library/review shells

### Affected Features

- [[Export]]
- [[Video Ingest and Exact-Frame Review]]

### Acceptance Criteria

- [x] Live UI can trigger export and expose download path from typed client
- [x] Library shows real `exported` only when backend derivation says export is current
- [x] Manual edit after export returns library state to `ready` until next export
- [x] Touched library and review export UI keep current 1920x1080 route direction from committed `docs/ui` PNGs; matching HTML files stay guides only

### Test Intent

- Backend: none
- Frontend: integration coverage for export UI and library exported-state rendering
- Manual: browser-check export flow and exported/stale state transitions on live routes at 1920x1080 against committed PNG truth

### Definition of Done

- [x] Planning phase records concrete tests and implementation plan before code
- [ ] Own review plus 2 subagent reviews are recorded and actionable findings are fixed
- [ ] Relevant tests and quality checks pass
- [x] Feature notes, task note, and routing indexes are updated honestly when truth changes

## Planning Phase

### Planned Integration Tests

- Frontend route integration in `frontend/tests/integration/video-review/export-ui-flow.test.tsx` for:
  - review route export action creates one export and exposes `/api/exports/{export_id}` download link
  - library route remount shows `exported` after export when backend list state changes
  - later manual box delete moves backend list state back to `ready` and library remount reflects it
- Frontend review integration shard in `frontend/tests/integration/video-review/live-review-screen.test.tsx` for:
  - review workspace renders export section from current review-state truth
  - export button loading or success or failure copy stays explicit

### Planned E2E Tests

- Browser smoke on library and `/review/:videoId`:
  - export one seeded video from live review
  - confirm review surface shows ready/exported state and download affordance
  - return to library and confirm exported card state
  - make one manual edit, return to library, confirm state falls back to ready

### Planned Implementation

- Widen typed review-route video payload parsing to keep backend `review_state` available inside live review
- Add local review export state in live-review controller with explicit request or error or download-url handling
- Render export controls on review inspector without changing topbar or shared shell direction
- Keep library state truth backend-derived; use route remount proof instead of inventing sticky frontend export state
- Update export feature note only if shipped UI behavior or verification strategy changes

### Feature Matrix Updates

- `[[Export]]` should record that visible review export trigger and browser proof now exist once work lands

## Execution Phase

### Implementation Notes

- Added export-state parsing to review video payloads and a review-workspace refresh path so controller code can pull backend truth after export or persisted edits.
- Added export controls plus review-state copy to the selected-object inspector and review header without changing route chrome direction.
- Added focused integration coverage for `ready -> exported -> ready` and used real browser smoke to confirm library and review surfaces stay honest.

## Wrap-Up Phase

### Verification

- Commands run:
  - `npm --workspace frontend exec vitest run tests/integration/video-review/export-ui-flow.test.tsx tests/unit/video-review/review-inspector-panel.test.tsx tests/unit/video-review/use-live-review-controller-mask-cleanup.test.ts tests/unit/video-review/use-live-review-controller-object-delete.test.ts`
  - `npm run typecheck`
  - `npm run lint`
  - `npm run test`
  - `npm --workspace frontend run test`
- Results:
  - Focused frontend Vitest shard passed.
  - `npm run typecheck` passed.
  - `npm run lint` passed.
  - `npm run test` failed on existing backend coverage gate: branch coverage `89.24%` below required `90.00%`, even though backend reported `150 passed`.
  - `npm --workspace frontend run test` OOMed in monolithic Vitest coverage on this branch.
  - Fresh `dev-browser --browser us041-export --headless` smoke passed on seeded e2e stack and saved `/home/simone/.dev-browser/tmp/us041-exported-review-browser.png` plus `/home/simone/.dev-browser/tmp/us041-ready-library-browser.png`.

### Final Summary

Review export UI now triggers live export, shows current review state and download affordance, and lets library plus review routes reflect backend-derived `ready/exported` truth after later edits. Route state now refreshes backend `review_state` instead of inferring stale-versus-exported locally, which avoided a false regression when an older-frame edit did not invalidate the latest export.

### Completion Gate

- [x] Acceptance Criteria checkboxes updated to match reality
- [ ] Definition of Done checkboxes updated to match reality
- [ ] Only now may `status` change to `done`
