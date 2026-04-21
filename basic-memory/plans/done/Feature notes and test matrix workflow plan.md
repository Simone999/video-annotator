---
title: Feature notes and test matrix workflow plan
type: plan
status: done
permalink: video-annotator/plans/feature-notes-and-test-matrix-workflow-plan
tags:
- plan
- features
- testing
- workflow
- source-of-truth
---

# Feature notes and test matrix workflow plan

This plan establishes a new durable feature workflow in memory. Goal: every current expected feature gets one source-of-truth feature note under `basic-memory/features/`, one task note under `basic-memory/tasks/`, and explicit integration, e2e, and manual test matrices that record what is tested, what is blocked, and what still needs real-world verification.

## Summary
- Add new canonical memory area: `basic-memory/features/`.
- Keep executable task records in `basic-memory/tasks/`.
- Organize current expected features by capability area, using current state note as seed.
- Make each feature note the source of truth for behavior, contracts, evidence, gaps, and testing status.
- Update `AGENTS.md` so no feature work starts before its feature note exists, its tables are filled, and TDD starts from those tables.

## Planned deliverables
1. Create `basic-memory/features/Features Index.md` and `basic-memory/features/Feature Template.md`.
2. Create capability feature notes for:
- Video ingest and exact-frame review
- Annotation foundation and manual box workflow
- Review workspace ergonomics
- SAM2 shell and runtime
- Mask editing and cleanup
- Export
- Import existing boxes
3. Create task notes in `basic-memory/tasks/` for feature-level testing work across those capability areas.
4. Update `basic-memory/Memory Index.md`, `basic-memory/plans/Plans Index.md`, and `basic-memory/notes/Repo Current State and Feature Matrix.md` to point at the new feature notes.
5. Update `AGENTS.md` so feature-note creation, test-matrix planning, and TDD become mandatory before feature implementation starts.

## Feature note contract
Every feature note must contain:
- Goal and user-visible workflows
- Current shipped state
- Target behavior and known gaps
- Backend/frontend contracts
- Dependencies and evidence
- Integration table
- E2E table
- Manual test table
- Linked task notes

### Integration table columns
`ID | Surface | Scenario | Real-World Why | Setup/Fixtures | Automation Status | Evidence`

### E2E table columns
`ID | Surface | Scenario | Real-World Workflow | Environment | Automation Status | Evidence`

### Manual table columns
`ID | Scenario | Setup | Steps | Expected Result | Execution Status | Execution Notes`

`Execution Status` must use exact values:
- `✅ Done`
- `⚠️ Partially`
- `❌ Not Done`

## Task note policy
- Each capability feature gets one task note that describes the work needed to add backend and frontend e2e coverage and to maintain the feature note tables.
- Task notes stay in `basic-memory/tasks/`.
- Feature notes stay in `basic-memory/features/`.

## Test policy
- Existing behavior should get runnable automated tests over time.
- Missing behavior must be recorded honestly as blocked rows in feature notes instead of fake green checks.
- Manual frontend verification must exist for every feature note, even when current status is blocked or partial.
- Test scenarios must be based on real operator workflows or real failure modes, not endpoint names alone.

## AGENTS.md policy changes
Before coding a feature, an agent must:
1. Read `AGENTS.md`
2. Read relevant memories and docs
3. Read the relevant feature note
4. If feature note does not exist, create it from `Feature Template`
5. Fill or update the integration, e2e, and manual tables
6. Create or update the task note in `basic-memory/tasks/`
7. Think through real-world scenarios and choose initial TDD targets from those tables
8. Only then start implementation

## Assumptions
- Capability slices by area are the chosen feature granularity.
- Current expected features come from `Repo Current State and Feature Matrix` and related milestone/spec notes.
- `docs/` remains reference documentation, while memory feature notes become workflow truth for future implementation and testing work.

## Execution Log
1. Task 1 complete: created `basic-memory/features/`, added `[[Features Index]]`, added `[[Feature Template]]`, and updated top-level memory routing. Task-level spec and quality review both passed after wording and routing fixes.
2. Task 2 complete: created the first three feature notes for video ingest, manual box workflow, and review workspace ergonomics. Task-level review forced cleanup of placeholder wording, evidence links, and blocked-vs-shipped separation before approval.
3. Task 3 complete: created the remaining four feature notes for SAM2, mask editing, export, and import. Task-level review forced clearer runtime-gap language and cleaner blocked-row treatment before approval.
4. Task 4 complete: created the seven testing task notes, updated `[[Tasks Index]]`, and rewired `[[Repo Current State and Feature Matrix]]` into an overview-only note. Task-level review forced replacement of pending task placeholders with real links and clearer source-of-truth ownership.
5. Task 5 complete: updated `AGENTS.md` so feature notes and task notes are mandatory before coding and TDD must start from the feature-note tables. Task-level review approved the workflow after the pre-code sequence and done criteria were tightened.
6. Global review round 1 found three missing pieces: `tests/` was absent from the memory map, task notes did not yet require `Scope` and `Test Intent`, and the execution or review trail was not durable in memory. Those fixes were applied before running the final global review.
7. Global review round 2 approved the full change set with no findings. Residual risk is limited to honest pending manual execution and genuinely blocked product areas already called out in feature notes.

## Relations
- relates_to [[Repo Current State and Feature Matrix]]
- relates_to [[Task Template]]
- relates_to [[Task Definition]]
- relates_to [[Task Breakdown Guide]]
- relates_to [[Task Implementation Guide]]
