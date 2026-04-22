---
title: Review m-2 parity and drift
type: note
permalink: video-annotator/tasks/review-m-2-parity-and-drift
id: task-review-m-2-parity-and-drift
status: todo
completed:
steps:
- creation
- planning
- execution
- wrap_up
tags:
- task
- review
- docs
- frontend
- m-2
- ui
---

# Review m-2 parity and drift

## Creation Phase

### Description

Review m-2 code, docs, memory routing, and live review UI after remaining timeline/range work lands. Selected-object summary truth is already shipped and should be treated as baseline, not open scope.

Read first:
- [[Workflow]]
- [[Spec and PRD roadmap parity audit 2026-04-22]]
- [[Video Ingest and Exact-Frame Review]]
- [[SAM2 Shell and Runtime]]
- `docs/spec.md`
- `docs/product/prd.md`
- `docs/ui/video-review.png`
- all linked m-2 task notes

Stage-2 rule: in planning phase, write concrete test plan and implementation plan first. In execution, follow written plan. Before `done`, run own review plus 2 subagent reviews and fix actionable findings.

### Scope

- In scope: code review, docs or memory drift, stale task or milestone links, and UI mismatches against mockup screenshots
- Out of scope: new feature scope beyond m-2 parity fixes

### Affected Features

- [[Video Ingest and Exact-Frame Review]]
- [[SAM2 Shell and Runtime]]

### Acceptance Criteria

- [ ] Run own review plus 2 subagent reviews and fix actionable findings before close
- [ ] Task, milestone, feature, and index notes match shipped m-2 truth after fix pass
- [ ] Live review UI mismatches found during review are fixed or recorded honestly as follow-up gaps

### Test Intent

- Backend: rerun targeted m-2 backend-adjacent checks only if review changes backend-facing code
- Frontend: rerun targeted m-2 unit/integration/browser proof after fixes
- Manual: browser-check route-owned live review against current mockup screenshots after review fixes land

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
