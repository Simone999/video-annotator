---
title: Task Definition
type: note
permalink: video-annotator/tasks/task-definition
tags:
- task
- memory
- definition
---

# Task Definition

Use this note when you need to define a task, write acceptance criteria, or decide what belongs in a staged task note. A task is a small, testable unit of work that can be finished in one focused delivery pass. Good tasks describe the outcome, not the code path. They stay atomic, independent, and verifiable.

## What Belongs Here

- A clear title
- A concise description of the why
- A clear scope boundary with in-scope and out-of-scope edges
- A short list of affected feature notes when useful
- Acceptance criteria that can be checked objectively
- Test intent that says what backend, frontend, and manual verification the task should drive
- Ordered `steps` in frontmatter when lifecycle tracking is being used
- A definition of done checklist
- Labels, priority, and assignee if useful
- Concrete task note storage under the `tasks/` state folder that matches frontmatter `status`

## What Does Not Belong Here

- Concrete planning-phase test scenarios
- The planning-phase implementation plan
- Future work that depends on later tasks
- Vague outcome claims that cannot be checked
- Multi-PR scope disguised as one item

## Phases

- Creation: title, description, scope, affected features, acceptance criteria, test intent, definition of done, and task metadata
- Planning: planned integration tests, planned e2e tests, planned implementation, and feature matrix updates
- Execution: implementation notes and progress updates
- Wrap-up: verification, final summary, and completion against acceptance criteria and done checklist

## Storage Rule

- Reference notes stay at `basic-memory/tasks/` root.
- Concrete task notes live under `basic-memory/tasks/todo/`, `basic-memory/tasks/in_progress/`, `basic-memory/tasks/blocked/`, or `basic-memory/tasks/done/`.
- Task note folder must match frontmatter `status`.

## Observations
- [definition] A task should be atomic, testable, and independent enough to complete in one PR.
- [definition] Acceptance criteria should describe outcomes, not implementation steps.
- [definition] Scope and test intent belong in creation phase so coding does not start with an implicit boundary.
- [definition] Concrete planned tests and implementation belong in planning phase, not creation phase.
- [definition] Ordered frontmatter `steps` should reflect the task lifecycle when task tracking is active.
- [retrieval] Use this note for define a task, task definition, or writing acceptance criteria queries.
- [discipline] Future dependencies are not allowed in a task definition.
- [phase] Stage 1 creates the task; Stage 2 expands it through planning, execution, and wrap-up.
- [storage] Reference notes stay at `tasks/` root; concrete task notes live in the state folder that matches `status`.

## Relations
- relates_to [[Task Template]]
- relates_to [[Task Breakdown Guide]]
- relates_to [[Task Implementation Guide]]
- relates_to [[Task]]
- relates_to [[API]]
- relates_to [[Architecture]]
