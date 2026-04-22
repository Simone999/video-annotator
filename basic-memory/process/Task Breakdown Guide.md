---
title: Task Breakdown Guide
type: process
canonical: true
domain: workflow
aliases:
- break down tasks
- task slicing
- split work
permalink: video-annotator/tasks/task-breakdown-guide
tags:
- task
- memory
- breakdown
---

# Task Breakdown Guide

Use this note when you need to split one implementation request into atomic task slices. Breakdown starts from smallest foundation that unlocks later work.

## Strategy

1. Identify foundational components first.
2. Create tasks in dependency order.
3. Keep each task atomic and testable.
4. Avoid tasks that block each other when they do not need to.
5. Ask whether a dumb subagent with only durable memories could implement task without hidden context.
6. Leave stage 1 with one saved plan plus created task notes.

## How to Split Work

- use one task per coherent user-visible or backend-contract slice
- keep each task scoped to one PR
- do not reference future tasks
- prefer narrow tasks with one verification target
- fill only Creation phase sections during stage 1
- create each task note in archive folder matching initial `status`, usually `archive/tasks/todo/` or `archive/tasks/blocked/`
- if a dumb subagent would still be confused after reading memories, add missing durable context first

## Observations
- [strategy] Foundations should land before dependent features so later tasks stay unblocked.
- [quality] Atomic tasks are easier to verify, review, and recover.
- [guardrail] If a task needs future work to make sense, it is too large or too early.
- [guardrail] If a dumb subagent cannot implement a task from durable memories alone, durable memory is incomplete.
- [storage] New concrete task notes belong in `archive/tasks/` folder matching initial `status`.

## Relations
- indexed_by [[Process Index]]
- relates_to [[Plan Template]]
- relates_to [[Task Definition]]
- relates_to [[Task Template]]
- relates_to [[Task Implementation Guide]]
