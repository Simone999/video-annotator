---
title: 'm-5: Export Workflow and Exported State'
type: note
status: planned
permalink: video-annotator/milestones/m-5-export-workflow-and-exported-state
tags:
- milestone
- roadmap
- export
- release
---

# m-5: Export Workflow and Exported State

## Goal

Ship deterministic export flow and real `exported` versus `ready` library truth.

## What To Implement

- export record persistence and stale/current derivation
- deterministic JSON plus PNG and boxes-only artifact generation
- API, UI, and milestone review for export handoff flow

## Checklist

- [ ] export create and download routes exist with deterministic artifacts
- [ ] library emits real `exported` only when export matches saved review state
- [ ] milestone review fixes docs, index, and UI drift found during pass

## Related Features

- [[Export]]
- [[Video Ingest and Exact-Frame Review]]

## Related Tasks

- [[Persist export records]]
- [[Build native JSON exporter]]
- [[Build mask and boxes-only export]]
- [[Add export API and client]]
- [[Wire export UI and exported state]]
- [[Review m-5 parity and drift]]

## Observations

- [status] m-5 now focuses on export flow and exported-state truth, not generic release checklist only #m-5 #scope
- [status] tasks stay small enough for one implementation iteration each #m-5 #tasks
