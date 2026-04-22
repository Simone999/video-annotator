---
title: Task Implementation Guide
type: process
canonical: true
domain: workflow
aliases:
- implement task
- stage 2 task
- task execution
permalink: video-annotator/tasks/task-implementation-guide
tags:
- task
- memory
- implementation
---

# Task Implementation Guide

This is the canonical stage-2 task implementation guide. Use it when you need to take over a task in a separate session and move from created task note to execution.

## Planning Phase

- read archive task note and affected feature notes
- read attached docs and relevant durable memory
- plan integration tests and e2e tests first
- record planned tests in task note
- plan implementation and record it in task note
- update affected feature summary text if planning changes feature-level truth
- state assumptions explicitly
- challenge plan for gotchas and guardrails before editing

## Execution Phase

- set task to in progress if lifecycle tracking is active
- move task note into `archive/tasks/in_progress/` when `status` changes to `in_progress`
- start from first failing test that matches planned scope
- execute one acceptance criterion at a time
- keep changes surgical
- keep implementation notes current while work is active

## Wrap-Up Phase

- run relevant tests
- check types and lint if change affects them
- update affected feature evidence summaries
- record concrete verification results in archive task note or durable testing notes
- update docs and durable memory when behavior or contracts change
- write final summary that reads like PR description
- mark acceptance criteria and done checks complete
- move task note into archive folder matching final `status`

## Observations
- [workflow] This is canonical note for stage-2 task implementation.
- [discipline] Planned tests and planned implementation come before code.
- [quality] Small surgical changes reduce review risk and keep tasks legible.
- [verification] Done means tests, types, feature updates, docs, and summary all hold.
- [storage] Concrete task note path should move under `archive/tasks/` when `status` changes.

## Relations
- indexed_by [[Process Index]]
- relates_to [[Workflow]]
- relates_to [[Task Definition]]
- relates_to [[Task Breakdown Guide]]
- relates_to [[Task Template]]
- relates_to [[Task]]
