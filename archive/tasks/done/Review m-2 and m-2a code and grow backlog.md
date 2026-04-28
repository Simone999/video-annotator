---
id: task-review-m2-and-m2a-code-and-grow-backlog
title: Review m-2 and m-2a code and grow backlog
status: done
completed: 2026-04-21
steps:
- creation
- planning
- execution
- wrap_up
tags:
- task
- review
- backlog
- roadmap
- milestone
permalink: video-annotator/tasks/review-m2-and-m2a-code-and-grow-backlog
---

## Creation Phase

### Description

Review current code against `[[m-2: Review Workspace Completion]]` and `[[m-2a: Mockup UI Shell]]`. Write one detailed report note, create concrete fix tasks from the gaps, append matching fix stories to `tools/ralph/prd.json`, then append a cloned copy of this review task after those new fix stories so the review or fix loop continues.

### Scope

- In scope: audit current frontend, backend contracts, tests, and backlog shape against `m-2` and `m-2a`; write one durable report note; create todo task notes for concrete fixes; append matching Ralph stories; append one follow-up re-review story after the new fix stories
- Out of scope: implementing the fixes in the same task, deleting existing backlog items, or archiving current todo tasks

### Affected Features

- [[Review Workspace Ergonomics]]
- [[Video Ingest and Exact-Frame Review]]
- [[Annotation Foundation and Manual Box Workflow]]

### Acceptance Criteria

- [x] One durable report note exists with clear sections for what is good, what is missing, what is wrong, and what should improve
- [x] Every concrete gap chosen for implementation becomes one todo task note with enough context for a clean-session implementer
- [x] Matching fix stories are appended to `tools/ralph/prd.json`
- [x] One cloned re-review story is appended after the new fix stories so the loop can run again later
- [x] Task note wrap-up records exactly which report note and which new tasks or stories were created

### Test Intent

- Backend: none
- Frontend: none
- Manual: verify report note exists, new fix tasks exist, Ralph story order is correct, and the cloned re-review story sits after the newly added fix stories

### Definition of Done

- [x] Report note created
- [x] New fix task notes created
- [x] `tools/ralph/prd.json` updated
- [x] Verification recorded honestly

## Planning Phase

### Planned Integration Tests

- Backend:
  - none; this task audits current contracts and writes backlog artifacts only
- Frontend:
  - none; this task does not change product behavior or test code

### Planned E2E Tests

- Backend:
  - none
- Frontend:
  - none; manual verification of note creation and story ordering is enough for this audit task

### Planned Implementation

- Step 1: compare `App.tsx`, `ui-shell`, `live-review-app.tsx`, `video-review` state, and backend video routes against `[[m-2: Review Workspace Completion]]`, `[[m-2a: Mockup UI Shell]]`, `[[Review Workspace Ergonomics]]`, and `[[Frontend Interaction Spec]]`
- Step 2: write one durable audit note with explicit good, missing, wrong, and improve sections, then split chosen fixes into todo task notes
- Step 3: update milestone and feature routing, then append Ralph fix stories and one re-review story after manual verification confirms note creation and story order

### Feature Matrix Updates

- Feature note updates needed before or during execution:
  - `[[Review Workspace Ergonomics]]` should point at the audit report and new follow-up tasks so future sessions can move from feature truth into concrete fix work
  - `[[m-2: Review Workspace Completion]]` should link the chosen fix tasks because the milestone checklist still fails for live runtime ergonomics

## Execution Phase

### Implementation Notes

- Audit confirmed `m-2a` shell work is complete and well-isolated in `frontend/src/app/App.tsx`, `frontend/src/features/ui-shell/loader.ts`, and `frontend/src/features/ui-shell/shell-host.tsx`.
- Audit confirmed live runtime still lags milestone `m-2`: default host is fixture-only, backend summary contracts are thin, `frontend/src/app/live-review-app.tsx` still uses split playback/exact-frame panes, and live controls still miss useful landing, frame jumps, keyboard shortcuts, and mask opacity.
- Chosen fix split: backend summary contracts first, then live library wiring, then live single-stage review layout, then review controls.
- Created audit report note `[[Auditing m-2 and m-2a code gaps 2026-04-21]]` plus todo task notes `[[Ship review summary contracts]]`, `[[Wire live library shell]]`, `[[Build live single-stage review]]`, and `[[Add review navigation controls]]`.
- Updated milestone and feature routing so future sessions can move from `[[m-2: Review Workspace Completion]]` and `[[Review Workspace Ergonomics]]` into the new task stack directly.

## Wrap-Up Phase

### Verification

- Commands run:
  - `npm run typecheck`
  - `npm run lint`
  - `npm run test`
  - `jq empty tools/ralph/prd.json`
  - `rg -n '"id": "US-01[2-7]"|"priority": 1[2-7]|"passes": (true|false)' tools/ralph/prd.json`
  - `find archive/tasks/todo -maxdepth 1 -type f | sort`
- Results:
  - Repo-wide typecheck passed.
  - Repo-wide lint passed.
  - Repo-wide tests passed: backend `12 passed`; frontend `8 files, 27 tests passed`.
  - `tools/ralph/prd.json` parsed cleanly with `jq`.
  - Manual verification confirmed `US-012` now passes, four new fix stories `US-013` through `US-016` follow it, and cloned re-review story `US-017` sits after those fixes.
  - Manual verification confirmed todo tasks exist for the four chosen fixes and the audit report note exists at `basic-memory/milestones/Auditing m-2 and m-2a code gaps 2026-04-21.md`; those todo task notes now live under `archive/tasks/todo/`.

### Final Summary

Audited current `m-2` and `m-2a` repo truth, wrote one durable gap report, split the remaining runtime backlog into four concrete fix tasks, and extended Ralph backlog with matching stories plus a follow-up re-review loop. Verification stayed at repo-quality and tracking-file level because this story changes backlog truth, not product behavior.

### Completion Gate

- [x] Acceptance Criteria checkboxes updated to match reality
- [x] Definition of Done checkboxes updated to match reality
- [x] Only now may `status` change to `done`
