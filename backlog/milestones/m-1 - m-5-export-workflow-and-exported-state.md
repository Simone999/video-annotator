---
id: m-1
title: "m-5: Export Workflow and Exported State"
---

## Description

### Goal
Ship deterministic export flow and real `exported` versus `ready` library truth.

### What To Implement
- export record persistence and stale/current derivation
- deterministic JSON plus PNG and boxes-only artifact generation
- API, UI, and milestone review for export handoff flow

### Related Features
- [[Export]]
- [[Video Ingest and Exact-Frame Review]]

### Ordering And Dependencies
- Land export record persistence and stale/current derivation before the API and UI handoff flow is finalized.
- Ship deterministic JSON plus PNG and boxes-only artifacts before the final milestone review closes export work.
- Route release-hardening follow-on work to `m-7` instead of leaving `m-5` open.

### Historical Source
- Original archive note: `archive/milestones/planned/m-5 - Export Workflow and Exported State.md`
- Original archive status: `planned`
