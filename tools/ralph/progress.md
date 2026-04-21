## Codebase Patterns
- Keep app-wide route wiring in `frontend/src/app/{App,providers,router,store}`; `store.ts` stays app-config-only, and temporary route adapters live in `app/router.tsx` only until later stories move page ownership into feature folders.
- Reuse `frontend/src/features/video-library/components/video-library-screen.tsx` for both routed live library UI and fixture-shell library chrome; do not keep a second `ui-shell` library page copy after route ownership moves.

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
## 2026-04-21 16:05:57 CEST - US-002
- Implemented feature-owned live library runtime under `frontend/src/features/video-library/`, routed `/` through `pages/library-page.tsx`, and changed `Open Review` to real `/review/:videoId` navigation.
- Files changed
  - `AGENTS.md`
  - `basic-memory/features/Review Workspace Ergonomics.md`
  - `basic-memory/tasks/done/Move library route ownership.md`
  - `docs/engineering/architecture.md`
  - `frontend/src/app/App.test.tsx`
  - `frontend/src/app/router.tsx`
  - `frontend/src/features/ui-shell/fixtures.ts`
  - `frontend/src/features/ui-shell/shell-host.test.tsx`
  - `frontend/src/features/ui-shell/shell-host.tsx`
  - `frontend/src/features/ui-shell/types.ts`
  - `frontend/src/features/video-library/api.ts`
  - `frontend/src/features/video-library/components/video-library-screen.tsx`
  - `frontend/src/features/video-library/index.ts`
  - `frontend/src/features/video-library/library-page.test.tsx`
  - `frontend/src/features/video-library/loader.ts`
  - `frontend/src/features/video-library/pages/library-page.tsx`
  - `frontend/src/features/video-library/preview.ts`
  - `frontend/src/features/video-library/types.ts`
  - `tools/ralph/prd.json`
  - `tools/ralph/progress.md`
- **Learnings for future iterations:**
  - Shared library chrome now belongs in `frontend/src/features/video-library/components/video-library-screen.tsx`; fixture-shell should reuse that component instead of reviving a second `ui-shell` library page.
  - Route-owned library behavior is best frozen in `frontend/src/app/App.test.tsx`, because mocked HTTP plus real router state proves the URL handoff without needing browser E2E for every change.
  - Library-only card rules such as propagation-progress gating now belong in `frontend/src/features/video-library/library-page.test.tsx`, next to the owning feature code.
  - Fresh manual browser smoke on 2026-04-21 used existing local stack at `127.0.0.1:5173` and `127.0.0.1:8000`, clicked `Open Review bedroom.mp4`, and saved `/home/simone/.dev-browser/tmp/us002-library-route.png` plus `/home/simone/.dev-browser/tmp/us002-review-route.png`.
---
