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

Use this note when you need to define a task, write acceptance criteria, or decide what belongs in a task note. A task is a small, testable unit of work that can be finished in one focused delivery pass. Good tasks describe the outcome, not the code path. They stay atomic, independent, and verifiable.

## What Belongs Here

- A clear title
- A concise description of the why
- Acceptance criteria that can be checked objectively
- A definition of done checklist
- Labels, priority, and assignee if useful

## What Does Not Belong Here

- The implementation plan
- Future work that depends on later tasks
- Vague outcome claims that cannot be checked
- Multi-PR scope disguised as one item

## Phases

- Creation: title, description, acceptance criteria, and task metadata
- Planning: implementation plan after the task is taken over
- Execution: implementation notes and progress updates
- Wrap-up: final summary and verification against acceptance criteria and done checklist

## Observations
- [definition] A task should be atomic, testable, and independent enough to complete in one PR.
- [definition] Acceptance criteria should describe outcomes, not implementation steps.
- [retrieval] Use this note for define a task, task definition, or writing acceptance criteria queries.
- [discipline] Future dependencies are not allowed in a task definition.
- [phase] Implementation planning belongs after takeover, not during creation.

## Relations
- relates_to [[Task Template]]
- relates_to [[Task Breakdown Guide]]
- relates_to [[Task Implementation Guide]]
- relates_to [[Task]]
- relates_to [[API]]
- relates_to [[Architecture]]