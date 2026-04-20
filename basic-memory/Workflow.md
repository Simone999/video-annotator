---
title: Workflow
type: note
permalink: video-annotator/workflow
tags:
- workflow
---

# Workflow

This note is the canonical staged SOP for implementation work in this repo. Use it when you need to know whether the full workflow applies, what stage you are in, what artifacts must exist before coding, when to define tests, and what wrap-up must update before work is done.

## Source Of Truth

- `AGENTS.md` is rules and guardrails.
- Feature note under `features/` is source of truth for behavior, gaps, evidence summaries, and linked tasks.
- Task note under `tasks/<status>/` is work order for one slice.
- Plan note under `plans/` is durable stage-1 output for substantial work.
- Task notes and testing notes hold concrete test planning, execution, and verification truth.
- `docs/` are supporting reference only.
- `[[Repo Current State and Feature Matrix]]` is overview only.

## When Full Workflow Applies

- Use the full staged workflow for substantial work.
- Substantial work means any multi-step behavior change.
- Tiny mechanical edits may use a lighter path, but still need:
  - local test planning before code
  - verification after code
  - honest task or docs or memory updates when relevant

## Stage 1: Request Breakdown Session

Use this stage when the user asks for implementation and the work is substantial enough to need a high-level plan and task split.

### Goal

- understand the request
- explore repo truth first
- ask only high-impact questions
- leave a durable handoff for later task sessions

### Output

- one plan note under `plans/`, usually from `[[Plan Template]]`
- one or more task notes under `tasks/` state folders
- task notes filled in **Creation phase** only

### Steps

1. Read `AGENTS.md` and `[[Workflow]]`.
2. Read relevant memories and supporting `docs/`.
3. Understand the problem by exploration first, then questions when needed.
4. Build a high-level implementation plan.
5. Split work into atomic tasks in dependency order with `[[Task Breakdown Guide]]`.
6. Save the high-level plan in a durable plan note.
7. Create task notes in the folder matching their initial `status` and fill only their **Creation phase** sections.
8. If affected feature notes need routing help, add linked tasks or small truth updates there.
9. Stop after the durable handoff exists. Do not silently start task execution in the same session unless the user explicitly asks for that.

## Stage 2: Task Implementation Session

Use this stage when the user opens a task session, usually one session per task.

### Planning Phase

1. Read `AGENTS.md`, `[[Workflow]]`, the task note, and affected feature notes.
2. Read relevant memories and supporting `docs/`.
3. Plan integration tests and e2e tests first.
4. Record planned tests into task note.
5. Explore `sam2-demo` and define what to reuse.
6. Plan implementation.
7. Record planned implementation into task note.
8. Update affected feature-note summary text or linked tasks if task planning changes feature-level truth.
9. Challenge the plan. Add gotchas and guardrails.
10. Only after that, move to execution.

## When To Define Integration And E2E Tests

- Define them in the task session planning phase, before coding.
- Keep test direction in task `Test Intent` from creation phase.
- Put concrete task-session planned tests into the task note planning phase.
- Keep feature-note template verification sections present, but store concrete planned tests in the task note planning phase.
- If work reveals a new workflow, blocker, or missing contract, update feature-note narrative text and task-note test planning immediately.
- After verification, update task-note or testing-note evidence again.

## How Feature Notes And Task Notes Work Together

- Feature note says what the feature is, what is shipped, what is missing, what is blocked, and which tasks own follow-up work.
- Task note says what one active slice is trying to do inside that feature area.
- Feature note owns long-lived truth.
- Task note owns active execution detail, including concrete test planning and verification.
- Stage 1 creates task notes in creation phase.
- Stage 2 expands the same task notes with planning, execution, and wrap-up details.
- Reference notes stay at `tasks/` root, while concrete task notes live under `tasks/todo/`, `tasks/in_progress/`, `tasks/blocked/`, or `tasks/done/` to match frontmatter `status`.
- Link task notes from feature notes so a new reader can move from truth to work order fast.

## TDD Start Rule

- No coding before task creation phase exists.
- No coding before task planning phase records planned tests and planned implementation.
- No coding before affected feature-note summary text or linked tasks are updated when the task changes feature-level truth.
- First implementation step is the first failing test that matches the planned task scope.

## Execution Phase

- Proceed by following `test-driven-development` skill.
- If lifecycle tracking is active and the task becomes active, set `status: in_progress` and move the task note into `tasks/in_progress/`.
- Keep changes surgical and inside task scope.
- Keep task execution notes current while work is active.
- Keep feature evidence current when behavior, blockers, or coverage change.

## Wrap-Up Phase

1. Run relevant tests, type checks, and lint.
2. Update task verification and final summary.
3. Update feature-note evidence.
4. Update feature-note evidence summary if implementation state changed.
5. Keep feature-note template verification sections intact, but do not turn them into concrete test inventory.
6. Record concrete verification outcomes, including any real manual execution, in task notes or testing notes.
7. Update supporting `docs/` and memory when behavior or contracts changed.
8. Record durable struggles, user corrections, and decisions in memory when they matter later.
9. Write the final user-facing summary.
10. Do not set task `status: done` until Acceptance Criteria and Definition of Done checkboxes are updated to match reality.
11. When task `status` changes, move the task note into the folder that matches the new status.

## Done Checklist

- Relevant tests pass.
- Types and lint pass.
- Task wrap-up is complete.
- Task Acceptance Criteria checkboxes match reality.
- Task Definition of Done checkboxes match reality.
- Owning feature note is updated when relevant.
- Concrete test planning and verification truth is recorded honestly in task or testing notes.
- Supporting docs and memory are updated when behavior or contracts changed.

## Wrong Workflow

- Starting substantial implementation without a stage-1 plan note and created task notes.
- Using task execution in the request-breakdown session without explicit user direction.
- Planning tests after code instead of before code.
- Choosing tests from endpoint names instead of real workflows.
- Marking missing behavior as covered.
- Setting task `status: done` before Acceptance Criteria and Definition of Done checkboxes match reality.
- Treating `docs/` or `[[Repo Current State and Feature Matrix]]` as source of truth.

## Quick Links

- [[Memory Index]]
- [[Plan Template]]
- [[Features Index]]
- [[Feature Template]]
- [[Tasks Index]]
- [[Task Template]]
- [[Task Breakdown Guide]]
- [[Task Implementation Guide]]
- [[Testing tools]]
- [[unit-tests]]
- [[e2e-tests]]
- [[frontend-integration-tests]]
- [[backend-api-integration-tests]]

## Observations

- [workflow] This note is the canonical staged SOP for substantial implementation work in this repo.
- [source-of-truth] Feature notes own long-lived product truth; task and testing notes own concrete verification truth.
- [stages] Stage 1 is request breakdown and task creation; Stage 2 is task planning, execution, and wrap-up.
- [testing] Integration and e2e planning happens before coding in the task session.
- [tdd] TDD starts only after task planning is written down.
- [completion] Task `status: done` is forbidden until Acceptance Criteria and Definition of Done checkboxes match reality.
- [storage] Concrete task notes live in state folders that must match frontmatter `status`; task reference notes stay at `tasks/` root.
- [retrieval] Use this note for workflow, stage 1, stage 2, planning phase, or wrap-up queries.

## Relations

- indexed_by [[Memory Index]]
- relates_to [[Plan Template]]
- relates_to [[Features Index]]
- relates_to [[Feature Template]]
- relates_to [[Tasks Index]]
- relates_to [[Task Template]]
- relates_to [[Task Breakdown Guide]]
- relates_to [[Task Implementation Guide]]
- relates_to [[Testing tools]]
- relates_to [[unit-tests]]
- relates_to [[e2e-tests]]
- relates_to [[frontend-integration-tests]]
- relates_to [[backend-api-integration-tests]]
