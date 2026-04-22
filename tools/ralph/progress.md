## Codebase Patterns
- Keep live review selected range as one inclusive canonical-frame state. Temporary propagation direction and boundary inputs should update that state, and propagation must use the normalized boundary from that state instead of raw text input.
- Source review timeline markers from manifest arrays already loaded in controller state, and keep raw frame-number jump in a separate fallback block once timeline-first transport lands.

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
## 2026-04-22 06:25:31 CEST - US-016
- Implemented timeline-first transport footer for live review with manifest-driven annotated/keyframe markers, visible selected-range controls, and exact-frame numeric load moved into a secondary fallback block.
- Moved propagation direction/end-frame inputs from inspector into transport footer so timeline, summary, and propagation all read same selected-range state, while inspector keeps start/cancel actions only.
- Files changed
  - `AGENTS.md`
  - `basic-memory/features/SAM2 Shell and Runtime.md`
  - `basic-memory/features/Video Ingest and Exact-Frame Review.md`
  - `basic-memory/milestones/in_progress/m-2 - Review Workspace PRD Parity.md`
  - `basic-memory/tasks/done/Build timeline transport UI.md`
  - `basic-memory/tasks/done/Done Tasks Index.md`
  - `basic-memory/tasks/todo/Todo Tasks Index.md`
  - `frontend/src/features/video-review/components/review-inspector-panel.tsx`
  - `frontend/src/features/video-review/components/review-transport-controls.tsx`
  - `frontend/src/features/video-review/hooks/use-live-review-controller.ts`
  - `frontend/tests/integration/video-review/live-review-screen.test.tsx`
  - `tools/ralph/prd.json`
  - `tools/ralph/progress.md`
- **Learnings for future iterations:**
  - Timeline marker truth should come straight from manifest arrays already loaded into controller state; do not refetch markers or infer them from summary payloads.
  - Transport footer should own timeline and range controls, while inspector keeps propagation action buttons and summary panels.
  - Fresh browser proof for marker UI on 2026-04-22 needed `backend:bootstrap:e2e`, `backend:seed:e2e:review-navigation`, fresh `backend:dev:e2e` on `127.0.0.1:8000`, `FRONTEND_E2E_PORT=3100 npm run frontend:dev:e2e`, and screenshot `/home/simone/.dev-browser/tmp/us016-timeline-transport-browser.png`.
---
