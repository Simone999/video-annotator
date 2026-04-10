---
id: TASK-3.13
title: Scaffold frontend React and Vite app
status: Done
assignee:
  - codex
created_date: '2026-04-10 13:58'
updated_date: '2026-04-10 21:08'
labels:
  - milestone-0
  - frontend
milestone: m-0
dependencies:
  - TASK-3.9
references:
  - frontend/package.json
  - frontend/tsconfig.json
  - frontend/vite.config.ts
  - frontend/index.html
  - frontend/src/main.tsx
documentation:
  - docs/spec.md
  - AGENTS.md
parent_task_id: TASK-3
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Create the Milestone 0 frontend application scaffold using React TypeScript and Vite so later tasks can implement the empty two-pane shell on a real app foundation.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 The frontend project includes the package and config files needed for a React TypeScript Vite application.
- [x] #2 The frontend scaffold can be launched locally once the documented startup flow is added.
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Update `frontend/package.json` to add minimal runtime and dev dependencies for React + TypeScript + Vite, plus scripts needed for `dev`, `build`, and existing typecheck/lint flow.
2. Add minimal Vite scaffold files: `frontend/index.html`, `frontend/vite.config.ts`, and `frontend/src/main.tsx`.
3. Replace tooling-only placeholder with minimal app entry files, likely `frontend/src/app/App.tsx` and a small CSS file, while keeping UI content trivial so `TASK-3.14` owns actual empty two-pane shell behavior.
4. Expand TypeScript and ESLint config only as needed to support `.tsx` and Vite/React entrypoints, without introducing extra app features.
5. Keep scope to app foundation only: no real playback pane, no exact-frame shell, no routing, no state libraries, no API wiring beyond scaffold readiness.
6. Verify with `make format-check`, `make lint`, `make typecheck`, plus a scoped frontend build or equivalent launch-readiness check.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Attempted `doc_explorer` plan review and `codebase_explorer` repo-pointer review for TASK-3.13, but both services returned temporary high-demand errors. Proceeding with same checklist locally to avoid stalling Milestone 0 implementation.

Added React + TypeScript + Vite scaffold files and updated frontend package/config files for `.tsx` app entrypoints.

Local plan-review checklist used because `doc_explorer` and `codebase_explorer` were unavailable: stayed at scaffold level, preserved React + TypeScript + Vite stack, avoided later-milestone UI/state/API/SAM2 behavior, and extended existing tooling only as needed.

Verified on final state with `make format-check`, `make lint`, `make typecheck`, and `npm --prefix frontend run build`.

Mini code reviewer approved final scaffold and separation from TASK-3.14.
<!-- SECTION:NOTES:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Added Milestone 0 frontend scaffold on React + TypeScript + Vite. Updated frontend package/config files for runtime and build support, added Vite entry files, and replaced tooling-only placeholder with minimal app entrypoint files that keep UI scope trivial so TASK-3.14 can own the empty two-pane shell.

Verification:
- `make format-check`
- `make lint`
- `make typecheck`
- `npm --prefix frontend run build`
- Mini reviewer approval on final scaffold state
<!-- SECTION:FINAL_SUMMARY:END -->

## Definition of Done
<!-- DOD:BEGIN -->
- [x] #1 Run `make format-check`
- [x] #2 Run `make lint`
- [x] #3 Run `make typecheck`
- [x] #4 Run scoped tests or equivalent verification
<!-- DOD:END -->
