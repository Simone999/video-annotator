---
title: Reset Ralph backlog for mockup UI shell
type: plan
permalink: video-annotator/plans/active/reset-ralph-backlog-for-mockup-ui-shell
status: done
tags:
- plan
- ralph
- backlog
- frontend
- ui
---

# Reset Ralph backlog for mockup UI shell

Reset the Ralph backlog after `m-1` completion, archive the old finished backlog, and seed a fresh UI-first backlog for the mockup shell plus remaining testing work.

## Summary

- Goal: archive the finished annotation-foundation Ralph backlog, create a fresh `prd.json` and `progress.md`, and seed memory with the new UI-only milestone and task split.
- Success criteria: old Ralph files are archived, new Ralph files target `ralph/m-2a-mockup-ui-shell`, UI shell tasks and refreshed testing tasks exist in memory, and the new backlog starts with the UI-only milestone work.
- Audience: future Ralph agents and humans starting the next milestone from a clean session.

## Current State

- Existing behavior: `tools/ralph/prd.json` still points at finished `m-1` stories and every story has `passes: true`.
- Main gaps: there is no fresh backlog for the agreed UI-only shell milestone; current todo testing tasks need refreshed boundaries and better test-note routing.
- Constraints: keep current todo tasks, do not archive them, keep work UI-only for the new milestone, and write new notes in memory-first repo style.

## Assumptions And Open Questions

- Locked assumptions:
  - new Ralph branch is `ralph/m-2a-mockup-ui-shell`
  - old Ralph backlog must be archived, not reused in place
  - new PRD restarts story ids from `US-001`
  - UI shell is default app entry for the new milestone
  - shell work is fixture-backed, local-state-only, and backend-free
  - testing tasks must re-think integration vs E2E boundaries and cite test notes directly
- Open questions:
  - none for this reset pass

## Affected Features

- [[Review Workspace Ergonomics]]
- [[Video Ingest and Exact-Frame Review]]
- [[Annotation Foundation and Manual Box Workflow]]
- [[SAM2 Shell and Runtime]]
- [[Mask Editing and Cleanup]]
- [[Export]]

## Task Breakdown

1. [[Reset Ralph backlog for mockup UI shell]] — archive old Ralph files, refresh memory tracking notes, and seed the new backlog
2. [[Build UI shell fixture foundation]] — default app shell host and fixture boundary
3. [[Build video library mockup shell]] — library screen from mockup
4. [[Build review page mockup shell]] — review screen from mockup
5. [[Wire page actions and local UI state]] — page-to-page shell flow
6. [[Add UI integration tests for shell]] — default proof layer for the shell

## Handoff Notes

- Read `[[Workflow]]`, `[[Review Workspace Ergonomics]]`, `[[Frontend Interaction Spec]]`, `[[frontend-integration-tests]]`, and `[[e2e-tests]]` first.
- Keep shell tasks UI-only: no backend routes, no live review reducer work, no router library.
- Refresh testing tasks before loading them into the new Ralph backlog so future agents do not inherit stale test boundaries.

## Outcome

- Completed on 2026-04-21.
- Old Ralph backlog moved to `tools/ralph/archive/2026-04-21-m-1-annotation-foundation-complete/`.
- New Ralph backlog targets `ralph/m-2a-mockup-ui-shell`.
- Memory now contains the new planned milestone, five UI-shell todo tasks, and refreshed testing tasks with explicit test-note routing.

## Observations

- [decision] Finished Ralph backlogs should be archived whole with both `prd.json` and `progress.md` before a fresh branch backlog is created. #ralph #backlog
- [decision] The next Ralph backlog starts with UI-only mockup shell work and then carries forward the remaining testing tasks. #ralph #ui
- [testing] Test tasks must re-think integration and E2E boundaries explicitly and point to the test guidance notes instead of copying stale test habits. #testing #memory

## Relations

- indexed_by [[Done Plans Index]]
- relates_to [[Workflow]]
- relates_to [[Review Workspace Ergonomics]]
- relates_to [[frontend-integration-tests]]
- relates_to [[e2e-tests]]
