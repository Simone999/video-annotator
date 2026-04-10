---
id: TASK-3.14
title: Build empty two-pane frontend shell
status: Done
assignee: []
created_date: '2026-04-10 13:58'
updated_date: '2026-04-10 21:16'
labels:
  - milestone-0
  - frontend
milestone: m-0
dependencies:
  - TASK-3.9
  - TASK-3.13
references:
  - frontend/src/app/App.tsx
  - frontend/src/components/layout/
  - frontend/src/features/video/
  - frontend/src/features/annotations/
documentation:
  - docs/spec.md
  - AGENTS.md
parent_task_id: TASK-3
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Implement the Milestone 0 placeholder interface for the playback pane and exact-frame pane without adding annotation behavior that belongs to later milestones.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 The frontend renders placeholder regions for playback work, exact-frame work, and future status or controls.
- [x] #2 The layout preserves the two-pane workflow and works on desktop and narrow viewports.
- [x] #3 The shell does not imply browser-time-based annotation behavior or later annotation tools.
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Replace scaffold card with Milestone 0 placeholder shell.
2. Keep center area split into playback top and exact-frame bottom.
3. Add optional left and right sidebar placeholders as informational regions only.
4. Make layout responsive without changing center order.
5. Avoid implying tools, timeline, save/export, or browser-time annotation behavior.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Plan reviewed against docs: keep required center placeholders, sidebars optional, placeholder labels only, shortcuts reserved only.

Implemented placeholder shell in App.tsx and app.css with optional sidebars plus center playback/exact-frame stack.

Kept layout informational only, with no tool wiring, no shortcut handlers, and no browser-time annotation semantics.

Verified with make format-check, make lint, make typecheck, and npm --prefix frontend run build.
<!-- SECTION:NOTES:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Replaced the scaffold card with a Milestone 0 placeholder shell. The UI now renders optional left/right sidebar placeholders and a center stack with playback on top and exact-frame below, including on narrow screens, without implying later annotation behavior.
<!-- SECTION:FINAL_SUMMARY:END -->

## Definition of Done
<!-- DOD:BEGIN -->
- [x] #1 Run `make format-check`
- [x] #2 Run `make lint`
- [x] #3 Run `make typecheck`
- [x] #4 Run scoped tests or equivalent verification
<!-- DOD:END -->
