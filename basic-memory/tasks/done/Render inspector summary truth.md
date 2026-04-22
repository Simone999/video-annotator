---
title: Render inspector summary truth
type: note
permalink: video-annotator/tasks/render-inspector-summary-truth
id: task-render-inspector-summary-truth
status: done
completed: 2026-04-22 03:33:00 CEST
steps:
- creation
- planning
- execution
- wrap_up
tags:
- task
- frontend
- review
- m-2
- summary
- inspector
---

# Render inspector summary truth

## Creation Phase

### Description

Render bbox, confidence, and selected-range counters from backend summary truth in live review inspector.

Read first:
- [[Workflow]]
- [[Video Ingest and Exact-Frame Review]]
- [[SAM2 Shell and Runtime]]
- `docs/spec.md`
- `docs/product/prd.md`
- `docs/ui/video-review.png`
- `frontend/src/features/video-review/components/review-inspector-panel.tsx`
- `frontend/src/features/video-review/components/live-review-screen.tsx`
- `frontend/tests/integration/video-review/live-review-screen.test.tsx`

Stage-2 rule: in planning phase, write concrete test plan and implementation plan first. In execution, follow written plan. Before `done`, run own review plus 2 subagent reviews and fix actionable findings.

### Scope

- In scope: inspector rendering, refresh rules, reviewer-facing copy order, and honest null display for confidence or corrected count
- Out of scope: new backend fields or export controls

### Affected Features

- [[Video Ingest and Exact-Frame Review]]
- [[SAM2 Shell and Runtime]]

### Acceptance Criteria

- [x] Inspector renders bbox, confidence, and frames/propagated/corrected counters from backend summary data
- [x] Object label or reviewer-facing summary leads UI, while raw object id stays secondary
- [x] Range or object changes refresh inspector summary without stale values

### Test Intent

- Backend: none
- Frontend: integration coverage for summary rendering and refresh rules
- Manual: browser-check inspector values and copy against live review layout

### Definition of Done

- [x] Planning phase records concrete tests and implementation plan before code
- [x] Own review plus 2 subagent reviews are recorded and actionable findings are fixed
- [x] Relevant tests and quality checks pass
- [x] Feature notes, task note, and routing indexes are updated honestly when truth changes

## Planning Phase

### Planned Integration Tests

- Extend `frontend/tests/integration/video-review/live-review-screen.test.tsx` with one failing story that renders backend summary values in the inspector, then proves object and range changes replace old values instead of leaving stale rows behind.

### Planned E2E Tests

- None in this slice. The browser look check can wait until timeline work lands.

### Planned Implementation

- Replace inspector placeholder copy with real summary-derived label, bbox, confidence, and frames or propagated or corrected values from controller summary state.
- Keep reviewer-facing label or summary first and object id secondary.
- Keep null confidence and null corrected counts honest with `Unavailable` style copy, not fake zeroes.
- Surface loading and error copy in the summary slot so range or object changes do not leave stale values onscreen.

### Feature Matrix Updates

- Update `[[SAM2 Shell and Runtime]]` to mark inspector summary rendering shipped while keeping selected-range timeline work pending.

## Execution Phase

### Implementation Notes
- Replaced inspector placeholder copy with selected-object summary-driven label, bbox, confidence, and track-summary counters in `frontend/src/features/video-review/components/review-inspector-panel.tsx`.
- Kept reviewer-facing label first and raw object id secondary, while null confidence and null corrected counts render as `Unavailable`.
- Added loading and error copy in summary slot so object or range changes clear stale ready values instead of leaving old summary rows onscreen.
- Tightened controller summary lifecycle in `frontend/src/features/video-review/hooks/use-live-review-controller.ts` by keying rendered summary state to current request inputs. This blocks one-render stale summary flashes when object or range changes before new `useEffect` reset lands.
- Extended `frontend/tests/integration/video-review/live-review-screen.test.tsx` to prove rendered summary values, object/range refresh, and stale out-of-order summary responses staying ignored.

## Wrap-Up Phase

### Verification

- Commands run:
- `../node_modules/.bin/vitest run tests/integration/video-review/live-review-screen.test.tsx tests/unit/video-review/api.test.ts`
- `npm run lint`
- `npm run typecheck`
- Results:
- Task-scope frontend tests pass: `22` tests green across live-review integration plus selected-object summary API parsing.
- `npm run lint` passes.
- `npm run typecheck` passes.
- Own review caught no extra scope leak after implementation; main risk was stale summary paint on object/range change, now blocked by request-key gating in controller state.
- Subagent spec review first found one stale-summary render gap from old ready data surviving until `useEffect` reset. Follow-up fix added request-key gating in controller state, and re-review approved.
- Subagent quality review next requested stronger tests: replace magic frame-count literals with derived expectations and add out-of-order response coverage. After those test upgrades, re-review approved.

### Final Summary
- Live review inspector now renders backend summary bbox, confidence, and frames or propagated or corrected counters instead of placeholder copy.
- Label now leads inspector identity, object id stays secondary, and null summary fields stay honest as `Unavailable`.
- Summary refresh now avoids stale ready rows during object or range changes, and integration coverage freezes both refresh and out-of-order response behavior.

### Completion Gate

- [x] Acceptance Criteria checkboxes updated to match reality
- [x] Definition of Done checkboxes updated to match reality
- [x] Only now may `status` change to `done`
