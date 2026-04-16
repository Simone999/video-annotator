---
title: 'm-5: Export and Release Hardening'
type: note
permalink: video-annotator/milestones/m-5-export-and-release-hardening
tags:
- milestone
- roadmap
- export
- release
---

# m-5: Export and Release Hardening

This milestone finishes deterministic export and the release bar around it.

## Status
Planned.

## Goal
One sample video can complete end-to-end review flow and export deterministic JSON plus PNG masks.

## Missing
- Export create route.
- Export download route.
- Deterministic `annotations.json` generation.
- PNG mask export tree.
- `boxes_only` export mode.
- Golden artifact checks for exported JSON and mask PNGs.
- Release demo checklist that proves end-to-end flow.

## Acceptance Gate
- `POST /api/videos/{video_id}/export` creates export package.
- `GET /api/exports/{export_id}` downloads export artifact.
- Export matches `[[Export Format]]`.
- Golden checks cover exported JSON and PNG mask outputs.
- Release demo proves video open, exact-frame review, SAM2 use, manual correction, and export.

## Evidence
- Current backend route inventory has no export routes.
- Current frontend feature code has no export client or export UI.
- `[[Delivery Plan and Risks]]` and `[[Test Plan]]` both call out export as required for release completeness.

## Dumb Subagent Check
One context-poor subagent can implement each m-5 task by reading `[[Export Format]]`, `[[API]]`, `[[Data Model]]`, `[[Delivery Plan and Risks]]`, `[[Test Plan]]`, and this note. Keep export API, artifact generation, and golden verification as separate tasks.

## Observations
- [scope] m-5 is release hardening, not annotation editing.
- [dependency] Export is definition-of-done work and should not be hand-waved after UI features land.
- [guardrail] Export API, export generator, and golden verification should be separate tasks for dumb-subagent safety.

## Relations
- part_of [[Milestones Index]]
- depends_on [[m-1: Annotation Foundation]]
- depends_on [[m-4: Mask Editing and Cleanup]]
- depends_on [[Export Format]]
- depends_on [[API]]
- depends_on [[Data Model]]
- depends_on [[Delivery Plan and Risks]]
- depends_on [[Test Plan]]
- relates_to [[Task Breakdown Guide]]
