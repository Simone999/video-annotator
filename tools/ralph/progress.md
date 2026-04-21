## Codebase Patterns
- Keep default frontend host swaps isolated in `frontend/src/app/App.tsx`; preserve the live review UI in `frontend/src/app/live-review-app.tsx` so mockup-shell work stays out of `frontend/src/features/video-review`.
- Default shell data should flow only through `frontend/src/features/ui-shell/loader.ts`; keep shell fixtures local and static so UI-shell stories stay backend-free.
- Keep `frontend/src/features/ui-shell/library-page.tsx` presentational; local shell page switches and selected fixture state belong in `frontend/src/features/ui-shell/shell-host.tsx`.
- Keep `frontend/src/features/ui-shell/review-page.tsx` presentational too; shell-local selected object state belongs in `frontend/src/features/ui-shell/shell-host.tsx`.
- Keep explicit shell navigation affordances such as `Back to Library` prop-driven from `frontend/src/features/ui-shell/shell-host.tsx`; do not add router or page-local navigation state inside presentational shell pages.
- Gate library propagation progress on `video.state === "in_progress"`; percent presence alone is not enough to show shell progress UI.

# Ralph Progress Log
Started: Tue Apr 21 04:45:17 CEST 2026
---

## 2026-04-21 04:57:15 CEST - US-001
- Implemented a new fixture-backed `ui-shell` feature, swapped default `App` host to it, and preserved the old live review UI in `frontend/src/app/live-review-app.tsx`.
- Files changed: `frontend/src/app/App.tsx`, `frontend/src/app/App.test.tsx`, `frontend/src/app/live-review-app.tsx`, `frontend/src/app/app.css`, `frontend/src/features/ui-shell/*`, `docs/engineering/architecture.md`, `AGENTS.md`, `backend/tests/factories/test_model_factories.py`, `basic-memory/...`, `tools/ralph/prd.json`, `tools/ralph/progress.md`.
- **Learnings for future iterations:**
  - Patterns discovered: keep default-host swaps in `App.tsx` and preserve live review harness separately.
  - Patterns discovered: `ui-shell/loader.ts` is shell-only data boundary; future shell stories should not touch `video-review/api.ts`.
  - Gotchas encountered: root `npm run lint` can fail on existing backend import ordering, so check repo-wide gates before assuming a frontend-only change is ready.
  - Useful context: screenshot proof for this story lives at `/tmp/us-001-ui-shell-foundation.png`.
---

## 2026-04-21 05:13:02 CEST - US-002
- Implemented mockup-first library shell chrome, summary metrics, richer fixture cards, propagation-only progress display, and shell-local `Open Review` navigation into review placeholder.
- Files changed: `frontend/src/app/app.css`, `frontend/src/features/ui-shell/{types,fixtures,loader,library-page,review-page,shell-host}.ts*`, `frontend/src/features/ui-shell/shell-host.test.tsx`, `AGENTS.md`, `basic-memory/...`, `tools/ralph/prd.json`, `tools/ralph/progress.md`.
- **Learnings for future iterations:**
  - Patterns discovered: keep `library-page.tsx` presentational and push shell page switching into `shell-host.tsx`.
  - Patterns discovered: summary metrics and mockup card copy can live in `ui-shell/fixtures.ts` so shell visuals stay fixture-driven without backend drift.
  - Gotchas encountered: Testing Library did not auto-clean this new file in practice; `afterEach(cleanup)` kept repeated shell renders from leaking between test cases.
  - Useful context: browser proof for this story lives at `/tmp/us-002-video-library-shell.png` and `/tmp/us-002-review-shell.png`.
---

## 2026-04-21 05:24:52 CEST - US-002
- Tightened library propagation rendering so progress appears only for `in_progress` cards and percent copy uses actual fixture value.
- Files changed: `frontend/src/features/ui-shell/library-page.tsx`, `frontend/src/features/ui-shell/library-page.test.tsx`, `AGENTS.md`, `basic-memory/features/Review Workspace Ergonomics.md`, `basic-memory/tasks/done/build-video-library-mockup-shell.md`, `tools/ralph/prd.json`, `tools/ralph/progress.md`.
- **Learnings for future iterations:**
  - Patterns discovered: guard shell progress UI with explicit video state, not only non-null percent data.
  - Gotchas encountered: fixture-backed integration tests can miss reopened regressions when component logic trusts fixture shape too much; add focused component tests for boundary rules.
  - Useful context: refreshed browser proof for this pass lives at `/tmp/us-002-video-library-shell-refresh.png` and `/tmp/us-002-review-shell-refresh.png`.
---

## 2026-04-21 05:44:51 CEST - US-003
- Implemented fixture-backed review shell chrome with top metadata bar, left nav, object rail, stage overlays, bottom transport timeline, and right inspector, all driven from local shell fixtures and shell-host object selection state.
- Files changed: `frontend/src/app/app.css`, `frontend/src/features/ui-shell/{fixtures,loader,review-page,shell-host,types}.ts*`, `frontend/src/features/ui-shell/{shell-host,library-page}.test.tsx`, `AGENTS.md`, `basic-memory/features/Review Workspace Ergonomics.md`, `basic-memory/milestones/planned/m-2a - Mockup UI Shell.md`, `basic-memory/tasks/{done/Build review page mockup shell,done/Done Tasks Index,in_progress/In Progress Tasks Index,todo/Todo Tasks Index}.md`, `tools/ralph/prd.json`, `tools/ralph/progress.md`.
- **Learnings for future iterations:**
  - Patterns discovered: keep `review-page.tsx` presentational and hold selected-object shell state in `shell-host.tsx`, same as page switching.
  - Gotchas encountered: adding required review payload to `UiShellVideo` will break any small test fixture builder that does not add a stub `review` object.
  - Useful context: browser-rendered proof for this story lives at `/tmp/us-003-review-shell.png`.
---

## 2026-04-21 05:54:02 CEST - US-004
- Implemented explicit review-chrome `Back to Library` action, kept shell page switching in `shell-host.tsx`, and proved selected object state stays coherent after returning to library and reopening same fixture video.
- Files changed: `frontend/src/features/ui-shell/{review-page,shell-host,shell-host.test}.tsx`, `AGENTS.md`, `basic-memory/features/Review Workspace Ergonomics.md`, `basic-memory/milestones/planned/m-2a - Mockup UI Shell.md`, `basic-memory/tasks/{done/Wire page actions and local UI state,done/Done Tasks Index,in_progress/In Progress Tasks Index,todo/Todo Tasks Index}.md`, `tools/ralph/prd.json`, `tools/ralph/progress.md`.
- **Learnings for future iterations:**
  - Patterns discovered: keep explicit shell navigation affordances prop-driven from `shell-host.tsx`; presentational shell pages should not own page state or router logic.
  - Gotchas encountered: test command path under workspace root must be `src/...`, not `frontend/src/...`, or Vitest reports false `No test files found`.
  - Useful context: browser proof for this story lives at `/tmp/us-004-shell-navigation.png`.
---
