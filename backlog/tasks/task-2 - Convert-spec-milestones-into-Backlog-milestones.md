---
id: TASK-2
title: Convert spec milestones into Backlog milestones
status: Done
assignee:
  - codex
created_date: '2026-04-10 13:37'
updated_date: '2026-04-10 13:42'
labels:
  - docs
  - backlog
  - milestones
dependencies: []
documentation:
  - docs/spec.md
  - docs/delivery/milestones.md
  - AGENTS.md
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Create Backlog.md milestones directly from docs/spec.md Section 27, review them with a doc_explorer agent, and remove the old docs-based milestone register so the spec-derived Backlog milestones become the canonical milestone list.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Backlog.md contains milestones named Skeleton Exact frame review Manual annotation Masks SAM2 assist Propagation and Export in spec order.
- [x] #2 The new Backlog milestone titles and descriptions are derived from docs/spec.md only and do not mention the old docs-based milestone register.
- [x] #3 A doc_explorer agent reviews the created milestones against docs/spec.md and no drift from the spec remains.
- [x] #4 The old milestone register file is removed after the review.
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Create seven Backlog milestones from docs/spec.md Section 27 using only spec-derived names and deliverable summaries.
2. Review the created milestones with a doc_explorer agent against docs/spec.md and adjust if the review finds drift.
3. Remove the old docs/delivery/milestones.md register and any direct references that would obviously point to the deleted file.
4. Verify milestone state through Backlog milestone listing and repo search before closing the task.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Created seven Backlog milestones from docs/spec.md Section 27 and expanded each description so it includes a high-level overview plus the key milestone deliverables.

Re-ran a doc_explorer review against docs/spec.md after expanding the milestone descriptions; the review reported the milestone set clean and aligned with the spec.

Removed docs/delivery/milestones.md and updated direct references in delivery docs and the milestone planning prompt so the deleted register is no longer referenced.

Cleaned backend Pyright configuration during verification by removing a nonexistent tests path from the include list.
<!-- SECTION:NOTES:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Migrated the milestone plan from docs/spec.md into Backlog.md milestone records, expanded each milestone description to be self-explanatory, removed the old docs-based milestone register, and updated the remaining delivery docs to stop referencing the deleted file. A doc_explorer review confirmed the new milestones match the spec, and the repo verification commands were rerun successfully after the cleanup.
<!-- SECTION:FINAL_SUMMARY:END -->

## Definition of Done
<!-- DOD:BEGIN -->
- [x] #1 Run `make format-check`
- [x] #2 Run `make lint`
- [x] #3 Run `make typecheck`
- [x] #4 Run scoped tests or equivalent verification
<!-- DOD:END -->
