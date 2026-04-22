---
title: Features Index
type: note
permalink: video-annotator/features/features-index
tags:
- feature
- memory
- index
---

# Features Index

This folder is the canonical map for feature source-of-truth notes. Use it to find the owning note for one capability area, then open that leaf note for the real behavior, current state, gaps, and evidence.

Feature notes are the source of truth for:
- user-visible workflows
- backend and frontend contract boundaries
- known gaps and blockers
- high-level evidence summaries

`Feature Template.md` is support material for creating notes. It is not itself a source-of-truth feature note.

## Folder Tree

```text
features/
├── Features Index.md
├── Feature Template.md
├── Video Ingest and Exact-Frame Review.md
├── Annotation Foundation and Manual Box Workflow.md
├── SAM2 Shell and Runtime.md
├── Mask Editing and Cleanup.md
├── Export.md
└── Import Existing Boxes.md
```

## How To Use This Folder

- Start with `[[Workflow]]` if you need the full step-by-step SOP before opening a feature note.
- Create one feature note per capability area.
- Treat the template as scaffolding only, not as a feature record.
- Keep current behavior and target behavior in the same note.
- Keep concrete test planning and execution truth in archive task notes or durable testing notes, not in feature-note tables.
- Record blocked work honestly instead of implying implementation exists when it does not.
- Do not route transient tasks or milestones from feature notes. Keep durable feature truth separate from archive tracking.

## Observations
- [navigation] This note is the folder map for canonical feature source-of-truth memory.
- [scope] Feature notes own behavior, gaps, and evidence summaries for one capability area, while the template is support material only.
- [workflow] Agents should start with `[[Workflow]]`, use feature notes for long-lived product truth, and keep transient execution tracking in `archive/`.
- [retrieval] Use this note for feature note index, source of truth feature notes, or capability-area routing queries.

## Relations
- indexes [[Memory Index]]
- relates_to [[Workflow]]
- indexes [[Feature Template]]
- indexes [[Video Ingest and Exact-Frame Review]]
- indexes [[Annotation Foundation and Manual Box Workflow]]
- indexes [[SAM2 Shell and Runtime]]
- indexes [[Mask Editing and Cleanup]]
- indexes [[Export]]
- indexes [[Import Existing Boxes]]
