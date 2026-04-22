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

This is the canonical stage-2 task implementation guide. Use this note when you need to implement a task, take over a task in a separate session, or move from created task note to code. Implementation is a disciplined loop: understand the task, plan tests first, plan narrowly, make the smallest change that satisfies the acceptance criteria, then verify it.

## Planning Phase

- Read the task note and affected feature notes
- Read attached docs and relevant memory
- Plan integration tests and e2e tests first
- Record planned tests in the task note
- Plan implementation and record it in the task note
- Update affected feature-note summary text or linked tasks if task planning changes feature-level truth
- Define what to reuse from `~/projects/sam2/demo` when the task touches SAM2
- Check that the tools you expect to use are available in the environment
- State assumptions explicitly
- If the plan is unclear, stop and ask
- Challenge the plan for gotchas and guardrails before editing

## Execution Phase

- Set the task to in progress if lifecycle tracking is being used
- Move the task note into `tasks/in_progress/` when `status` changes to `in_progress`
- Start from the first failing test that matches planned scope
- Execute one acceptance criterion at a time
- Keep changes surgical
- Touch only what the task requires
- Add implementation notes as work progresses
- Prefer simple, typed modules and clear service boundaries
- Do not broaden scope unless the acceptance criteria are updated first

## Wrap-Up Phase

- Run the relevant tests
- Check types and lint if the change affects them
- Update affected feature evidence summaries
- Record concrete verification results in the task note or testing notes
- Update docs and memory when behavior or contracts change
- Write a final summary that reads like a PR description
- Mark acceptance criteria and done checks complete
- Move the task note into the folder matching final `status`
- Record important decisions, corrections, and struggles in the task note

## Observations
- [workflow] This is the canonical note for stage-2 task implementation and takeover a task queries.
- [discipline] Planned tests and planned implementation come before code.
- [quality] Small surgical changes reduce review risk and keep tasks legible.
- [verification] Done means tests, types, feature updates, docs, and summary all hold.
- [storage] Concrete task note file path should move when `status` changes so folder and status stay aligned.

## Relations
- relates_to [[Workflow]]
- relates_to [[Task Definition]]
- relates_to [[Task Breakdown Guide]]
- relates_to [[Task Template]]
- relates_to [[Task]]
