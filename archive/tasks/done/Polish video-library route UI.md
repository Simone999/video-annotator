---
title: Polish video-library route UI
type: note
permalink: video-annotator/tasks/polish-video-library-route-ui
id: task-polish-video-library-route-ui
status: done
completed: null
steps:
- creation
- planning
- execution
- wrap_up
tags:
- task
- frontend
- ui
- library
- routing
- mockup
---

# Polish video-library route UI

## Creation Phase

### Description

After route ownership moves under `frontend/src/features/video-library/` and frontend tests move into `frontend/tests/`, polish the real `/` route so it matches `docs/ui/video-library.png` direction without inventing data. This task captures each visible library issue cluster with failing tests first, then fixes presentation only.

### Scope

- In scope: route-owned library chrome and spacing, icon delivery, operator-facing card copy, honest preview imagery from existing backend frame routes, route navigation polish, frontend integration proof by issue cluster, and real-stack browser route proof recorded honestly
- Out of scope: fake card data, fake preview art, backend state derivation changes, new backend preview APIs, or review-route implementation beyond confirming navigation still works

### Dependencies And Blockers

- Run after [[Set up app route map]], [[Move library route ownership]], and [[Move frontend tests outside src]]. If route ownership or test-tree move is still incomplete, either absorb the final seam deliberately in planning or stop and unblock the dependency first.
- Do not fix review bootstrap, backend summary derivation, or export semantics here. This task only needs library-side UI polish and correct handoff into `/review/:videoId`.

### Source Material And Starting Points

- Visual target: `docs/ui/video-library.png`
- Visual audit: [[Comparing live pages against UI mockups 2026-04-21]]
- Current runtime seams before route move: `frontend/src/features/ui-shell/library-page.tsx`, `frontend/src/features/ui-shell/loader.ts`, `frontend/src/features/ui-shell/api.ts`, `frontend/src/features/ui-shell/preview.ts`, `frontend/src/features/ui-shell/shell-host.tsx`, and `frontend/src/app/App.tsx`
- Existing backend preview route already exists: `GET /api/videos/{video_id}/frame/{frame_idx}` in `backend/app/api/videos.py`
- Current frontend proof before test move lives mainly in `frontend/src/app/App.test.tsx` and `frontend/src/features/ui-shell/shell-host.test.tsx`
- Audit artifacts: `/tmp/video-library-actual.png` and `docs/ui/video-library.png`

### Known Issue Inventory

- literal icon fallback text leaks into live chrome: `search`, `settings`, and `expand_more`
- page heading and top chrome read larger and looser than mockup
- summary strip shape drifted from mockup; current live loader renders five metrics because it adds `Ready for Review`, while mockup PNG shows four blocks. Implementation must keep live state semantics honest even if metric layout changes
- card context line exposes raw source directory paths instead of short operator-facing copy
- `frontend/src/features/ui-shell/preview.ts` generates placeholder art instead of using real frame imagery
- local data can stay sparse; task is visual polish around honest data, not fake density

### Affected Features

- [[Review Workspace Ergonomics]]

### Acceptance Criteria

- [x] `/` route under `frontend/src/features/video-library/pages/` matches `docs/ui/video-library.png` direction while keeping real backend counts, states, and summary semantics honest
- [x] Library icons render as icons instead of visible fallback text such as `search`, `settings`, or `expand_more`
- [x] Card context copy no longer exposes raw filesystem paths
- [x] Library previews use the existing backend frame-image route with deterministic frame choice from live data: `last_reviewed_frame_idx` when present, else frame `0`
- [x] Generated placeholder preview art no longer appears on the route-owned live library page
- [x] `Open Review` still navigates to `/review/:videoId`
- [x] Task planning explicitly writes failing integration tests for each visible issue cluster and at least one real-stack browser scenario, then records blocked or failing browser truth honestly in the feature test record if backend gaps remain
- [x] Any route or page UI touched by this task uses Tailwind utilities instead of adding new non-Tailwind styling

### Test Intent

- Backend: none
- Frontend: route-owned library integration tests by visible issue cluster plus route navigation regression proof
- Manual: compare `/` against `docs/ui/video-library.png` only if browser automation leaves a visual gap that needs honest manual notes

### Minimum Test Clusters

- `chrome-icons`: route-owned library render does not expose raw icon-name text and still exposes expected controls
- `card-copy`: context copy uses short operator-facing label instead of raw filesystem path
- `preview-source`: preview URLs come from backend frame route with deterministic frame choice `last_reviewed_frame_idx` else `0`, and no generated data-URL placeholder survives
- `route-nav`: `Open Review` still points at `/review/:videoId`
- `browser-smoke`: real stack opens `/` and attempts one review navigation; if downstream review still fails, record exact blocked truth instead of hiding it

### Definition of Done

- [x] Relevant frontend tests pass
- [x] Typecheck passes
- [x] Review Workspace Ergonomics test record is updated honestly
- [x] Task wrap-up records real preview behavior and any remaining blocked browser truth honestly

## Planning Phase

### Planned Integration Tests

- `frontend/tests/integration/video-library/video-library-screen.test.tsx`
  - add `chrome-icons` story: render route-owned library chrome, assert search or settings or expand_more fallback text never appears, and expected controls still exist by accessible name
- `frontend/tests/integration/app/app-routes.test.tsx`
  - add `card-copy` story: backend `source_path` renders short operator copy, not raw `/tmp/...` path text
  - add `preview-source` story: preview `<img>` points at `/api/videos/{video_id}/frame/{frame_idx}` with `last_reviewed_frame_idx` when present, else `0`, and no `data:image/svg+xml` placeholder survives
  - keep `route-nav` story green: `Open Review` still lands on `/review/:videoId`

### Planned E2E Tests

- reuse `tests/e2e/specs/routes.spec.ts` for real-stack route smoke after UI polish
- browser proof target:
  - open `/`
  - confirm route-owned library loads with real frame preview images
  - open one review route from card
  - record exact blocked truth if downstream review bootstrap fails

### Planned Implementation

- replace remaining faux icon placeholders in library header or filter chrome with inline SVG so missing font glyphs cannot leak raw words
- tighten top chrome spacing and heading scale only where route-owned library shell still drifts from mockup direction
- reshape library `contextLine` into short local-source copy without raw filesystem paths
- delete generated preview placeholder path from live library loader and build backend frame-image URLs from canonical video id plus deterministic frame choice
- keep summary metrics honest; do not invent data or hide real states only to mimic mockup count

### Feature Matrix Updates

- update [[Review Workspace Ergonomics]] verification row or manual evidence with honest `US-008` library polish proof
- if browser proof finds new reusable frontend-route gotcha, add it to feature note and repo guidance

## Execution Phase

### Implementation Notes

- Added focused library chrome integration checks in `frontend/tests/integration/video-library/video-library-screen.test.tsx` and app-host shaping checks in `frontend/tests/integration/app/app-routes.test.tsx` before touching runtime code.
- Replaced route-owned library faux icon placeholders with inline SVG icons plus explicit accessible labels in header, filter, and card chrome.
- Tightened top-level library route spacing and heading scale to move closer to mockup direction without changing live summary semantics.
- Changed library card context copy from raw folder paths to short `Local folder · <Name>` labels.
- Deleted generated placeholder preview logic and switched live library previews to backend frame URLs from `last_reviewed_frame_idx ?? 0`.

## Wrap-Up Phase

### Verification

- Commands run:
- `npm --workspace frontend run test -- tests/integration/video-library/video-library-screen.test.tsx tests/integration/app/app-routes.test.tsx`
- `npm run lint`
- `npm run typecheck`
- `npm run test`
- `FRONTEND_E2E_PORT=3100 npm run test:e2e -- tests/e2e/specs/routes.spec.ts`
- `npm run backend:bootstrap:e2e`
- focused Playwright smoke on `http://127.0.0.1:3100`
- Results:
- Targeted frontend integration tests failed first on missing accessible labels, raw source-path copy, and `data:image` preview placeholders, then passed after the library runtime changes.
- `npm run lint` passed.
- `npm run typecheck` passed.
- `npm run test` passed.
- Fresh local Playwright rerun of `tests/e2e/specs/routes.spec.ts` on clean port `3100` still failed at the direct review-route refresh step while waiting for `Canonical frame 0`; this task did not change review-route refresh behavior, so that failure was recorded instead of hidden.
- Focused Playwright smoke on clean port `3100` passed for `/` library load with backend frame previews plus `Open Review bedroom.mp4`, and saved `/tmp/us008-library-route.png` and `/tmp/us008-library-to-review.png`.

### Final Summary

- Polished route-owned library chrome with inline SVG icons and tighter spacing.
- Replaced raw filesystem card copy with short operator-facing folder labels.
- Swapped placeholder preview art for real backend frame previews chosen from `last_reviewed_frame_idx ?? 0`.

### Completion Gate

- [x] Acceptance Criteria checkboxes updated to match reality
- [x] Definition of Done checkboxes updated to match reality
- [x] Only now may `status` change to `done`
