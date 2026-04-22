---
id: task-extract-live-review-feature-entry
title: Extract live review feature entry
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
- review
permalink: video-annotator/tasks/extract-live-review-feature-entry
---

# Extract live review feature entry

## Creation Phase

### Description

Move live review route ownership and route-level behavior under `frontend/src/features/video-review/` so `/review/:videoId` is a feature-owned page that reads `videoId` from the URL. This task is the extraction pass only; app-level entrypoint deletion is already decided and lands in the separate follow-up task.

### Scope

- In scope: create `frontend/src/features/video-review/pages/review-page.tsx`, read `videoId` with route params, move route-level review ownership out of `frontend/src/app/`, move enough live review composition into `frontend/src/features/video-review/` that the feature owns the review route, and keep canonical frame plus paused-only edit rules intact
- Out of scope: deleting `frontend/src/app/live-review-app.tsx`, deleting final `ui-shell` leftovers, moving test files outside `src/`, or changing backend review contracts

### Affected Features

- [[Review Workspace Ergonomics]]
- [[Video Ingest and Exact-Frame Review]]

### Acceptance Criteria

- [x] `/review/:videoId` selects the live review video from the URL instead of app-local query-string logic
- [x] Live review page ownership lives under `frontend/src/features/video-review/`
- [x] Direct load and refresh on `/review/:videoId` work in the current Vite dev and Playwright flow
- [x] Canonical frame loading, paused-only mutations, and existing live review behavior remain intact after extraction
- [x] If extraction needs a temporary adapter, it carries no route ownership and task wrap-up records exactly what the dedicated deletion task still must remove
- [x] Task planning explicitly rethinks frontend integration and E2E coverage using `[[frontend-integration-tests]]` and `[[e2e-tests]]`
- [x] Any route or page UI touched by this task uses Tailwind utilities instead of adding new non-Tailwind styling

### Test Intent

- Backend: none
- Frontend: update route integration proof and live review integration proof around URL-param selection
- Manual: direct-load `/review/<videoId>`, refresh, and confirm review opens the expected video

### Definition of Done

- [x] Relevant frontend tests pass
- [x] Typecheck passes
- [x] Browser route verification is recorded honestly if run

## Planning Phase

### Planned Integration Tests

- `frontend/src/features/video-review/pages/review-page.test.tsx`
  - Render feature-owned `/review/:videoId` page inside router.
  - Mock temp app adapter.
  - Prove page reads route param and passes exact `initialVideoId`.
- `frontend/src/app/App.test.tsx`
  - Keep routed app-host proof on `/review/:videoId`.
  - Update seam so router resolves through feature-owned review page, not app-local `useParams`.
- `frontend/src/app/live-review-app.test.tsx`
  - Add direct-load proof for `initialVideoId`.
  - Render live review with preselected video id and prove workspace opens expected video without library click.

### Planned E2E Tests

- No new committed Playwright in this task.
- Reason: `[[e2e-tests]]` says use browser E2E for few critical journeys only. Route-owned direct-load behavior already fits frontend integration plus one real-browser smoke here.
- Manual smoke target:
  - open `/review/<videoId>` on local stack
  - refresh
  - confirm expected video opens, or honest backend bootstrap failure still shows URL-owned route state

### Planned Implementation

- Add `frontend/src/features/video-review/pages/review-page.tsx`.
- Read `videoId` from route params inside feature page.
- Route page renders temp app adapter with no route logic left in `frontend/src/app/router.tsx`.
- Export new review route page from `frontend/src/features/video-review/index.ts`.
- Keep `frontend/src/app/live-review-app.tsx` as temp adapter only.
- Update app router to import feature-owned review page.

### Feature Matrix Updates

- `[[Review Workspace Ergonomics]]`
  - Move current-state wording from app-level review adapter to feature-owned review page with temp app adapter left behind.
  - Update verification text if new route-page test or browser smoke lands.
- `[[Video Ingest and Exact-Frame Review]]`
  - Update summary only if direct-load proof changes baseline ingest-to-review wording.

## Execution Phase

### Implementation Notes

- Added feature-owned route page `frontend/src/features/video-review/pages/review-page.tsx`.
- Moved `/review/:videoId` param read out of `frontend/src/app/router.tsx`.
- Kept `frontend/src/app/live-review-app.tsx` as temporary adapter only. Follow-up delete task still must remove that adapter and repoint remaining imports such as fixture shell.

## Wrap-Up Phase

### Verification

- Commands run:
  - `npm --workspace frontend run test -- src/features/video-review/pages/review-page.test.tsx src/app/App.test.tsx src/app/live-review-app.test.tsx`
  - `npm run typecheck`
  - `npm run lint`
  - `npm run test`
  - `dev-browser --browser us003-review-route --headless --timeout 60 <<'EOF' ... /review/video-2d62649f3590f8d0 direct-load + refresh smoke ... EOF`
- Results:
  - Targeted frontend tests passed after adding feature-owned review page and direct-load bootstrap proof.
  - `npm run typecheck`, `npm run lint`, and `npm run test` all passed.
  - Browser smoke on fresh `npm run backend:dev:e2e` plus frontend dev `http://127.0.0.1:5174` direct-loaded `/review/video-2d62649f3590f8d0`, kept `Open bedroom.mp4` pressed before and after refresh, showed `Canonical frame 0`, and saved `/home/simone/.dev-browser/tmp/us003-review-route-refresh.png`.

### Final Summary

- `/review/:videoId` is now feature-owned under `frontend/src/features/video-review/pages/review-page.tsx`.
- `frontend/src/app/router.tsx` now stays app wiring only.
- Temporary adapter left behind: `frontend/src/app/live-review-app.tsx`. Follow-up delete task still needs to remove that file and repoint remaining runtime imports.

### Completion Gate

- [x] Acceptance Criteria checkboxes updated to match reality
- [x] Definition of Done checkboxes updated to match reality
- [x] Only now may `status` change to `done`
