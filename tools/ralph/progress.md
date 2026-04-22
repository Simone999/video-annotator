## Codebase Patterns
- Keep live review selected range as one inclusive canonical-frame state. Temporary propagation direction and boundary inputs should update that state, and propagation must use the normalized boundary from that state instead of raw text input.

# Ralph Progress Log
Started: Wed Apr 22 05:50:56 CEST 2026
---
## 2026-04-22 06:07:00 CEST - US-015
- Implemented explicit selected-range controller state in `use-live-review-controller` with inclusive `startFrameIdx` and `endFrameIdx` semantics, normalized boundary handling, and shared summary or propagation wiring.
- Added controller unit coverage for selected-range defaults, reset rules, forward normalization, and `both`-direction normalization. Kept live-review integration coverage green and verified real browser route bootstrap plus summary request reload after range changes.
- Files changed
  - `AGENTS.md`
  - `basic-memory/tasks/done/Add selected-range state.md`
  - `basic-memory/tasks/done/Done Tasks Index.md`
  - `basic-memory/features/SAM2 Shell and Runtime.md`
  - `basic-memory/features/Video Ingest and Exact-Frame Review.md`
  - `basic-memory/tasks/todo/Todo Tasks Index.md`
  - `frontend/src/features/video-review/hooks/use-live-review-controller.ts`
  - `frontend/tests/unit/video-review/use-live-review-controller.test.ts`
  - `tools/ralph/prd.json`
  - `tools/ralph/progress.md`
- **Learnings for future iterations:**
  - Selected-range truth should be stored once with inclusive canonical bounds and a normalized propagation boundary; do not let summary fetch and propagation start compute separate ranges.
  - Direction changes should reset the temporary boundary input to that direction's default edge, while current-frame changes should keep the reviewer boundary and recompute the inclusive range around the new canonical frame.
  - Fresh browser proof on 2026-04-22 used `backend:bootstrap:e2e`, `backend:dev:e2e` on `127.0.0.1:8000`, and `FRONTEND_E2E_PORT=3100 npm run frontend:dev:e2e`; screenshot: `/tmp/us015-selected-range-browser.png`.
---
