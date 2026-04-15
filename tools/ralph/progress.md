# Ralph Progress Log
Started: 2026-04-15 22:47 CEST
---

## Codebase Patterns
- Exact-frame route validation belongs before decode: reject any `frame_idx` outside persisted `Video.frame_count`, and patch `app.api.videos.load_exact_video_frame` in API tests when response bytes matter more than decoder internals.
- Backend API tests that change `APP_DB_URL` between cases must clear cached `app.db.session.get_engine()` and `get_session_factory()` before creating app, or stale SQLite state can leak across tests.
- Backend API route tests can set `APP_DB_URL` to temp SQLite file, seed rows directly with SQLAlchemy, and rely on `create_app()` startup to bootstrap tables.
- `FrameAnnotation` persistence keeps both `video_id` and `object_id`; enforce unique `(video_id, frame_idx, object_id)` in DB so video-scoped APIs, SAM2 prompt writes, and propagation writes share one canonical row shape.
- Frame-annotation writes stay row-scoped additive upserts keyed by `(video_id, frame_idx, object_id)`; prompt or propagation updates must not wipe sibling rows on same frame.
- Frontend feature modules should parse backend JSON in feature API clients before state updates, and keep canonical `currentFrameIndex` in feature state instead of deriving it from playback UI.
- Exact-frame overlays should render in relative wrapper sized by displayed image element; use normalized percent `left/top/width/height` so boxes and masks track displayed backend frame pixels instead of pane layout.
- For draw-box UI, keep active pointer-drag gesture local to exact-frame component, but store only normalized draft box data in feature state and clear stale drafts when canonical frame or selected object changes.
- When exact-frame content grows after a click, disable browser scroll anchoring on that pane with `overflow-anchor: none` instead of trying to restore scroll position imperatively.

## Progresses
## 2026-04-16 00:29 CEST - US-000
- Implemented a narrow scroll-stability fix for exact-frame review by opting the exact-frame pane out of browser scroll anchoring, so clicking `Load frame` no longer shifts the viewport when the pane expands with the loaded image.
- Added frontend regression coverage that locks the exact-frame pane to `overflow-anchor: none`, and recorded a durable Basic Memory note for future search: `basic-memory/engineering/Exact-frame pane scroll anchoring fix.md`.
- Verified in a real browser against the live local stack with `bedroom.mp4`: document height grew from `876` to `1157` after frame `7` loaded, while `window.scrollY` stayed stable at `9`. Screenshot saved at `/tmp/us000-scroll-browser.png`.
- Files changed: `frontend/src/app/App.test.tsx`, `frontend/src/app/App.tsx`, `tools/ralph/prd.json`, `tools/ralph/progress.md`, `basic-memory/engineering/Exact-frame pane scroll anchoring fix.md`
- **Learnings for future iterations:**
  - Patterns discovered: if exact-frame content can expand after a button click, put `overflow-anchor: none` on the exact-frame pane itself and let browser layout grow without viewport correction.
  - Gotchas encountered: Vite dev must be started as `npm --workspace frontend run dev -- --host 127.0.0.1`; passing `--host` through repo-root `npm run frontend:dev` turned into `vite 127.0.0.1` and served a broken page.
  - Useful context: live repro/verification is simplest with already indexed `bedroom.mp4`; scroll bug check only needs open video, set frame `7`, scroll a bit, click `Load frame`, then compare `window.scrollY` before and after.
---
