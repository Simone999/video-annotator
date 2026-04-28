---
title: 'm-4: Mask Editing and Cleanup'
type: note
status: in_progress
permalink: video-annotator/milestones/m-4-mask-editing-and-cleanup
tags:
- milestone
- roadmap
- masks
- editing
---

# m-4: Mask Editing and Cleanup

## Goal

Let reviewer refine, clean up, and delete mask state with honest corrected-mask semantics and reopen behavior.

## What To Implement

- corrected-mask contract plus refine backend path
- paused-stage brush refine UI and scoped cleanup flows
- checkpoint review after first five tasks and final milestone review

## Checklist

- [ ] refine and corrected-mask reopen behavior ship on canonical frame path
- [ ] frame-local and whole-object cleanup stay clearly scoped
- [ ] milestone reviews fix docs, index, and UI drift found during pass

## Related Features

- [[Mask Editing and Cleanup]]
- [[SAM2 Shell and Runtime]]
- [[Annotation Foundation and Manual Box Workflow]]

## Related Tasks

- [[Define corrected-mask contract]]
- [[Implement refine-mask backend]]
- [[Build paused mask refine UI]]
- [[Add frame-local mask cleanup]]
- [[Add whole-object mask cleanup]]
- [[Review m-4 cleanup checkpoint]]
- [[Add object-track delete and summary reset]]
- [[Review m-7 parity and drift]]

## Observations

- [status] m-4 owns refine, cleanup, and object-track delete after real SAM2 runtime lands #m-4 #scope
- [status] milestone keeps its cleanup checkpoint, while final parity review now rolls into release-level `m-7` review work #m-4 #review
