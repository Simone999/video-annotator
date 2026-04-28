---
id: m-0
title: "m-4: Mask Editing and Cleanup"
---

## Description

### Goal
Let reviewer refine, clean up, and delete mask state with honest corrected-mask semantics and reopen behavior.

### What To Implement
- corrected-mask contract plus refine backend path
- paused-stage brush refine UI and scoped cleanup flows
- checkpoint review after first five tasks and final milestone review

### Related Features
- [[Mask Editing and Cleanup]]
- [[SAM2 Shell and Runtime]]
- [[Annotation Foundation and Manual Box Workflow]]

### Ordering And Dependencies
- Land the corrected-mask contract and refine backend path before paused-stage brush refine UI and scoped cleanup flows.
- Use the checkpoint review after the first five tasks before the final milestone review closes the milestone.
- Route any release-hardening follow-on work to `m-7` instead of keeping `m-4` open.

### Historical Source
- Original archive note: `archive/milestones/in_progress/m-4 - Mask Editing and Cleanup.md`
- Original archive status: `in_progress`
