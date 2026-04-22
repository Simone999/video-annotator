---
title: Add root workflow note plan
type: plan
status: done
permalink: video-annotator/plans/add-root-workflow-note-plan
tags:
- plan
- workflow
- memory
- source-of-truth
- onboarding
---

# Add root workflow note plan

This plan adds one root memory note, `basic-memory/Workflow.md`, as the canonical step-by-step SOP for feature work. Goal: make the workflow easy to reconstruct for a junior developer or agent without forcing them to stitch together `AGENTS.md`, templates, indexes, and old plan notes by hand.

## Summary
- Add `basic-memory/Workflow.md` in memory root.
- Make it the operational SOP for feature work.
- Keep `AGENTS.md` as enforcement and guardrails.
- Keep existing plan notes as rationale and audit trail.
- Fix routing so the new SOP is easy to find.

## Planned deliverables
1. Create `basic-memory/Workflow.md`.
2. Update `AGENTS.md` to point readers to `basic-memory/Workflow.md` as the step-by-step SOP.
3. Update `basic-memory/Memory Index.md` so the root map matches current memory layout and includes `[[Workflow]]`.
4. Update `basic-memory/features/Features Index.md` and `basic-memory/tasks/Tasks Index.md` so both routes point readers to `[[Workflow]]`.

## Workflow note contract
`[[Workflow]]` should answer, in one place:
- where truth lives
- what to read first
- exact order before coding
- when to define integration, e2e, and manual tests
- how feature notes and task notes interact
- when TDD starts
- what to update during work
- what must be true before a task is done

## Validation
- A new reader should be able to reconstruct the workflow by reading `AGENTS.md` and `[[Workflow]]`.
- `[[Workflow]]` should link cleanly to `[[Features Index]]`, `[[Feature Template]]`, `[[Tasks Index]]`, and `[[Task Template]]`.
- `[[Memory Index]]`, `[[Features Index]]`, and `[[Tasks Index]]` should all route readers toward `[[Workflow]]`.
- `[[Workflow]]` wording should match `AGENTS.md` terminology: feature note, task note, integration, e2e, manual tables, TDD first, honest blocked status.

## Assumptions
- `Workflow.md` in memory root is easiest to discover.
- This note is operational SOP, not a second rationale document.
- Fixing stale root routing is part of this work because otherwise the new note stays hard to discover.

## Execution Log
1. Saved this plan in `basic-memory/plans/` and routed it from `[[Plans Index]]`.
2. Added `[[Workflow]]` in memory root as the canonical step-by-step SOP for feature work.
3. Updated `AGENTS.md` to point readers to `basic-memory/Workflow.md` before the pre-code checklist.
4. Updated `[[Memory Index]]`, `[[Features Index]]`, and `[[Tasks Index]]` so a new reader gets routed toward `[[Workflow]]`.
5. Restored `[[Tests Index]]` after routing review found the root map pointed to it while the file was missing from the working tree.
6. Task-by-task reviews passed after fixing the missing sam2-demo and implementation-plan steps in `[[Workflow]]`, and after restoring `[[Tests Index]]`.
7. Global final review approved the final state with no findings.

## Relations
- relates_to [[Memory Index]]
- relates_to [[Plans Index]]
- relates_to [[Feature notes and test matrix workflow plan]]
