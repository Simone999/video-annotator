---
title: Build native JSON exporter
type: note
permalink: video-annotator/tasks/build-native-json-exporter
id: task-build-native-json-exporter
status: done
completed:
steps:
- creation
- planning
- execution
- wrap_up
tags:
- task
- backend
- export
- m-5
- artifacts
---

# Build native JSON exporter

## Creation Phase

### Description

Build deterministic native JSON export generator from persisted review state.

Read first:
- [[Workflow]]
- [[Export]]
- [[Export Format]]
- [[API]]
- [[Data Model]]
- `docs/spec.md`
- `backend/app/services/frame_annotations.py`

Stage-2 rule: in planning phase, write concrete test plan and implementation plan first. In execution, follow written plan.

### Scope

- In scope: native JSON manifest generator, deterministic ordering, and stable path semantics in manifest
- Out of scope: PNG artifact emission, API routes, or frontend UI

### Affected Features

- [[Export]]

### Acceptance Criteria

- [x] Native JSON exporter emits manifest shape from export format note
- [x] Object, frame, and file ordering stay deterministic across repeated runs
- [x] Tests prove deterministic JSON output for fixed persisted state

### Test Intent

- Backend: add focused export service tests for deterministic JSON output
- Frontend: none
- Manual: none

### Definition of Done

- [x] Planning phase records concrete tests and implementation plan before code
- [x] Own review completed; no subagent reviews were run in this session
- [x] Relevant tests and quality checks pass
- [x] Feature notes, task note, and routing indexes are updated honestly when truth changes

## Planning Phase

### Planned Unit Tests
- `backend/tests/unit/services/test_exports.py`
  - seed one video with two objects whose ids sort differently than insertion order, then assert exported manifest sorts objects by `id`
  - seed mixed frame rows (`manual`, `sam2`, `sam2_edited`) and assert frame keys are ordered stringified canonical indices with exact `is_keyframe`, `source`, `box_xywh_norm`, and `mask_path` presence semantics
  - build manifest twice from same persisted state and assert exact payload equality so deterministic ordering does not depend on incidental query order
  - request export for missing video id and assert explicit not-found error

### Planned Integration Tests

### Planned E2E Tests

### Planned Implementation
- add backend export service module that reads one persisted video, object tracks, and frame annotations into one typed native-export payload
- sort videos, objects, and frame rows deterministically in service query or serialization layer
- serialize only fields allowed by export-format contract:
  - always `version`, `video_id`, `filepath`, `fps`, `frame_count`, `objects`, `frames`, `is_keyframe`, `source`
  - include `box_xywh_norm` only when persisted box exists
  - include `mask_path` only when persisted mask exists
- keep persisted relative `mask_path` untouched; do not resolve to absolute filesystem paths in JSON
- expose service from `app.services` for later API-route reuse

### Feature Matrix Updates
- update `[[Export]]` verification strategy and status after exporter lands
- update supporting export-format docs when shipped JSON contract clarifies string object ids and optional-key omission

## Execution Phase

### Implementation Notes
- added `backend/app/services/exports.py` with one `build_native_json_export_payload` entrypoint and explicit `ExportVideoNotFoundError`
- service reads persisted video, object track, and frame-annotation rows, orders by stable ids and canonical frame indices, and emits JSON-ready dict payloads without inventing `null` or absolute-path values

## Wrap-Up Phase

### Verification

- Commands run:
- `uv run --project backend pytest backend/tests/unit/services/test_exports.py -q`
- `uv run --project backend pytest -q`
- `npm run typecheck`
- `npm run lint`
- `npm run test`
- raw frontend coverage shards from `frontend/` on this same revision:
  - batch1 app or tooling or app-route tests
  - batch2 video-library tests
  - batch3 review-page or live-review integration tests
  - batch4 video-review api or workspace hook tests
  - batch5a controller mask-cleanup or object-delete tests
  - batch5b1 controller bootstrap or form-handling tests
  - batch5b2 controller selected-range or propagation tests
  - batch6 exact-frame-canvas or state or review-screen unit tests
- merged shard JSON with `istanbul-lib-coverage`
- Results:
- focused export unit shard passed
- full backend suite passed: `146 passed in 13.01s`
- lint passed
- typecheck passed
- `npm run test` failed only after backend coverage passed because frontend monolithic Vitest coverage OOMed on current branch
- backend coverage gate inside `npm run test` passed at statements `97.36%` and branches `90.64%` before frontend OOM
- merged same-revision frontend shard coverage passed at `95.05%` lines and `90.21%` branches
- own review completed; no subagent reviews were run in this session

### Final Summary
Backend now has a deterministic native JSON export primitive for one persisted video. Manifest output keeps stable string object ids, canonical string frame keys, relative mask paths, and omits missing optional fields instead of inventing placeholder values.

### Completion Gate

- [x] Acceptance Criteria checkboxes updated to match reality
- [x] Definition of Done checkboxes updated to match reality
- [x] Only now may `status` change to `done`
