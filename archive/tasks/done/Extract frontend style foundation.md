---
id: task-extract-frontend-style-foundation
title: Extract frontend style foundation
status: done
completed: 2026-04-22 04:28:39 CEST
steps:
- creation
- planning
- execution
- wrap_up
tags:
- task
- frontend
- styles
- tailwind
- ui
permalink: video-annotator/tasks/done/extract-frontend-style-foundation
---

# Extract frontend style foundation

## Creation Phase

### Description

Create `frontend/src/styles/` as the one global style entry, move the import to `frontend/src/main.tsx`, and define shared tokens, base rules, and repeated chrome utilities for later route migration.

Read first:
- [[Workflow]]
- [[Video Ingest and Exact-Frame Review]]
- [[SAM2 Shell and Runtime]]
- `docs/ui/DESIGN.md`
- `docs/ui/video-library.html`
- `docs/ui/video-annotation.html`

Stage-2 rule: write concrete tests and implementation plan before code. Use subagent review before task close.

### Scope

- In scope: `frontend/src/styles/app.css`, `tokens.css`, `base.css`, `utilities.css`, global import move to `main.tsx`, remote font or icon plumbing, and removal of old `app.css` imports.
- Out of scope: full route or panel class migration, stories, or screenshot capture.

### Affected Features

- [[Video Ingest and Exact-Frame Review]]
- [[SAM2 Shell and Runtime]]

### Acceptance Criteria

- [x] `frontend/src/styles/app.css` is the only Tailwind entry and imports `tokens.css`, `base.css`, and `utilities.css` in that order.
- [x] `frontend/src/main.tsx` owns the global stylesheet import and old `frontend/src/app/app.css` imports are gone.
- [x] Shared font, icon, token, base, and repeated chrome utility rules exist for later route migration.

### Test Intent

- Frontend: add failing structural tests for the global style entry, import location, and style file existence or content.
- Manual: none in this slice.

### Definition of Done

- [x] Planning phase records concrete tests and implementation plan before code.
- [x] Relevant tests and quality checks pass.
- [x] Own review plus subagent review findings are handled.
- [x] Feature notes, task note, and routing indexes are updated honestly when truth changes.

## Planning Phase

### Planned Integration Tests

- Frontend:
  - add or update a frontend tooling test that reads `frontend/src/main.tsx`, `frontend/src/app/App.tsx`, and `frontend/src/features/video-review/components/live-review-screen.tsx`
  - assert global CSS import lives only in `main.tsx`
  - assert `frontend/src/styles/app.css` imports Tailwind then `tokens.css`, `base.css`, and `utilities.css`
  - assert the new style files exist

### Planned E2E Tests

- none in this slice

### Planned Implementation

- Step 1: write the failing structural test first.
- Step 2: add `frontend/src/styles/` with app, token, base, and utility layers.
- Step 3: move the global import to `main.tsx`, remove old imports, and seed repeated chrome classes without migrating all components yet.
- Step 4: run targeted frontend tests and typecheck.

### Feature Matrix Updates

- add this task to affected feature notes as style-system routing work

## Execution Phase

### Implementation Notes

- Wrote failing tooling test `frontend/tests/unit/tooling/frontend-style-entry.test.ts` first. Red run failed because `frontend/src/styles/app.css` did not exist and imports still pointed at `frontend/src/app/app.css`.
- Added `frontend/src/styles/app.css`, `tokens.css`, `base.css`, and `utilities.css`.
- Moved the one global stylesheet import to `frontend/src/main.tsx`.
- Removed old `app.css` imports from `frontend/src/app/App.tsx` and `frontend/src/features/video-review/components/live-review-screen.tsx`.
- Deleted unused `frontend/src/app/app.css` after the new global entry replaced it.
- Seeded shared tokens, base rules, remote font or icon imports, and repeated chrome utility classes for later route migration.
- Two subagent reviews returned no blocking findings for spec fit or code-quality risk.

## Wrap-Up Phase

### Verification

- Commands run:
- `npm --workspace frontend run test -- tests/unit/tooling/frontend-style-entry.test.ts`
- `npm --workspace frontend exec -- vitest run --coverage=false tests/unit/tooling/frontend-style-entry.test.ts tests/unit/app/main.test.tsx`
- `npm --workspace frontend exec -- prettier --check src/main.tsx src/app/App.tsx src/features/video-review/components/live-review-screen.tsx src/styles/app.css src/styles/tokens.css src/styles/base.css src/styles/utilities.css tests/unit/tooling/frontend-style-entry.test.ts`
- `npm --workspace frontend exec -- eslint src/main.tsx src/app/App.tsx src/features/video-review/components/live-review-screen.tsx tests/unit/tooling/frontend-style-entry.test.ts --max-warnings=0`
- `npm --workspace frontend run typecheck`
- `rg -n "app\\.css" frontend/src frontend/tests -g'*.ts' -g'*.tsx' -g'*.css'`
- Results:
- Red test failed first because `src/styles/app.css` was missing.
- Targeted green tests passed with coverage disabled for TDD reruns.
- Prettier check passed on all task-1 files.
- ESLint passed on all touched TypeScript test or runtime files.
- `rg` confirmed `frontend/src/main.tsx` is now the only runtime import site for `app.css`, and it points at `./styles/app.css`.
- Full frontend typecheck is still blocked by unrelated pre-existing errors in `tests/unit/video-review/use-sam2-workspace.test.tsx`; this task did not touch that file.

### Final Summary

- Frontend now has one global Tailwind entry at `frontend/src/styles/app.css`.
- Shared tokens, base rules, and repeated chrome utilities now live under `frontend/src/styles/`.
- App-wide stylesheet ownership moved to `frontend/src/main.tsx`, and the old `frontend/src/app/app.css` path is gone.

### Completion Gate

- [x] Acceptance Criteria checkboxes updated to match reality
- [x] Definition of Done checkboxes updated to match reality
- [x] Only now may `status` change to `done`
