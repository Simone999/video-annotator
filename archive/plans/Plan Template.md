---
title: Plan Template
type: note
permalink: video-annotator/plans/plan-template
tags:
- plan
- template
- workflow
- tasks
---

# Plan Template

This is canonical template for durable stage-1 plan note. Use it when substantial work needs saved high-level plan plus Backlog task breakdown before implementation starts.

```markdown
---
title: <Plan Title>
type: plan
status: draft
permalink: video-annotator/plans/<plan-slug>
tags:
- plan
- <area-tag>
---

# <Plan Title>

Short statement of what the implementation request is trying to achieve.

## Summary
- Goal:
- Success criteria:
- Audience:

## Current State
- Existing behavior:
- Main gaps:
- Constraints:

## Assumptions And Open Questions
- Locked assumptions:
- Open questions:

## Affected Features
- [[feature-note]]

## Task Breakdown
1. `TASK-123` — task title — what it unlocks
2. `TASK-124` — task title — what it unlocks

## Handoff Notes
- What stage-2 task sessions must read first
- Which prerequisites belong under each task `Description`
- Which files, notes, and links belong under each task `References`
- Which planned tests belong under each task `Implementation Plan > Planned Tests`
- Which planned implementation steps belong under each task `Implementation Plan > Implementation Steps`
- Which execution-only notes belong under each task `Implementation Notes`
- What PR-style wrap-up belongs under each task `Final Summary`
- Cross-task sequencing rules
- Shared gotchas and guardrails
```

## Observations
- [workflow] This note is the durable stage-1 output for substantial work before task implementation starts.
- [structure] One saved plan note plus created Backlog tasks makes later task sessions easier to hand off.
- [retrieval] Use this note for plan template, stage 1 plan, or high-level implementation plan queries.

## Relations
- relates_to [[Plans Index]]
- relates_to [[Rebuild staged workflow plan]]
- relates_to [[Task]]
