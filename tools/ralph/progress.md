## Codebase Patterns
- Keep default frontend host swaps isolated in `frontend/src/app/App.tsx`; preserve the live review UI in `frontend/src/app/live-review-app.tsx` so mockup-shell work stays out of `frontend/src/features/video-review`.
- Keep live-review browser proof opt-in: `frontend/src/app/App.tsx` should mount `LiveReviewApp` only behind `?app=live-review`, while the default host stays shell-first.
- Keep default-host live library fetching in `frontend/src/features/ui-shell/api.ts` plus `loader.ts`; app-host tests should mock HTTP plus `./live-review-app`, while lower `shell-host.test.tsx` stays loader-mocked for fixture review-shell proof.
- Add explicit `afterEach(cleanup)` in multi-test frontend integration files; repeated `render` calls can leak DOM between Vitest cases in this repo.
- Default shell data should flow only through `frontend/src/features/ui-shell/loader.ts`; keep shell fixtures local and static so UI-shell stories stay backend-free.
- Do not treat default `frontend/src/app/App.tsx` shell proof as live review proof; live ergonomics stories must mount `frontend/src/app/live-review-app.tsx` or another harness that exercises `useVideoReviewWorkspace`.
- Keep `frontend/src/features/ui-shell/library-page.tsx` presentational; local shell page switches and selected fixture state belong in `frontend/src/features/ui-shell/shell-host.tsx`.
- Keep `frontend/src/features/ui-shell/review-page.tsx` presentational too; shell-local selected object state belongs in `frontend/src/features/ui-shell/shell-host.tsx`.
- Keep explicit shell navigation affordances such as `Back to Library` prop-driven from `frontend/src/features/ui-shell/shell-host.tsx`; do not add router or page-local navigation state inside presentational shell pages.
- Gate library propagation progress on `video.state === "in_progress"`; percent presence alone is not enough to show shell progress UI.
- Do not treat fixture-shell `Exported` badge or `annotations.json + masks/*.png` mock copy as live export proof; export stories need real backend routes, artifact generation, and download-workflow evidence.
- Derive live library `review_state`, `propagation_progress_percent`, and `review_summary` in `backend/app/services/review_summaries.py` from persisted annotation sources plus active `sam2_propagation` jobs; do not emit `exported` until export completion is actually persisted.
- When backend API integration tests swap `APP_DB_URL`, clear `get_engine.cache_clear()` and `get_session_factory.cache_clear()` before building the app or pytest can talk to stale SQLite state.
- Re-query the live-review `Exact frame canvas` after `Load frame` in DOM or browser tests; exact-frame reload can remount the canvas node and stale refs will drop later drag or resize events.
- Keep manual-box move and resize commits tied to final `pointerup` coordinates in `frontend/src/features/video-review/exact-frame-canvas.tsx`; do not assume a prior `pointermove` always carried the last position.
- Reuse manifest `annotated_frames` and `keyframes` from `backend/app/api/videos.py` and `frontend/src/features/video-review/workspace.ts` for useful-frame landing and annotated or keyframe navigation before inventing new frame-summary routes.
- Treat `frontend/src/app/live-review-app.tsx` as legacy split-pane harness; m-2 runtime UX tasks should migrate behavior into one single-stage review surface instead of extending both panes further.
- Prefer real timers in `frontend/src/app/live-review-app.test.tsx` polling workflows; fake timers can stall Testing Library `findBy...` waits around MSW-backed job polling.
- For Ralph testing-plan stories on unshipped features, cite prerequisite shipped evidence in task or feature notes and keep absent workflows blocked with exact reasons instead of inventing placeholder green suites.

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

## 2026-04-21 07:02:50 CEST - US-008
- Added backend API integration coverage for manifest-backed object creation, manual annotation upsert or reload with `mask: null`, update, delete, wrong-video object rejection, and invalid-frame rejection.
- Added live-review frontend integration coverage for create object, draw-save, reload, move, resize, and delete of saved manual boxes, and hardened `ExactFrameCanvas` move or resize commits around final `pointerup` coordinates.
- Files changed: `backend/tests/api/test_annotation_foundation_manual_box.py`, `frontend/src/app/live-review-app.test.tsx`, `frontend/src/features/video-review/exact-frame-canvas.tsx`, `AGENTS.md`, `basic-memory/features/Annotation Foundation and Manual Box Workflow.md`, `basic-memory/tasks/{done/Testing annotation foundation and manual box workflow,done/Done Tasks Index,in_progress/In Progress Tasks Index,todo/Todo Tasks Index}.md`, `tools/ralph/prd.json`, `tools/ralph/progress.md`.
- **Learnings for future iterations:**
  - Patterns discovered: re-query the live-review canvas after `Load frame`; exact-frame reload can remount the node and stale refs stop later drag or resize events in DOM and browser tests.
  - Patterns discovered: manual-box move or resize commits are safer when derived from final `pointerup` coordinates instead of relying only on prior `pointermove` state.
  - Gotchas encountered: real backend object ids are generated values, so browser smoke should select saved-box elements generically instead of hard-coding `object-1`.
  - Useful context: browser smoke artifact for this story lives at `/tmp/us-008-live-manual-box.png`.
---

## 2026-04-21 07:19:14 CEST - US-009
- Added backend API integration coverage for SAM2 session create or reuse, prompt-box persistence, propagation completion, job cancellation, session close or reopen, and reopened persisted masks with a fake adapter at the real FastAPI boundary.
- Added live-review frontend integration coverage for Run SAM2, propagation polling, cancel, and reopened persisted mask overlay, and updated feature or task memory so shell trust stays separate from blocked real-runtime trust.
- Files changed: `backend/tests/api/test_sam2_shell_runtime.py`, `frontend/src/app/live-review-app.test.tsx`, `AGENTS.md`, `basic-memory/features/SAM2 Shell and Runtime.md`, `basic-memory/tasks/{done/Testing SAM2 shell and runtime,done/Done Tasks Index,in_progress/In Progress Tasks Index}.md`, `tools/ralph/prd.json`, `tools/ralph/progress.md`.
- **Learnings for future iterations:**
  - Patterns discovered: live-review polling tests are steadier with real timers; fake timers can stall Testing Library `findBy...` waits when MSW-backed job polling is in play.
  - Gotchas encountered: SAM2 mask paths in persisted route payloads include the `masks/` prefix, so backend tests should assert the real stored relative path instead of guessing a shorter contract.
  - Useful context: no manual local-runtime proof was added here because default adapter methods in `backend/app/services/sam2.py` still raise `NotImplementedError`.
---

## 2026-04-21 08:38:15 CEST - US-010
- Replaced placeholder `Mask Editing and Cleanup` verification tables with real prerequisite evidence for persisted-mask reopen, plus explicitly blocked refine, brush, one-frame cleanup, and whole-object cleanup scenarios.
- Moved `Testing mask editing and cleanup` through task-note lifecycle, recorded test-layer choices, and added root guidance for future Ralph stories that document missing features without inventing fake green suites.
- Files changed: `AGENTS.md`, `basic-memory/features/Mask Editing and Cleanup.md`, `basic-memory/tasks/{todo/Todo Tasks Index,in_progress/In Progress Tasks Index,done/Testing mask editing and cleanup,done/Done Tasks Index}.md`, `tools/ralph/prd.json`, `tools/ralph/progress.md`.
- **Learnings for future iterations:**
  - Patterns discovered: when feature code is absent, use existing shipped tests only as prerequisite evidence and keep future backend or frontend workflows blocked with exact missing route or UI reasons.
  - Gotchas encountered: `Delete saved box` proof in `live-review-app.test.tsx` deletes full manual annotation rows; do not mislabel it as frame-local mask cleanup coverage.
  - Useful context: prerequisite evidence for this story is `backend/tests/api/test_sam2_shell_runtime.py` and `frontend/src/app/live-review-app.test.tsx`; no browser artifact exists because refine and cleanup flows are still unshipped.
---

## 2026-04-21 08:47:55 CEST - US-011
- Replaced minimal `Export` note with real prerequisite evidence for relative mask paths and `mask: null` manual rows, plus explicitly blocked backend create or download or determinism work and live frontend export workflows.
- Moved `Testing export` through task-note lifecycle, recorded test-layer choices, manual artifact-inspection steps, and reusable shell-export guardrails for future stories.
- Files changed: `AGENTS.md`, `basic-memory/features/Export.md`, `basic-memory/tasks/{todo/Todo Tasks Index,done/Testing export,done/Done Tasks Index}.md`, `tools/ralph/prd.json`, `tools/ralph/progress.md`.
- **Learnings for future iterations:**
  - Patterns discovered: fixture-shell exported chrome is mockup-only; real export proof starts from backend artifact routes and live download UI.
  - Patterns discovered: current export prerequisites live in frame-annotation `mask_path` storage tests, SAM2 mask reopen or download tests, and manual-row `mask: null` persistence tests.
  - Gotchas encountered: shell review mock copy mentions `annotations.json + masks/*.png`, but that text does not mean any typed export client or artifact generator exists.
  - Useful context: no browser artifact exists for this story because export routes and UI are still unshipped.
---

## 2026-04-21 09:06:10 CEST - US-012
- Audited current code against `m-2` and `m-2a`, wrote durable report note `basic-memory/milestones/Auditing m-2 and m-2a code gaps 2026-04-21.md`, and split remaining runtime work into four concrete todo task notes.
- Appended matching Ralph fix stories `US-013` through `US-016`, then appended cloned re-review story `US-017`, while updating milestone, feature, task-index, and AGENTS routing around the new backlog.
- Files changed: `AGENTS.md`, `basic-memory/features/Review Workspace Ergonomics.md`, `basic-memory/milestones/{Auditing m-2 and m-2a code gaps 2026-04-21,Milestones Index,in_progress/m-2 - Review Workspace Completion}.md`, `basic-memory/tasks/{in_progress/Review m-2 and m-2a code and grow backlog,todo/Add review navigation controls,todo/Build live single-stage review,todo/Ship review summary contracts,todo/Wire live library shell,todo/Todo Tasks Index}.md`, `tools/ralph/prd.json`, `tools/ralph/progress.md`.
- **Learnings for future iterations:**
  - Patterns discovered: reuse manifest `annotated_frames` and `keyframes` for useful-frame landing and frame-jump work before inventing new summary routes.
  - Patterns discovered: `live-review-app.tsx` is still split-pane legacy harness; future m-2 runtime UI work should migrate behavior into one single-stage review surface.
  - Gotchas encountered: Basic Memory move paths should stay project-relative like `tasks/in_progress/...`; passing `basic-memory/...` can create nested `basic-memory/basic-memory/...` paths on disk.
  - Useful context: audit report note is `[[Auditing m-2 and m-2a code gaps 2026-04-21]]`; follow-up tasks are `[[Ship review summary contracts]]`, `[[Wire live library shell]]`, `[[Build live single-stage review]]`, and `[[Add review navigation controls]]`.
---

## 2026-04-21 09:29:32 CEST - US-013
- Implemented backend-derived review summary contracts for video list, detail, and manifest payloads, plus `GET /api/videos/{video_id}/objects/{object_id}/summary` for live inspector wiring.
- Updated docs, AGENTS guidance, feature or spec memory, and task lifecycle notes to record honest runtime limits: no emitted `exported` state without export persistence, and `mask_confidence` or `track_summary.corrected` stay `null` until backing provenance exists.
- Files changed: `backend/app/{api/videos.py,schemas/{__init__,video}.py,services/{__init__,review_summaries}.py}`, `backend/tests/api/test_review_summary_contracts.py`, `docs/engineering/{api,architecture,data-model}.md`, `AGENTS.md`, `basic-memory/{features/Review Workspace Ergonomics,spec/engineering/{API,Data Model},tasks/{done/Ship review summary contracts,done/Done Tasks Index,in_progress/In Progress Tasks Index,todo/Todo Tasks Index}}.md`, `tools/ralph/{prd.json,progress.md}`.
- **Learnings for future iterations:**
  - Patterns discovered: derive live library summary fields from persisted annotation sources plus active `sam2_propagation` jobs in one backend read-model service, not in frontend shell loaders.
  - Patterns discovered: selected-object summary can ship partial truth now by returning `null` for unpersisted confidence or correction provenance instead of inventing fake counters.
  - Gotchas encountered: `dict(session.execute(...))` on SQLAlchemy result objects looked concise but broke runtime and typing; use explicit typed row loops for aggregate maps.
  - Useful context: verification commands were `npm run lint`, `npm run typecheck`, and `npm run test`, with repo `test` finishing at `14` backend tests plus `27` frontend tests passing.
---

## 2026-04-21 09:56:20 CEST - US-014
- Replaced fixture-only default library loading with typed backend `/api/videos` fetching in `frontend/src/features/ui-shell/api.ts` and `loader.ts`, mapped honest shell summary metrics plus card copy from review-summary fields, and added empty/error library states.
- Preserved local `shell-host.tsx` page state while bridging live-library `Open Review` into `LiveReviewApp` through `initialVideoId` plus `Back to Library`, then updated docs, AGENTS, and durable feature/task notes to reflect that default app startup is live-library-first while review layout is still legacy split-pane.
- Files changed: `frontend/src/app/{App.test,app.css,live-review-app}.tsx`, `frontend/src/features/ui-shell/{api,fixtures,library-page,loader,preview,shell-host,shell-host.test,types}.ts*`, `docs/engineering/architecture.md`, `AGENTS.md`, `basic-memory/{features/{Review Workspace Ergonomics,Video Ingest and Exact-Frame Review},tasks/{done/Wire live library shell,done/Done Tasks Index,todo/Todo Tasks Index}}.md`, `tools/ralph/{prd.json,progress.md}`.
- **Learnings for future iterations:**
  - Patterns discovered: keep live library mapping in `ui-shell/api.ts` and `ui-shell/loader.ts`, not in `video-review/api.ts`, so default-host library evolution stays isolated from live review workspace contracts.
  - Patterns discovered: default-host tests for live library should mock HTTP plus `./live-review-app`, while `shell-host.test.tsx` stays loader-mocked to preserve fixture review-shell coverage without backend coupling.
  - Gotchas encountered: stale local listeners on `127.0.0.1:8000` and `5173` can fake browser-smoke results; kill old processes before trusting default-host smoke on fresh code.
  - Useful context: browser smoke against fresh `backend:dev:e2e` plus `frontend:dev:e2e` indexed `bedroom.mp4` and `smoke.mp4`, then saved `/tmp/us-014-live-library-shell.png` and `/tmp/us-014-live-review-entry.png`.
---
