---
title: Rebuild staged workflow plan
type: plan
status: done
permalink: video-annotator/plans/rebuild-staged-workflow-plan
tags:
- plan
- workflow
- tasks
- staging
- onboarding
---

# Rebuild staged workflow plan

This plan replaces the current mixed workflow with one staged model that a junior developer or agent can follow without stitching together conflicting notes.

## Summary
- Use two user stages for substantial work.
- Stage 1 is request breakdown and task creation.
- Stage 2 is task implementation.
- Keep feature notes as source of truth for behavior and testing status.
- Keep task notes as work orders for one slice.

## Staged workflow

### Stage 1: request breakdown session
- understand the request by exploring repo truth first
- ask only high-impact questions
- build a high-level plan
- split work into atomic tasks in dependency order
- save one durable plan note under `basic-memory/plans/`
- create task notes in `basic-memory/tasks/` using creation phase only

### Stage 2: task implementation session

#### Planning phase
- read the task note
- read affected feature notes
- plan integration tests and e2e tests first
- plan implementation
- record planned tests and planned implementation in the task note
- update feature test matrices if planning changes them

#### Execution phase
- implement by following TDD

#### Wrap-up phase
- run verification
- update the task note
- update affected feature evidence and matrices
- update supporting docs and memory when behavior or contracts changed
- write final user-facing summary

## Trigger
- Full staged workflow is required for substantial work.
- Substantial work means any multi-step behavior change.
- Tiny mechanical edits may use a lighter path, but still need local test planning, verification, and honest wrap-up.

## Deliverables
1. Rewrite `[[Workflow]]` as the canonical staged SOP.
2. Trim `AGENTS.md` so it points to `[[Workflow]]` and keeps only repo-level invariants.
3. Add `[[Plan Template]]` for stage 1 durable plan output.
4. Rework task docs and task template around creation, planning, execution, and wrap-up phases.
5. Migrate current example task notes so they do not teach the old flat workflow.
6. Update routing notes and indexes so new readers find the staged workflow fast.

## Assumptions
- Stage 1 and Stage 2 are usually separate user sessions.
- Stage 1 leaves a durable plan note plus created task notes.
- No runtime code behavior changes are needed for this work.

## Execution Log
1. Saved this staged-workflow plan in `basic-memory/plans/` and added `[[Plan Template]]` plus routing from `[[Plans Index]]`.
2. Rewrote `AGENTS.md` and `[[Workflow]]` so both now teach the same staged model: substantial-work trigger, stage 1 request breakdown, and stage 2 planning or execution or wrap-up.
3. Reworked task docs and template around creation, planning, execution, and wrap-up phases, while keeping task schema frontmatter minimal except for ordered `steps`.
4. Migrated the example testing task notes so they no longer teach the old flat workflow.
5. Task-by-task review passed for the plan slice, SOP slice, task-docs slice, and examples or routing slice after one routing fix and one stale-review retry.
6. Global final review first found two inconsistencies: missing frontmatter `steps` in the template/examples and missing `[[Plan Template]]` in the task-index reading order.
7. Fixed those inconsistencies by adding ordered `steps` to the task template and example task notes, and by promoting `[[Plan Template]]` in `[[Tasks Index]]`.
8. Global final review rerun approved the staged workflow with no findings.

## Relations
- relates_to [[Workflow]]
- relates_to [[Plans Index]]
- relates_to [[Task Breakdown Guide]]
- relates_to [[Task Template]]
