---
title: Wire export UI and exported state
type: note
permalink: video-annotator/tasks/wire-export-ui-and-exported-state
id: task-wire-export-ui-and-exported-state
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
- export
- m-5
- library
---

# Wire export UI and exported state

## Creation Phase

### Description

Wire live export trigger or download UI and show real exported/stale state in library and review surfaces.

Read first:
- [[Workflow]]
- [[Export]]
- [[Video Ingest and Exact-Frame Review]]
- [[Export Format]]
- `docs/spec.md`
- `docs/product/prd.md`
- `docs/ui/video-library.png`
- `frontend/src/features/video-library/loader.ts`
- `frontend/src/features/video-library/components/video-library-video-card.tsx`
- `frontend/src/features/video-review/components/review-inspector-panel.tsx`

Stage-2 rule: in planning phase, write concrete test plan and implementation plan first. In execution, follow written plan. Before `done`, run own review plus 2 subagent reviews and fix actionable findings.

### Scope

- In scope: review export trigger, download affordance, library exported-state copy, and stale-export fallback UI
- Out of scope: import or Docker hardening work

### Affected Features

- [[Export]]
- [[Video Ingest and Exact-Frame Review]]

### Acceptance Criteria

- [ ] Live UI can trigger export and expose download path from typed client
- [ ] Library shows real `exported` only when backend derivation says export is current
- [ ] Manual edit after export returns library state to `ready` until next export

### Test Intent

- Backend: none
- Frontend: integration coverage for export UI and library exported-state rendering
- Manual: browser-check export flow and exported/stale state transitions on live routes

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
