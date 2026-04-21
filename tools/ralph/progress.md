## Codebase Patterns
- Keep default frontend host swaps isolated in `frontend/src/app/App.tsx`; preserve the live review UI in `frontend/src/app/live-review-app.tsx` so mockup-shell work stays out of `frontend/src/features/video-review`.
- Default shell data should flow only through `frontend/src/features/ui-shell/loader.ts`; keep shell fixtures local and static so UI-shell stories stay backend-free.

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
