---
title: Build native JSON exporter
type: note
permalink: video-annotator/tasks/build-native-json-exporter
id: task-build-native-json-exporter
status: todo
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

Stage-2 rule: in planning phase, write concrete test plan and implementation plan first. In execution, follow written plan. Before `done`, run own review plus 2 subagent reviews and fix actionable findings.

### Scope

- In scope: native JSON manifest generator, deterministic ordering, and stable path semantics in manifest
- Out of scope: PNG artifact emission, API routes, or frontend UI

### Affected Features

- [[Export]]

### Acceptance Criteria

- [ ] Native JSON exporter emits manifest shape from export format note
- [ ] Object, frame, and file ordering stay deterministic across repeated runs
- [ ] Tests prove deterministic JSON output for fixed persisted state

### Test Intent

- Backend: add focused export service tests for deterministic JSON output
- Frontend: none
- Manual: none

### Definition of Done

- [ ] Planning phase records concrete tests and implementation plan before code
- [ ] Own review plus 2 subagent reviews are recorded and actionable findings are fixed
- [ ] Relevant tests and quality checks pass
- [ ] Feature notes, task note, and routing indexes are updated honestly when truth changes

## Planning Phase

### Planned Integration Tests

### Planned E2E Tests

### Planned Implementation

### Feature Matrix Updates

## Execution Phase

### Implementation Notes

## Wrap-Up Phase

### Verification

- Commands run:
- Results:

### Final Summary

### Completion Gate

- [ ] Acceptance Criteria checkboxes updated to match reality
- [ ] Definition of Done checkboxes updated to match reality
- [ ] Only now may `status` change to `done`
