---
title: Task Implementation Guide
type: note
permalink: video-annotator/tasks/task-implementation-guide
tags:
- task
- memory
- implementation
---

# Task Implementation Guide

This is the canonical task implementation guide. Use this note when you need to implement a task, take over a task, or move from acceptance criteria to code. Implementation is a disciplined loop: understand the task, plan narrowly, make the smallest change that satisfies the acceptance criteria, then verify it.

## Before Coding

- Read the task note and attached docs
- Define what to reuse from `~/projects/sam2/demo` when the task touches SAM2
- Reuse the relevant milestone plan and adjacent architecture notes
- Check that the tools you expect to use are available in the environment
- State assumptions explicitly
- If the plan is unclear, stop and ask
- Challenge the plan for gotchas and guardrails before editing

## First Actions

1. Set the task to in progress
2. Assign it to yourself
3. Write the implementation plan
4. Share the plan with the user and wait for confirmation before coding unless the user explicitly skips review
5. Start executing the plan one acceptance criterion at a time

## During Execution

- Keep changes surgical
- Touch only what the task requires
- Add implementation notes as work progresses
- Prefer simple, typed modules and clear service boundaries
- Do not broaden scope unless the acceptance criteria are updated first

## Verification

- Run the relevant tests
- Check types and lint if the change affects them
- Update docs when behavior or contracts change
- Verify the result matches the milestone doc

## Wrap-Up

- Write a final summary that reads like a PR description
- Mark acceptance criteria and done checks complete
- Record important decisions, corrections, and struggles in the task note

## Observations
- [workflow] This is the canonical note for implement task, task implementation guide, and takeover a task queries.
- [discipline] The plan comes before code, but only after the task is active.
- [quality] Small surgical changes reduce review risk and keep tasks legible.
- [verification] Done means tests, types, docs, and milestone alignment all hold.

## Relations
- relates_to [[Task Definition]]
- relates_to [[Task Breakdown Guide]]
- relates_to [[Task Template]]
- relates_to [[Task]]
- relates_to [[Test Plan]]