---
title: 'm-3: SAM2 Runtime and Refinement'
type: note
status: planned
permalink: video-annotator/milestones/m-3-sam2-runtime-and-refinement
tags:
- milestone
- roadmap
- sam2
- refinement
---

# m-3: SAM2 Runtime and Refinement

## Goal

Run prompt, refine, and propagation flows against the real SAM2 runtime and persist accepted results on canonical backend frames. This milestone turns the current SAM2 shell into real runtime capability.

## What To Implement

- real runtime adapter behavior behind the SAM2 service boundary
- same-frame refine flow plus clear runtime failure handling
- persisted prompt, refine, and propagation behavior tied to backend `frame_idx`

## Checklist

- [ ] prompt and propagation stop relying on placeholder runtime behavior
- [ ] same-frame refine exists as a first-class flow
- [ ] runtime success and failure states are clear in backend and frontend behavior

## Related Features

- [[SAM2 Shell and Runtime]]

## Related Tasks

- [[Testing SAM2 shell and runtime]]
