---
id: task-split-durable-memory-from-transient-archive
title: Split durable memory from transient archive task
status: in_progress
steps:
- creation
- planning
- execution
- wrap_up
tags:
- task
- memory
- archive
---

# Split durable memory from transient archive task

## Creation Phase

### Description

Move transient tracking out of `basic-memory/`, keep durable process or schema notes in memory, and rewrite indexes or feature notes so retrieval stays durable-only.

### Scope

- In scope: move transient note folders, create durable `process/`, rewrite durable indexes and workflow guidance, strip transient task or milestone routing from feature notes, and record durable decision
- Out of scope: changing product behavior, code runtime behavior, or historical archive note contents beyond lightweight archive guidance

### Affected Features

- [[Memory Index]]
- [[Workflow]]

### Acceptance Criteria

- [ ] `basic-memory/` contains only durable notes
- [ ] transient task, plan, milestone, and audit notes live under `archive/`
- [ ] durable process and schema notes remain discoverable
- [ ] feature notes stop routing to transient tasks or milestones
- [ ] search verification is recorded honestly

### Test Intent

- Backend: none
- Frontend: none
- Manual: verify file layout plus Basic Memory search behavior

### Definition of Done

- [ ] durable notes updated
- [ ] transient notes moved
- [ ] verification recorded honestly
