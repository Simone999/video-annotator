---
title: Implementation audit and roadmap 2026-04-28
type: note
permalink: video-annotator/notes/implementation-audit-and-roadmap-2026-04-28
tags:
- notes
- audit
- roadmap
- status
- snapshot
---

# Implementation audit and roadmap 2026-04-28

## Superseded update

This dated audit was superseded later on 2026-04-28 by shipped `m-7` hardening work.

Current truth after those shipped tasks:
- compose Playwright runner is real, not placeholder
- Docker command surface and release verification task both ship as task history
- fresh host verification is green
- canonical Docker release path is still blocked in this workspace by Docker daemon `500` errors before container start
- import remains blocked product scope

Use this note as historical roadmap context, not live remaining-work routing.

Read set:
- durable product, API, engineering, and feature notes under `basic-memory/spec/` and `basic-memory/features/`
- archive milestone, task, and audit history under `archive/milestones/`, `archive/tasks/`, and `archive/notes/`
- shipped code under `backend/app/` and `frontend/src/`
- shipped tests under `backend/tests/`, `frontend/tests/`, and `tests/e2e/`

## Truth order

- current code + tests + durable feature notes first
- archive milestone status second
- legacy PRD last when conflict exists

## Implemented now

- video library + route-owned review flow ship on `/` and `/review/:videoId`
- exact-frame review uses backend-decoded canonical `frame_idx`, not browser time
- stable object identity + manual box create, edit, reload, move, resize, and delete ship on paused canonical frame
- timeline-first transport, selected range, and selected-object summary ship from backend truth
- SAM2 session create or reuse, prompt-box, propagation jobs, polling, cancel, and persisted mask reopen ship
- same-frame refine, frame-local mask cleanup, whole-object cleanup, and whole-track delete ship
- export create + download ship with deterministic zip artifact, native `annotations.json`, PNG mask copy, and real `exported -> ready` freshness fallback

Evidence anchors:
- `backend/app/api/videos.py`
- `backend/app/services/sam2.py`
- `backend/app/services/exports.py`
- `backend/app/services/review_summaries.py`
- `frontend/src/features/video-review/hooks/use-live-review-controller.ts`
- `frontend/src/features/video-review/hooks/use-sam2-workspace.ts`
- `frontend/tests/integration/video-review/live-review-screen.test.tsx`
- `backend/tests/integration/api/test_sam2_shell_runtime.py`
- `backend/tests/integration/api/test_export_api.py`
- `backend/tests/integration/api/test_review_summary_contracts.py`
- `frontend/tests/integration/video-review/export-ui-flow.test.tsx`

## Partially implemented now

- Docker E2E and release hardening are partial:
  - backend and frontend container artifacts exist
  - compose stack exists
  - Playwright runner in compose is still placeholder text, not real test execution
  - host E2E exists, but release verification workflow is still open
- import review-state scaffolding exists only as groundwork:
  - backend can derive `review_state = "started"` from `imported` rows
  - frontend library types and loaders already understand `started` and `imported_frame_count`
  - no real import workflow ships on top of that scaffolding

Evidence anchors:
- `docker-compose.e2e.yml`
- `backend/Dockerfile.e2e`
- `frontend/Dockerfile.e2e`
- `tests/e2e/playwright.config.ts`
- `tests/e2e/global.setup.ts`
- `backend/app/services/review_summaries.py`
- `frontend/src/features/video-library/loader.ts`

## Not implemented now

- current-pipeline import contract
- importer translation service
- import API route and validation
- frontend import entry
- reimport overwrite or reset behavior
- real Docker Playwright execution path
- release verification workflow
- final hardening parity closeout

## Roadmap

1. Finish `m-7` first.
   - replace placeholder Playwright runner in `docker-compose.e2e.yml`
   - make Docker path run same route and review flows host E2E already proves
   - add explicit Docker E2E command surface and release verification steps
2. Close archive bookkeeping drift after `m-7`.
   - mark `m-4` done
   - mark `m-5` done
   - refresh stale archive audits that still say refine or export are missing
3. Unblock `m-6` only after contract truth exists.
   - write exact pipeline field mapping
   - write reimport overwrite or reset semantics
   - then land importer, import route, review-state transitions, and frontend entry
4. Keep doc cleanup narrow.
   - old PRD still says visible `Open Review` button
   - old PRD still says inspector counters are `frames / propagated / corrected`
   - current shipped docs say whole-card open and visible `Manual / Missing / Propagated`

## Drift found

- `archive/milestones/in_progress/m-4 - Mask Editing and Cleanup.md` still reads `in_progress`, but later task history plus durable feature note read shipped
- `archive/milestones/planned/m-5 - Export Workflow and Exported State.md` still reads `planned`, but export task stack plus durable feature note read shipped
- `archive/notes/Repo Current State and Feature Matrix.md` still says mask editing is partial and export is missing
- `archive/notes/Spec and PRD roadmap parity audit 2026-04-22.md` is stale for SAM2 runtime, mask editing, and export

## Observations

- [status] Core review path, SAM2 runtime path, refine and cleanup path, and export path all ship now; biggest real product gap is import. #status #roadmap
- [status] Biggest real hardening gap is Docker E2E execution plus release verification, not feature delivery for review or export. #hardening #roadmap
- [drift] Archive milestone and audit notes lag later implementation work, especially `m-4` and `m-5`. #archive #drift
- [guardrail] Roadmap decisions should follow current code, tests, and durable feature notes before stale archive bookkeeping or legacy PRD wording. #workflow #truth

## Relations

- relates_to [[Repo Current State and Feature Matrix]]
- relates_to [[Spec and PRD roadmap parity audit 2026-04-22]]
- relates_to [[Video Ingest and Exact-Frame Review]]
- relates_to [[Annotation Foundation and Manual Box Workflow]]
- relates_to [[SAM2 Shell and Runtime]]
- relates_to [[Mask Editing and Cleanup]]
- relates_to [[Export]]
- relates_to [[Import Existing Boxes]]
- relates_to [[m-4: Mask Editing and Cleanup]]
- relates_to [[m-5: Export Workflow and Exported State]]
- relates_to [[m-6: Import Existing Boxes]]
- relates_to [[m-7: Docker E2E and Release Hardening]]
