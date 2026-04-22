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

This is the canonical template for a durable stage-1 plan note. Use it when substantial work needs a saved high-level plan plus task breakdown before implementation starts.

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
1. [[task-note-1]] — what it unlocks
2. [[task-note-2]] — what it unlocks

## Handoff Notes
- What stage-2 task sessions must read first
- Cross-task sequencing rules
- Shared gotchas and guardrails
```

## Observations
- [workflow] This note is the durable stage-1 output for substantial work before task implementation starts.
- [structure] One saved plan note plus created task notes makes later task sessions easier to hand off.
- [retrieval] Use this note for plan template, stage 1 plan, or high-level implementation plan queries.

## Relations
- relates_to [[Plans Index]]
- relates_to [[Rebuild staged workflow plan]]
- relates_to [[Task Breakdown Guide]]
- relates_to [[Task Template]]
