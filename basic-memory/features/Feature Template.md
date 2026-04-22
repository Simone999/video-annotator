---
title: Feature Template
type: note
permalink: video-annotator/features/feature-template
tags:
- feature
- memory
- template
---

# Feature Template

This is the canonical blank feature note shape. Use it when a capability area does not have a source-of-truth note yet.

```markdown
---
title: <Feature Name>
type: note
permalink: video-annotator/features/<feature-slug>
tags:
- feature
- <area-tag>
---

# <Feature Name>

Short statement of what this feature is for and why it matters.

## Summary

- Goal:
- Primary users:

## Scope

- In scope:
- Out of scope:

## Current State

- Shipped behavior:
- Known gaps:
- Current blockers:

## Target Behavior

- User-visible workflow 1
- User-visible workflow 2

## Contracts and Dependencies

- Backend contracts:
- Frontend contracts:
- Data or storage contracts:
- External dependencies:

## Evidence

- Specs:
- Code or test evidence:

## Integration Tests

| ID | Surface | Scenario | Real-World Why | Setup/Fixtures | Automation Status | Evidence |
| --- | --- | --- | --- | --- | --- | --- |
| INT-001 | backend | Example integration scenario | Why operator or system cares | Fixtures or stack setup | planned | Link or note |
| INT-002 | frontend | Example integration scenario | Why operator or system cares | Fixtures or stack setup | planned | Link or note |

## E2E Tests

| ID | Scenario | Real-World Workflow | Environment | Automation Status | Evidence |
| --- | --- | --- | --- | --- | --- |
| E2E-001 | Example e2e scenario | Real workflow or failure path | Local stack or fixture env | planned | Link or note |

## Manual Tests

Use exact execution status values only:
- `✅ Done`
- `⚠️ Partially`
- `❌ Not Done`

Add a reason in `Execution Notes` whenever status is `⚠️ Partially` or `❌ Not Done`.

| ID | Scenario | Setup | Steps | Expected Result | Execution Status | Execution Notes |
| --- | --- | --- | --- | --- | --- | --- |
| MAN-001 | Example manual scenario | Required environment | Concrete steps | What operator should see | ❌ Not Done | Write why and what is missing |
```

## Observations
- [template] This note is the canonical blank source-of-truth shape for one feature note.
- [workflow] Feature notes must exist before implementation starts so tests and manual verification come from real workflows first.
- [testing] Every feature note must include integration, e2e, and manual tables even when current behavior is blocked or missing.
- [manual] Manual execution status must be recorded honestly with exact status values and reasons.

## Relations
- relates_to [[Features Index]]
- relates_to [[Task Template]]
