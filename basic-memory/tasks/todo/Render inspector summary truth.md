---
title: Render inspector summary truth
type: note
permalink: video-annotator/tasks/render-inspector-summary-truth
id: task-render-inspector-summary-truth
status: todo
completed:
steps:
- creation
- planning
- execution
- wrap_up
tags:
- task
- frontend
- review
- m-2
- summary
- inspector
---

# Render inspector summary truth

## Creation Phase

### Description

Render bbox, confidence, and selected-range counters from backend summary truth in live review inspector.

Read first:
- [[Workflow]]
- [[Video Ingest and Exact-Frame Review]]
- [[SAM2 Shell and Runtime]]
- `docs/spec.md`
- `docs/product/prd.md`
- `docs/ui/video-annotation-mockup.png`
- `frontend/src/features/video-review/components/review-inspector-panel.tsx`
- `frontend/src/features/video-review/components/live-review-screen.tsx`
- `frontend/tests/integration/video-review/live-review-screen.test.tsx`

Stage-2 rule: in planning phase, write concrete test plan and implementation plan first. In execution, follow written plan. Before `done`, run own review plus 2 subagent reviews and fix actionable findings.

### Scope

- In scope: inspector rendering, refresh rules, reviewer-facing copy order, and honest null display for confidence or corrected count
- Out of scope: new backend fields or export controls

### Affected Features

- [[Video Ingest and Exact-Frame Review]]
- [[SAM2 Shell and Runtime]]

### Acceptance Criteria

- [ ] Inspector renders bbox, confidence, and frames/propagated/corrected counters from backend summary data
- [ ] Object label or reviewer-facing summary leads UI, while raw object id stays secondary
- [ ] Range or object changes refresh inspector summary without stale values

### Test Intent

- Backend: none
- Frontend: integration coverage for summary rendering and refresh rules
- Manual: browser-check inspector values and copy against live review layout

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
