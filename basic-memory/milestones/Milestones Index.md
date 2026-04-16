---
title: Milestones Index
type: note
permalink: video-annotator/milestones/milestones-index
tags:
- milestone
- memory
- index
- roadmap
---

# Milestones Index

This folder is canonical milestone roadmap memory. It is rebased around remaining work, not old historical slices. Use it when you need current order, current shipped baseline, or the next milestone to hand to Ralph.

Current shipped baseline:
- Video indexing, list, metadata, playback pane, exact-frame fetch, frame jump, and frame step ship.
- Same-frame annotation reads and mask overlay rendering ship.
- SAM2 session and propagation shell ship: session routes, prompt-box route, propagation route, polling UI, cancel flow, and persisted propagated-mask reopen flow.
- Manual box CRUD, real SAM2 runtime, mask editing, export, and import are not complete.

Dumb subagent rule:
- If one milestone cannot be implemented by a context-poor agent using memories alone, split it smaller or add the missing memory first.

```text
milestones/
├── Milestones Index.md
├── m-1 - Annotation Foundation.md
├── m-2 - Review Workspace Completion.md
├── m-3 - SAM2 Runtime and Refinement.md
├── m-4 - Mask Editing and Cleanup.md
├── m-5 - Export and Release Hardening.md
└── m-6 - Import Existing Boxes.md
```

Read the individual milestone notes for scope, current code truth, missing work, acceptance gate, and the memories a dumb subagent must read first.

## Observations
- [navigation] This note is the folder map for milestone roadmap memory.
- [scope] Milestone notes describe remaining roadmap in dependency order and record current code truth where work already shipped early.
- [guardrail] Milestones must be small and explicit enough for a context-poor subagent to execute from memories alone.
- [retrieval] Use this note for milestone roadmap, milestone audit, milestone sequencing, or next Ralph target queries.

## Relations
- indexes [[Memory Index]]
- indexes [[m-1: Annotation Foundation]]
- indexes [[m-2: Review Workspace Completion]]
- indexes [[m-3: SAM2 Runtime and Refinement]]
- indexes [[m-4: Mask Editing and Cleanup]]
- indexes [[m-5: Export and Release Hardening]]
- indexes [[m-6: Import Existing Boxes]]
