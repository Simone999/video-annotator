## Codebase Patterns
- Keep app-wide route wiring in `frontend/src/app/{App,providers,router,store}`; `store.ts` stays app-config-only, and temporary route adapters live in `app/router.tsx` only until later stories move page ownership into feature folders.

# Ralph Progress Log
Started: Tue Apr 21 15:10:50 CEST 2026
---
## 2026-04-21 15:48:03 CEST - US-001
- Implemented real app-host routing for `/`, `/review/:videoId`, and `*`; removed legacy `?app=live-review` boot switch; added minimal app providers/router/store split and Tailwind not-found route.
- Files changed
  - `frontend/package.json`
  - `package-lock.json`
  - `frontend/src/app/App.tsx`
  - `frontend/src/app/App.test.tsx`
  - `frontend/src/app/providers.tsx`
  - `frontend/src/app/router.tsx`
  - `frontend/src/app/store.ts`
  - `basic-memory/tasks/done/Set up app route map.md`
  - `basic-memory/features/Review Workspace Ergonomics.md`
  - `docs/engineering/architecture.md`
  - `tools/ralph/prd.json`
  - `tools/ralph/progress.md`
- **Learnings for future iterations:**
  - App-level route setup belongs in `frontend/src/app/{App,providers,router,store}`; page ownership still needs later moves into feature folders, so keep route adapters temporary.
  - `frontend/src/app/App.test.tsx` is right seam for route-map integration proof because it can freeze URL behavior with fake HTTP only at request boundary.
  - Real-browser route smoke with `dev-browser` works well for this stack and stores screenshots under `~/.dev-browser/tmp/`.
  - Current local backend `/api/videos/{video_id}/manifest` returns `500`, so direct `/review/:videoId` browser smoke can verify route resolution and URL-driven selection without proving full workspace bootstrap yet.
---
