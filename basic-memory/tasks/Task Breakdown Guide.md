---
title: Task Breakdown Guide
type: note
permalink: video-annotator/tasks/task-breakdown-guide
tags:
- task
- memory
- breakdown
---

# Task Breakdown Guide

Use this note when you need to break down tasks, split work into smaller tasks, or turn one implementation request into atomic stage-1 task slices. Breakdown starts from the smallest foundation that unlocks later work. The order matters: find prerequisites first, then split the work into tasks that each produce standalone value.

## Strategy

1. Identify foundational components first
2. Create tasks in dependency order
3. Keep each task atomic and testable
4. Avoid tasks that block each other when they do not need to
5. Ask whether a dumb subagent with only memories can implement the task without hidden context
6. Leave stage 1 with one durable plan note plus created task notes

## How to Split Work

- Use one task per coherent user-visible or backend-contract slice
- Keep each task scoped to one PR
- Do not reference future tasks
- Prefer narrow tasks with a single verification target
- Fill only creation-phase sections during stage 1
- Create each task note in the folder that matches its initial `status`, usually `tasks/todo/` or `tasks/blocked/`
- If a dumb subagent would still be confused after reading memories, add the missing context to memory first

## Practical Checks

- Ask whether the task can be verified on its own
- Ask whether it depends on future behavior
- Ask whether the task is already too large for one PR
- Ask whether a smaller dependency task must land first
- Ask whether a dumb subagent with no repo context could execute it using memories alone

## Observations
- [strategy] Foundations should land before dependent features so later tasks stay unblocked.
- [retrieval] Use this note for break down tasks, split work into tasks, or task slicing queries.
- [scope] Milestone docs are examples of how to slice work, not a promise that every line becomes a separate task.
- [quality] Atomic tasks are easier to verify, review, and recover.
- [guardrail] If a task needs future work to make sense, it is too large or too early.
- [guardrail] If a dumb subagent cannot implement a task from memories alone, the memory is incomplete.
- [workflow] Stage 1 should end with a durable plan note plus task notes in creation phase only.
- [storage] New concrete task notes belong in the state folder that matches their initial `status`.

## Relations
- relates_to [[Plan Template]]
- relates_to [[Task Definition]]
- relates_to [[Task Template]]
- relates_to [[Task Implementation Guide]]
- relates_to [[API]]
- relates_to [[Architecture]]
- relates_to [[Data Model]]
