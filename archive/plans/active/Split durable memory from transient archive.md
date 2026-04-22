---
title: Split durable memory from transient archive
type: plan
status: active
permalink: video-annotator/plans/split-durable-memory-from-transient-archive
tags:
- plan
- memory
- archive
---

# Split durable memory from transient archive

Move transient task, plan, milestone, and audit notes out of `basic-memory/` and rebuild durable process guidance around `archive/`.

## Summary
- Goal: make Basic Memory retrieval durable-only.
- Success criteria: transient folders live under `archive/`, durable process or schema guidance stays in `basic-memory/`, and durable indexes stop routing into transient history.
- Audience: future agents and developers maintaining repo memory hygiene.

## Task Breakdown
1. [[Split durable memory from transient archive task]] — move transient notes and rewrite durable guidance

## Handoff Notes
- Preserve in-progress work by moving folders wholesale before rewriting durable notes.
- Strip transient task or milestone routing from durable feature notes.
- Verify search behavior after edits instead of assuming file moves are enough.
