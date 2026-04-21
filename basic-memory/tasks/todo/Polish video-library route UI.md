---
title: Polish video-library route UI
type: note
permalink: video-annotator/tasks/polish-video-library-route-ui
id: task-polish-video-library-route-ui
status: todo
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

After route ownership moves under `frontend/src/features/video-library/` and frontend tests move into `frontend/tests/`, polish the real `/` route so it matches `docs/ui/video-library-mockup.png` direction without inventing data. This task captures each visible library issue cluster with failing tests first, then fixes presentation only.

### Scope

- In scope: route-owned library chrome and spacing, icon delivery, operator-facing card copy, honest preview imagery from existing backend frame routes, route navigation polish, frontend integration proof by issue cluster, and real-stack browser route proof recorded honestly
- Out of scope: fake card data, fake preview art, backend state derivation changes, new backend preview APIs, or review-route implementation beyond confirming navigation still works

### Dependencies And Blockers

- Run after [[Set up app route map]], [[Move library route ownership]], and [[Move frontend tests outside src]]. If route ownership or test-tree move is still incomplete, either absorb the final seam deliberately in planning or stop and unblock the dependency first.
- Do not fix review bootstrap, backend summary derivation, or export semantics here. This task only needs library-side UI polish and correct handoff into `/review/:videoId`.

### Source Material And Starting Points

- Visual target: `docs/ui/video-library-mockup.png`
- Visual audit: [[Comparing live pages against UI mockups 2026-04-21]]
- Current runtime seams before route move: `frontend/src/features/ui-shell/library-page.tsx`, `frontend/src/features/ui-shell/loader.ts`, `frontend/src/features/ui-shell/api.ts`, `frontend/src/features/ui-shell/preview.ts`, `frontend/src/features/ui-shell/shell-host.tsx`, and `frontend/src/app/App.tsx`
- Existing backend preview route already exists: `GET /api/videos/{video_id}/frame/{frame_idx}` in `backend/app/api/videos.py`
- Current frontend proof before test move lives mainly in `frontend/src/app/App.test.tsx` and `frontend/src/features/ui-shell/shell-host.test.tsx`
- Audit artifacts: `/tmp/video-library-actual.png` and `docs/ui/video-library-mockup.png`

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

- [ ] `/` route under `frontend/src/features/video-library/pages/` matches `docs/ui/video-library-mockup.png` direction while keeping real backend counts, states, and summary semantics honest
- [ ] Library icons render as icons instead of visible fallback text such as `search`, `settings`, or `expand_more`
- [ ] Card context copy no longer exposes raw filesystem paths
- [ ] Library previews use the existing backend frame-image route with deterministic frame choice from live data: `last_reviewed_frame_idx` when present, else frame `0`
- [ ] Generated placeholder preview art no longer appears on the route-owned live library page
- [ ] `Open Review` still navigates to `/review/:videoId`
- [ ] Task planning explicitly writes failing integration tests for each visible issue cluster and at least one real-stack browser scenario, then records blocked or failing browser truth honestly in the feature test record if backend gaps remain
- [ ] Any route or page UI touched by this task uses Tailwind utilities instead of adding new non-Tailwind styling

### Test Intent

- Backend: none
- Frontend: route-owned library integration tests by visible issue cluster plus route navigation regression proof
- Manual: compare `/` against `docs/ui/video-library-mockup.png` only if browser automation leaves a visual gap that needs honest manual notes

### Minimum Test Clusters

- `chrome-icons`: route-owned library render does not expose raw icon-name text and still exposes expected controls
- `card-copy`: context copy uses short operator-facing label instead of raw filesystem path
- `preview-source`: preview URLs come from backend frame route with deterministic frame choice `last_reviewed_frame_idx` else `0`, and no generated data-URL placeholder survives
- `route-nav`: `Open Review` still points at `/review/:videoId`
- `browser-smoke`: real stack opens `/` and attempts one review navigation; if downstream review still fails, record exact blocked truth instead of hiding it

### Definition of Done

- [ ] Relevant frontend tests pass
- [ ] Typecheck passes
- [ ] Review Workspace Ergonomics test record is updated honestly
- [ ] Task wrap-up records real preview behavior and any remaining blocked browser truth honestly

## Planning Phase

### Planned Integration Tests

### Planned E2E Tests

### Planned Implementation

### Feature Matrix Updates

## Execution Phase

### Implementation Notes

## Wrap-Up Phase

### Verification

- Commands run:
- Results:

### Final Summary

### Completion Gate

- [ ] Acceptance Criteria checkboxes updated to match reality
- [ ] Definition of Done checkboxes updated to match reality
- [ ] Only now may `status` change to `done`