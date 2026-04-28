---
title: Add supersession routing for historical roadmap audits
type: note
permalink: video-annotator/tasks/add-supersession-routing-for-historical-roadmap-audits
id: task-add-supersession-routing-for-historical-roadmap-audits
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
- roadmap
- archive
---

# Add supersession routing for historical roadmap audits

## Creation Phase

### Description

Preserve old roadmap audits as dated history, but add explicit routing so readers reach current audit truth without confusing old snapshots for live status. Do not erase history; make age and supersession obvious.

Read first:
- [[Workflow]]
- [[Implementation audit and roadmap 2026-04-28]]
- [[Spec and PRD roadmap parity audit 2026-04-22]]
- [[Repo Current State and Feature Matrix]]
- [[Notes Index]]

Stage-2 rule: in planning phase, write concrete test plan and implementation plan first. In execution, follow written plan. Before `done`, run own review plus 2 subagent reviews and fix actionable findings.

### Scope

- In scope: supersession copy, routing links, and archive-note positioning for dated roadmap audits
- Out of scope: rewriting old dated findings so they pretend to be current

### Affected Features

- [[Video Ingest and Exact-Frame Review]]
- [[SAM2 Shell and Runtime]]
- [[Mask Editing and Cleanup]]
- [[Export]]
- [[Import Existing Boxes]]

### Acceptance Criteria

- [ ] Historical roadmap audits read clearly as dated snapshots, not current repo status
- [ ] Readers can reach latest audit truth from older audit notes without hunting through chat or git history
- [ ] Archive routing preserves historical context while reducing status confusion

### Test Intent

- Backend: none
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
