---
title: Fix review canvas playback overlays and sprite thumbnails
type: note
permalink: video-annotator/tasks/fix-review-canvas-playback-overlays-and-sprite-thumbnails
id: task-fix-review-canvas-playback-overlays-and-sprite-thumbnails
status: done
created: 2026-04-26
steps:
- creation
- planning
- execution
- wrap_up
tags:
- task
- frontend
- backend
- review
- playback
- thumbnails
- export
---

# Fix review canvas playback overlays and sprite thumbnails

## Creation Phase

### Description

Fix review stage so play shows overlays, pause stays exact, zoom aligns all stage media, bottom previews stay loaded, and export buttons start download.

### Scope

- In scope: one visible stage renderer, play-time persisted overlays, paused exact-frame reconciliation, annotated-frame preload, thumbnail sprite API and preload, export auto-download.
- Out of scope: changing annotation truth away from backend frame index, draft edit during playback, full demo clone, and unrelated review shell redesign.

### Affected Features

- [[Video Ingest and Exact-Frame Review]]
- [[Export]]

### Acceptance Criteria

- [x] boxes and masks are visible while video plays
- [x] paused stage swaps to backend exact frame for same shown frame index before edit path
- [x] video, exact frame, overlays, and zoom stay aligned on one visible stage
- [x] bottom previews use sprite windows and stay populated during play
- [x] export JSON and PNG buttons start download immediately and still keep fallback link

### Test Intent

- Backend: route and service coverage for annotated-frame bootstrap and sprite output.
- Frontend: unit and integration coverage for play overlays, exact pause swap, stage alignment, sprite preview usage, and export auto-download.

### Definition of Done

- [x] Relevant tests pass
- [x] Typecheck and lint pass or blockers are recorded honestly
- [x] Task wrap-up records exact commands and results
- [x] Durable docs and memory updated for changed contracts or renderer rules

## Planning Phase

### Planned Integration Tests

- Frontend: review screen play/pause/export flows and preview strip behavior.
- Backend: API route checks for new review bootstrap and sprite endpoints.

### Planned E2E Tests

- Frontend: none planned first pass.

### Planned Implementation

- Step 1: add failing backend tests for annotated-frame bootstrap and sprite thumbnails, then implement routes and serializers.
- Step 2: add failing frontend tests for play overlays, single-stage alignment, sprite previews, and export auto-download, then implement canvas stage and caches.
- Step 3: update docs and memory, run focused verification, and record exact truth.

## Execution Phase

### Implementation Notes

- Frontend kept one shared stage box for play and pause instead of drawing base media on a visible canvas.
- Playback overlays now read persisted annotated-frame bootstrap cache, while paused edit overlays still come from exact-frame load.
- Timeline thumbnails now use backend sprite windows plus adjacent preload images.
- Export create now clicks `/api/exports/{export_id}` immediately and still leaves fallback link visible.

## Wrap-Up Phase

### Verification

- Commands run:
  - `npm exec --workspace frontend vitest run tests/unit/video-review/api.test.ts tests/unit/video-review/use-exact-frame.test.tsx tests/unit/video-review/use-sam2-workspace.test.tsx tests/unit/video-review/workspace.test.ts tests/unit/video-review/use-live-review-controller.test.ts tests/unit/video-review/review-transport-controls.test.tsx tests/unit/video-review/review-surface-panel.test.tsx tests/integration/video-review/export-ui-flow.test.tsx --coverage.enabled=false`
  - `npm run typecheck`
  - `npm exec --workspace frontend eslint src/features/video-review/api.ts src/features/video-review/components/review-inspector-panel.tsx src/features/video-review/components/review-surface-panel.tsx src/features/video-review/components/review-transport-controls.tsx src/features/video-review/exact-frame-canvas.tsx src/features/video-review/hooks/use-exact-frame.ts src/features/video-review/hooks/use-live-review-controller.ts src/features/video-review/hooks/use-sam2-workspace.ts src/features/video-review/hooks/use-video-selection.ts src/features/video-review/workspace.ts tests/unit/video-review/api.test.ts tests/unit/video-review/review-transport-controls.test.tsx tests/unit/video-review/review-surface-panel.test.tsx tests/unit/video-review/use-live-review-controller.test.ts tests/unit/video-review/use-exact-frame.test.tsx tests/unit/video-review/use-sam2-workspace.test.tsx tests/unit/video-review/workspace.test.ts tests/integration/video-review/export-ui-flow.test.tsx`
  - `npm run lint`
- Results:
  - Focused frontend tests passed: `8` files, `63` tests.
  - Typecheck passed for backend pyright and frontend `tsc`.
  - Focused frontend eslint passed.
  - Full repo lint still fails on unrelated pre-existing backend file `backend/tests/unit/services/test_review_summaries.py` from import ordering and line length drift.

### Final Summary

- Review playback now shows persisted overlays, play/pause media shares one aligned stage box, thumbnail strip uses sprite windows, and export create auto-starts download.
- Docs and durable memory now record annotated-frame bootstrap, sprite thumbnail route, shared stage geometry rule, and export auto-download rule.

### Completion Gate

- [x] Acceptance Criteria updated to match reality
- [x] Definition of Done updated to match reality
- [x] Only then may status change to done
