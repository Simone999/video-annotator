## Codebase Patterns
- Keep default frontend host swaps isolated in `frontend/src/app/App.tsx`; preserve the live review UI in `frontend/src/app/live-review-app.tsx` so mockup-shell work stays out of `frontend/src/features/video-review`.
- Keep live-review browser proof opt-in: `frontend/src/app/App.tsx` should mount `LiveReviewApp` only behind `?app=live-review`, while the default host stays shell-first.
- Add explicit `afterEach(cleanup)` in multi-test frontend integration files; repeated `render` calls can leak DOM between Vitest cases in this repo.
- Default shell data should flow only through `frontend/src/features/ui-shell/loader.ts`; keep shell fixtures local and static so UI-shell stories stay backend-free.
- Do not treat default `frontend/src/app/App.tsx` shell proof as live review proof; live ergonomics stories must mount `frontend/src/app/live-review-app.tsx` or another harness that exercises `useVideoReviewWorkspace`.
- Keep `frontend/src/features/ui-shell/library-page.tsx` presentational; local shell page switches and selected fixture state belong in `frontend/src/features/ui-shell/shell-host.tsx`.
- Keep `frontend/src/features/ui-shell/review-page.tsx` presentational too; shell-local selected object state belongs in `frontend/src/features/ui-shell/shell-host.tsx`.
- Keep explicit shell navigation affordances such as `Back to Library` prop-driven from `frontend/src/features/ui-shell/shell-host.tsx`; do not add router or page-local navigation state inside presentational shell pages.
- Gate library propagation progress on `video.state === "in_progress"`; percent presence alone is not enough to show shell progress UI.
- When backend API integration tests swap `APP_DB_URL`, clear `get_engine.cache_clear()` and `get_session_factory.cache_clear()` before building the app or pytest can talk to stale SQLite state.

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

## 2026-04-21 06:01:35 CEST - US-005
- Added app-root frontend integration proof in `frontend/src/app/App.test.tsx` for library chrome, review chrome, `Open Review`, explicit `Back to Library`, and selected-object persistence through reopen, while keeping shell proof fixture-backed and live-review-free.
- Files changed: `frontend/src/app/App.test.tsx`, `AGENTS.md`, `basic-memory/features/Review Workspace Ergonomics.md`, `basic-memory/milestones/planned/m-2a - Mockup UI Shell.md`, `basic-memory/tasks/{done/Add UI integration tests for shell,done/Done Tasks Index,in_progress/In Progress Tasks Index,todo/Todo Tasks Index}.md`, `tools/ralph/prd.json`, `tools/ralph/progress.md`.
- **Learnings for future iterations:**
  - Patterns discovered: keep default-host workflow proof in `frontend/src/app/App.test.tsx` and keep lower shell seam proof in `frontend/src/features/ui-shell/shell-host.test.tsx`.
  - Gotchas encountered: repeated `render` calls in `App.test.tsx` leaked DOM and produced duplicate `Primary` nav landmarks until explicit `afterEach(cleanup)` was added.
  - Useful context: browser smoke proof for this story lives at `/tmp/us-005-shell-app-integration.png`.
---

## 2026-04-21 06:17:46 CEST - US-006
- Closed shell-ergonomics evidence gap by updating durable task and feature notes with exact test-layer reasoning, manual browser smoke evidence, and explicit live-review blockers instead of implying live-stack proof exists.
- Files changed: `basic-memory/features/Review Workspace Ergonomics.md`, `basic-memory/tasks/{done/Testing review workspace ergonomics,done/Done Tasks Index,in_progress/In Progress Tasks Index,todo/Todo Tasks Index}.md`, `AGENTS.md`, `tools/ralph/prd.json`, `tools/ralph/progress.md`.
- **Learnings for future iterations:**
  - Patterns discovered: default `App.tsx` shell verification proves only fixture-shell ergonomics; live review stories need `live-review-app.tsx` or another harness that mounts `useVideoReviewWorkspace`.
  - Gotchas encountered: Basic Memory `replace_section` can duplicate subsections when headings repeat; for heavy task-note cleanup, edit the note file directly and then re-read through Basic Memory to confirm indexed content.
  - Useful context: shell browser smoke artifacts for this story live at `/tmp/us-006-library-shell.png`, `/tmp/us-006-review-shell.png`, and `/tmp/us-006-library-return.png`.
---

## 2026-04-21 06:40:56 CEST - US-007
- Added backend API integration coverage for startup indexing, deterministic discovery by canonical `source_path`, exact-frame PNG fetch, and invalid-frame rejection, plus frontend integration for the real `LiveReviewApp` exact-frame flow.
- Added an opt-in `?app=live-review` host switch so browser smoke can mount the preserved live review workspace without changing the shell-first default app host.
- Files changed: `backend/tests/api/test_video_ingest_exact_frame.py`, `frontend/src/app/{App,App.test,live-review-app.test}.tsx`, `docs/engineering/architecture.md`, `AGENTS.md`, `basic-memory/features/{Video Ingest and Exact-Frame Review,Review Workspace Ergonomics}.md`, `basic-memory/tests/backend-api-integration-tests.md`, `basic-memory/tasks/{done/Testing video ingest and exact-frame review,done/Done Tasks Index,in_progress/In Progress Tasks Index,todo/Todo Tasks Index}.md`, `tools/ralph/prd.json`, `tools/ralph/progress.md`.
- **Learnings for future iterations:**
  - Patterns discovered: keep live-review browser proof opt-in through `?app=live-review`; default `App.tsx` must stay shell-first.
  - Patterns discovered: backend API integration tests that swap `APP_DB_URL` need `get_engine.cache_clear()` and `get_session_factory.cache_clear()` before app creation.
  - Gotchas encountered: deterministic video list order follows canonical `source_path`, not a guessed root-level-first traversal order.
  - Gotchas encountered: local browser smoke can lie if an old backend is still listening on `127.0.0.1:8000`; restart current code before treating `/manifest` errors as product regressions.
  - Useful context: browser smoke artifact for this story lives at `/tmp/us-007-live-review-harness.png`.
---
