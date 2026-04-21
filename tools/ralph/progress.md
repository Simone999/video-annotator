## Codebase Patterns
- Keep default frontend host swaps isolated in `frontend/src/app/App.tsx`; preserve the live review UI in `frontend/src/app/live-review-app.tsx` so mockup-shell work stays out of `frontend/src/features/video-review`.
- Default shell data should flow only through `frontend/src/features/ui-shell/loader.ts`; keep shell fixtures local and static so UI-shell stories stay backend-free.
- Keep `frontend/src/features/ui-shell/library-page.tsx` presentational; local shell page switches and selected fixture state belong in `frontend/src/features/ui-shell/shell-host.tsx`.

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
