---
title: 'm-4: Mask Editing and Cleanup'
type: note
status: planned
permalink: video-annotator/milestones/m-4-mask-editing-and-cleanup
tags:
- milestone
- roadmap
- masks
- editing
---

# m-4: Mask Editing and Cleanup

## Goal

Let a reviewer correct masks, keep corrected state, and remove bad mask data with clear scope. This milestone is manual correction work after masks already exist.

## What To Implement

- brush add and erase tools for persisted mask correction
- delete flows for one frame mask and whole-object mask state
- corrected-mask persistence and reopen behavior for edited results

## Checklist

- [ ] one persisted mask can be corrected on one exact frame
- [ ] delete actions distinguish frame-local cleanup from whole-object cleanup
- [ ] corrected masks reopen as durable edited state

## Related Features

- [[Mask Editing and Cleanup]]

## Related Tasks

- [[Testing mask editing and cleanup]]
