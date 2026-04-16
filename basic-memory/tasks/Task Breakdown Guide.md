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

Use this note when you need to break down tasks, split work into smaller tasks, or turn one request into atomic task slices. Breakdown starts from the smallest foundation that unlocks later work. The order matters: find prerequisites first, then split the work into tasks that each produce standalone value.

## Strategy

1. Identify foundational components first
2. Create tasks in dependency order
3. Keep each task atomic and testable
4. Avoid tasks that block each other when they do not need to

## How to Split Work

- Use one task per coherent user-visible or backend-contract slice
- Keep each task scoped to one PR
- Do not reference future tasks
- Prefer narrow tasks with a single verification target

## Concrete Milestone Shapes

- Milestone 1 exact-frame review: indexing, video list, metadata, playback pane, exact-frame endpoint, frame viewer, jump input, prev/next controls
- Milestone 2 box CRUD: object creation, box drawing, reload persistence, move/resize, deletion
- Milestone 3 SAM2: session reuse, same-frame prompt, mask persistence, propagation, progress, cancellation

## Practical Checks

- Ask whether the task can be verified on its own
- Ask whether it depends on future behavior
- Ask whether the task is already too large for one PR
- Ask whether a smaller dependency task must land first

## Observations
- [strategy] Foundations should land before dependent features so later tasks stay unblocked.
- [retrieval] Use this note for break down tasks, split work into tasks, or task slicing queries.
- [scope] Milestone docs are examples of how to slice work, not a promise that every line becomes a separate task.
- [quality] Atomic tasks are easier to verify, review, and recover.
- [guardrail] If a task needs future work to make sense, it is too large or too early.

## Relations
- relates_to [[Task Definition]]
- relates_to [[Task Template]]
- relates_to [[Task Implementation Guide]]
- relates_to [[API]]
- relates_to [[Architecture]]
- relates_to [[Data Model]]