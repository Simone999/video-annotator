---
title: Workflow
type: note
permalink: video-annotator/workflow
tags:
- workflow
---

# Workflow

This note is the canonical staged SOP for implementation work in this repo. Use it when you need to know what belongs in durable memory, what belongs in `archive/`, when to define tests, and what must be updated before work is done.

## Source Of Truth

- `AGENTS.md` is rules and guardrails.
- Feature notes under `features/` own shipped behavior, gaps, and evidence summaries.
- Process notes under `process/` own workflow, templates, and tracking conventions.
- Schema notes under `schema/` define structured note types used by archive tracking.
- Archive task and plan notes under repo-root `archive/` hold transient execution truth.
- Testing notes under `tests/` hold durable cross-feature testing guidance.
- `docs/` are supporting reference only.

## When Full Workflow Applies

- Use the full staged workflow for substantial work.
- Substantial work means any multi-step behavior change.
- Tiny mechanical edits may use a lighter path, but still need:
  - local test thinking before code
  - verification after code
  - honest durable-memory or archive updates when relevant

## Stage 1: Request Breakdown Session

Use this stage when the user asks for implementation and the work is substantial enough to need a high-level plan and task split.

### Output

- one transient plan note under `archive/plans/`, usually from `[[Plan Template]]`
- one or more transient task notes under `archive/tasks/` state folders
- durable memory updates only when long-lived truth changes

### Steps

1. Read `AGENTS.md` and `[[Workflow]]`.
2. Read relevant memories and supporting `docs/`.
3. Understand problem by exploration first, then questions when needed.
4. Build high-level implementation plan.
5. Split work into atomic tasks in dependency order with `[[Task Breakdown Guide]]`.
6. Save high-level plan in `archive/plans/`.
7. Create task notes in archive folder matching initial `status` and fill only Creation phase sections.
8. Update durable feature, decision, process, schema, or test notes only if long-lived truth changes.
9. Stop after transient handoff exists unless user explicitly asks to continue into execution.

## Stage 2: Task Implementation Session

Use this stage when the user opens a task session, usually one session per task.

### Planning Phase

1. Read `AGENTS.md`, `[[Workflow]]`, archive task note, and affected feature notes.
2. Read relevant memories and supporting `docs/`.
3. Plan integration tests and e2e tests first.
4. Record planned tests into task note.
5. Explore `sam2-demo` and define what to reuse.
6. Plan implementation.
7. Record planned implementation into task note.
8. Update affected feature-note summary text only if task planning changes feature-level truth.
9. Challenge plan. Add gotchas and guardrails.
10. Only after that, move to execution.

## How Feature Notes And Task Notes Work Together

- Feature note says what feature is, what is shipped, what is missing, and what evidence exists.
- Task note says what one active slice is trying to do inside that feature area.
- Feature note owns long-lived truth.
- Task note owns active execution detail, including concrete test planning and verification.
- Stage 1 creates task notes in creation phase.
- Stage 2 expands same task notes with planning, execution, and wrap-up details.
- Concrete task notes live under `archive/tasks/todo/`, `archive/tasks/in_progress/`, `archive/tasks/blocked/`, or `archive/tasks/done/` to match frontmatter `status`.
- Do not route transient task lists from durable feature notes.

## TDD Start Rule

- No coding before task creation phase exists.
- No coding before task planning phase records planned tests and planned implementation.
- No coding before affected feature-note summary text is updated when task changes feature-level truth.
- First implementation step is first failing test that matches planned task scope.

## Execution Phase

- Proceed by following `test-driven-development` skill.
- If lifecycle tracking is active and task becomes active, set `status: in_progress` and move note into `archive/tasks/in_progress/`.
- Keep changes surgical and inside task scope.
- Keep task execution notes current while work is active.
- Keep feature evidence current when behavior, blockers, or coverage change.

## Wrap-Up Phase

1. Run relevant tests, type checks, and lint.
2. Update task verification and final summary.
3. Update feature-note evidence.
4. Record concrete verification outcomes, including any real manual execution, in archive task notes or durable testing notes.
5. Update supporting docs and durable memory when behavior or contracts changed.
6. Do not set task `status: done` until Acceptance Criteria and Definition of Done checkboxes match reality.
7. When task `status` changes, move note into archive folder matching new status.

## Done Checklist

- Relevant tests pass.
- Types and lint pass.
- Task wrap-up is complete.
- Task Acceptance Criteria checkboxes match reality.
- Task Definition of Done checkboxes match reality.
- Owning feature note is updated when relevant.
- Concrete verification truth is recorded honestly in archive task notes or durable testing notes.
- Supporting docs and durable memory are updated when behavior or contracts changed.

## Quick Links

- [[Memory Index]]
- [[Process Index]]
- [[Plan Template]]
- [[Features Index]]
- [[Feature Template]]
- [[Tasks Index]]
- [[Plans Index]]
- [[Milestones Index]]
- [[Task Template]]
- [[Task Breakdown Guide]]
- [[Task Implementation Guide]]
- [[Testing tools]]
- [[unit-tests]]
- [[e2e-tests]]
- [[frontend-integration-tests]]
- [[backend-api-integration-tests]]

## Observations

- [workflow] This note is canonical staged SOP for substantial implementation work in this repo.
- [source-of-truth] Feature and process notes own long-lived truth; archive task notes own concrete execution truth.
- [stages] Stage 1 is request breakdown and task creation; Stage 2 is task planning, execution, and wrap-up.
- [testing] Integration and e2e planning happens before coding in task session.
- [tdd] TDD starts only after task planning is written down.
- [completion] Task `status: done` is forbidden until Acceptance Criteria and Definition of Done checkboxes match reality.
- [storage] Concrete task notes, plans, milestones, and audits live under repo-root `archive/`; durable guides and schemas stay in Basic Memory.
- [retrieval] Use this note for workflow, stage 1, stage 2, planning phase, or wrap-up queries.

## Relations

- indexed_by [[Memory Index]]
- indexed_by [[Process Index]]
- relates_to [[Plan Template]]
- relates_to [[Features Index]]
- relates_to [[Feature Template]]
- relates_to [[Tasks Index]]
- relates_to [[Plans Index]]
- relates_to [[Milestones Index]]
- relates_to [[Task Template]]
- relates_to [[Task Breakdown Guide]]
- relates_to [[Task Implementation Guide]]
- relates_to [[Testing tools]]
- relates_to [[unit-tests]]
- relates_to [[e2e-tests]]
- relates_to [[frontend-integration-tests]]
- relates_to [[backend-api-integration-tests]]
