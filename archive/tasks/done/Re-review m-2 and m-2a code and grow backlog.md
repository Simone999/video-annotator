---
title: Re-review m-2 and m-2a code and grow backlog
type: note
permalink: video-annotator/tasks/re-review-m-2-and-m-2a-code-and-grow-backlog
id: task-re-review-m2-and-m2a-code-and-grow-backlog
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
---

# Re-review m-2 and m-2a code and grow backlog

## Creation Phase

### Description

Review current code against `[[m-2: Review Workspace Completion]]` and `[[m-2a: Mockup UI Shell]]` after the first runtime-fix loop landed. Write one fresh report note, create concrete todo task notes for the next chosen gaps, append matching Ralph stories, then append one cloned re-review story so the audit loop can run again later.

### Scope

- In scope: audit current frontend, backend contracts, tests, and backlog truth against `m-2`, `m-2a`, and `[[Frontend Interaction Spec]]`; write one durable report note; create todo task notes for the next concrete fixes; append matching Ralph stories; append one follow-up re-review story
- Out of scope: implementing new product fixes in this task, deleting prior backlog history, or inventing fake green coverage for missing behavior

### Affected Features

- [[Review Workspace Ergonomics]]
- [[Video Ingest and Exact-Frame Review]]
- [[Export]]

### Acceptance Criteria

- [x] One fresh durable report note exists with clear sections for what is good, what is missing, what is wrong, and what should improve
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
  - none; this task audits current code and backlog artifacts only
- Frontend:
  - none; this task does not change shipped product behavior

### Planned E2E Tests

- Backend:
  - none
- Frontend:
  - none; manual verification of note creation, task creation, and story ordering is sufficient for this audit task

### Planned Implementation

- Step 1: compare current `App.tsx`, `ui-shell`, `live-review-app.tsx`, `video-review` API usage, and backend summary contracts against `[[m-2: Review Workspace Completion]]`, `[[m-2a: Mockup UI Shell]]`, `[[Review Workspace Ergonomics]]`, and `[[Frontend Interaction Spec]]`
- Step 2: write one durable follow-up audit note with explicit good, missing, wrong, and improve sections, then split chosen gaps into todo task notes
- Step 3: update feature and milestone routing, append Ralph fix stories plus one re-review story, and verify note creation plus story order before completion

### Feature Matrix Updates

- Feature note updates needed before or during execution:
  - `[[Review Workspace Ergonomics]]` should record remaining runtime gaps after the first fix loop and link the new follow-up tasks
  - `[[m-2: Review Workspace Completion]]` should link the newly chosen fix tasks because milestone ergonomics still are not complete
  - `[[Milestones Index]]` should index the new audit report note

## Execution Phase

### Implementation Notes

- Follow-up audit confirmed the first runtime-fix loop landed the big gaps from `[[Auditing m-2 and m-2a code gaps 2026-04-21]]`: backend review summaries ship, default library is live, and review surface is single-stage with useful landing plus jump controls.
- Audit also confirmed two remaining live-review gaps against `[[m-2: Review Workspace Completion]]` and `[[Frontend Interaction Spec]]`: no selected-range timeline controls on the live footer, and no frontend wiring for the selected-object summary route.
- Created report note `[[Auditing m-2 and m-2a code gaps 2026-04-21 follow-up]]` plus todo task notes `[[Add live review timeline and selected range controls]]` and `[[Wire live selected-object summary]]`.
- Updated `[[Review Workspace Ergonomics]]`, `[[m-2: Review Workspace Completion]]`, task indexes, `[[Milestones Index]]`, `AGENTS.md`, and Ralph backlog files so future sessions can enter the new task stack directly.

## Wrap-Up Phase

### Verification

- Commands run:
  - `node -e 'require("./tools/ralph/prd.json"); console.log("prd ok")'`
  - `find basic-memory/tasks/todo -maxdepth 1 -type f | sort`
  - `find basic-memory/tasks/done -maxdepth 1 -type f | sort | tail -n 5`
  - `find basic-memory/milestones -maxdepth 1 -type f | sort`
  - `npm run lint`
  - `npm run typecheck`
  - `npm run test`
- Results:
  - `tools/ralph/prd.json` parsed cleanly.
  - Manual verification confirmed report note exists at `basic-memory/milestones/Auditing m-2 and m-2a code gaps 2026-04-21 follow-up.md`, both new todo task notes exist at `basic-memory/tasks/todo/`, and current audit task note now lives in `basic-memory/tasks/done/`.
  - Ralph story order is correct: `US-017` now passes, new fix stories `US-018` and `US-019` follow it, and cloned re-review story `US-020` sits after those fixes.
  - Repo `lint`: pass.
  - Repo `typecheck`: pass.
  - Repo `test`: pass (`14` backend tests, `33` frontend tests).

### Final Summary

Ran the second milestone audit loop, wrote one fresh follow-up gap report, split the remaining live-review work into two focused todo tasks, updated routing notes plus AGENTS guidance, and extended Ralph backlog with matching fix stories plus the next re-review checkpoint.

### Completion Gate

- [x] Acceptance Criteria checkboxes updated to match reality
- [x] Definition of Done checkboxes updated to match reality
- [x] Only now may `status` change to `done`
