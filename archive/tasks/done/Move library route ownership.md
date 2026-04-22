---
id: task-move-library-route-ownership
title: Move library route ownership
status: done
completed:
steps:
- creation
- planning
- execution
- wrap_up
tags:
- task
- frontend
- routing
- library
permalink: video-annotator/tasks/move-library-route-ownership
---

# Move library route ownership

## Creation Phase

### Description

Move the runtime library page out of `frontend/src/features/ui-shell/` into an explicit `frontend/src/features/video-library/` feature so `/` is owned by the library feature, not by a historical shell folder.

### Scope

- In scope: create `frontend/src/features/video-library/`, move library page, loader, API client, preview helper, and library-specific types there, rename surviving `UiShell*` library names to explicit `VideoLibrary*` names, update runtime imports, and make library navigation use real route navigation to `/review/:videoId`
- Out of scope: moving live review route ownership, deleting all `ui-shell` leftovers, moving tests outside `src/`, or changing backend contracts

### Affected Features

- [[Review Workspace Ergonomics]]

### Acceptance Criteria

- [x] `/` is owned by a route page under `frontend/src/features/video-library/pages/`
- [x] Library runtime no longer depends on `UiShell*` names for files that moved into `video-library`
- [x] `Open Review` uses real route navigation to `/review/:videoId`
- [x] Library runtime behavior stays backend-backed and shell-first for the default path
- [x] Later cleanup can remove the old `ui-shell` library files without breaking runtime imports
- [x] Task planning explicitly rethinks frontend integration and E2E coverage using `[[frontend-integration-tests]]` and `[[e2e-tests]]`
- [x] Any route or page UI touched by this task uses Tailwind utilities instead of adding new non-Tailwind styling

### Test Intent

- Backend: none
- Frontend: keep or update focused library integration proof after the move
- Manual: load `/`, inspect library cards, and open review navigation from one card

### Definition of Done

- [x] Relevant frontend tests pass
- [x] Typecheck passes
- [x] Task wrap-up records the moved runtime boundaries honestly

## Planning Phase
### Planned Integration Tests

- Update `frontend/src/app/App.test.tsx` to prove default `/` route now renders a `video-library` route page and clicking `Open Review alpha_ready.mp4` changes browser location to `/review/video-alpha` while still booting the review-route harness from the URL param.
- Move the library-only propagation-progress assertion into `frontend/src/features/video-library/library-page.test.tsx` so the moved feature keeps its own card-behavior proof after the rename.

### Planned E2E Tests

- No committed Playwright addition in this task. Per `[[e2e-tests]]`, browser E2E stays for higher-value cross-stack journeys; this task will instead run manual `dev-browser` smoke on `/` to confirm library load and `Open Review` route navigation with screenshot evidence.

### Planned Implementation

- Create `frontend/src/features/video-library/` and move library route page, API client, loader, preview helper, and library types there with explicit `VideoLibrary*` naming.
- Add a route-owned page under `frontend/src/features/video-library/pages/library-page.tsx` that fetches live library data and uses router navigation to open `/review/:videoId`.
- Update `frontend/src/app/router.tsx` to import the new route page for `/`.
- Keep fixture review shell behavior in `frontend/src/features/ui-shell/`, but change any surviving fixture-shell library dependency to import moved `video-library` modules instead of deleted local copies.
- Leave live review route ownership and broad `ui-shell` cleanup for later stories.

### Feature Matrix Updates

- `[[Review Workspace Ergonomics]]` should say default `/` route is owned by `frontend/src/features/video-library/pages/library-page.tsx`, while `/review/:videoId` still uses temporary app-level review adapter until the next story.
- Verification evidence should note browser smoke for route-owned library navigation separately from earlier route-map smoke.

## Execution Phase

### Implementation Notes

- Moved live library API parsing, loader, preview helper, and library types from `frontend/src/features/ui-shell/` into `frontend/src/features/video-library/` with explicit `VideoLibrary*` naming.
- Added `frontend/src/features/video-library/pages/library-page.tsx` as the route-owned `/` page and `frontend/src/features/video-library/components/video-library-screen.tsx` as the shared Tailwind library chrome for both routed runtime and fixture-shell reuse.
- Updated `frontend/src/app/router.tsx` so `/` renders the new route page, and updated `frontend/src/app/App.test.tsx` to prove clicking `Open Review` changes browser URL to `/review/:videoId`.
- Repointed fixture-shell runtime to the moved library modules and deleted obsolete `frontend/src/features/ui-shell/{api,loader,preview,library-page}.ts*` files.

## Wrap-Up Phase

### Verification

- Commands run:
- `npm --workspace frontend run test -- src/app/App.test.tsx -t "navigates from library route to review route with selected backend video id"`
- `npm --workspace frontend run test -- src/features/video-library/library-page.test.tsx`
- `npm --workspace frontend run test -- src/features/ui-shell/shell-host.test.tsx`
- `npm run typecheck`
- `npm run lint`
- `npm run test`
- Results:
- Route navigation regression test passed after proving red on unchanged shell-local navigation.
- Moved `video-library` card-behavior test passed.
- Fixture-shell reuse test passed.
- `npm run typecheck` passed.
- `npm run lint` passed.
- `npm run test` passed with `14` backend tests and `35` frontend tests.
- Manual Playwright smoke on existing local stack at `http://127.0.0.1:5173` and `http://127.0.0.1:8000` clicked `Open Review bedroom.mp4`, landed on `http://127.0.0.1:5173/review/video-2d62649f3590f8d0`, and saved `/home/simone/.dev-browser/tmp/us002-library-route.png` plus `/home/simone/.dev-browser/tmp/us002-review-route.png`.

### Final Summary

`/` is now a feature-owned `video-library` route that loads live backend summaries through moved library modules and navigates into `/review/:videoId` through router state instead of shell-local page state. Fixture-shell review proof still works, but it now reuses the moved library screen instead of keeping a second `ui-shell` library runtime copy.

### Completion Gate

- [x] Acceptance Criteria checkboxes updated to match reality
- [x] Definition of Done checkboxes updated to match reality
- [x] Only now may `status` change to `done`
