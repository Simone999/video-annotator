---
title: Task Definition
type: process
canonical: true
domain: workflow
aliases:
- task definition
- write task
- acceptance criteria
permalink: video-annotator/tasks/task-definition
tags:
- task
- memory
- definition
---

# Task Definition

Use this note when you need to define a Backlog task, write acceptance criteria, or decide what belongs in live task content. A task is a small, testable unit of work that can be finished in one focused delivery pass.

## What Belongs Here

- clear title
- concise description of why
- scope boundary with in-scope and out-of-scope edges
- affected durable feature notes when useful
- acceptance criteria that can be checked objectively
- test intent for backend, frontend, and manual verification
- milestone and dependency links when they help ordering
- definition-of-done checklist
- Backlog task content that later execution can continue without hidden chat context

## What Does Not Belong Here

- concrete planning-phase test scenarios
- planning-phase implementation plan
- future work that depends on later tasks
- vague outcome claims that cannot be checked
- multi-PR scope disguised as one item

## Storage Rule

- reusable task-process notes stay under `basic-memory/process/`
- live tasks live in Backlog
- `archive/tasks/` holds completed history and frozen pre-Backlog snapshots only

## Observations
- [definition] Task should be atomic, testable, and independent enough to complete in one PR.
- [definition] Acceptance criteria should describe outcomes, not implementation steps.
- [definition] Concrete planned tests and implementation belong in planning phase, not creation phase.
- [phase] Stage 1 creates task; Stage 2 expands it through planning, execution, and wrap-up.
- [storage] Durable process notes stay in `basic-memory/process/`; live task truth lives in Backlog.

## Relations
- indexed_by [[Process Index]]
- relates_to [[Task Template]]
- relates_to [[Task Breakdown Guide]]
- relates_to [[Task Implementation Guide]]
- relates_to [[Task]]
