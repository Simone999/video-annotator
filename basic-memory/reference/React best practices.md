---
title: React best practices
type: reference
permalink: video-annotator/reference/react-best-practices
tags:
- react
- frontend
- routing
- component-composition
- hooks
- state
- derived-state
- context
- effects
- performance
- reference
---

# React best practices

## Table of contents

- [Main rules](#main-rules)
- [Five-layer split](#five-layer-split)
- [Route and page shape](#route-and-page-shape)
- [Split by responsibility](#split-by-responsibility)
- [State, hooks, Effects, purity](#state-hooks-effects-purity)
- [Smell check](#smell-check)
- [Good smells](#good-smells)
- [Sources](#sources)

## Main rules

1. [Use five-layer split before files get huge](#five-layer-split)
2. [Keep route or page component thin](#route-and-page-shape)
3. [Split by responsibility, not line count](#split-by-responsibility)
4. [Keep state as local as possible](#state-hooks-effects-purity)
5. [Use custom hooks for behavior, not JSX](#state-hooks-effects-purity)
6. [Do not store derived values in state](#state-hooks-effects-purity)
7. [Use `useEffect` only for external synchronization](#state-hooks-effects-purity)
8. [Prefer props first, context later](#state-hooks-effects-purity)
9. [Keep components pure](#state-hooks-effects-purity)
10. [Use smell checks before files get huge](#smell-check)

## Five-layer split

Use this as quick mental model when review UI starts to sprawl:

- page component = route params + data wiring + layout composition
- child components = visible sections
- custom hooks = domain behavior
- local state = transient UI state close to where used
- global store or context = only truly shared app-wide concerns

## Route and page shape

Keep route or page component thin. In this repo, page should mostly:

1. read route params
2. call feature hooks or screen entrypoints
3. choose layout sections
4. pass props down

If page owns toolbar markup, timeline markup, sidebar markup, dialogs, data loading, and annotation logic all together, page too big.

## Split by responsibility

Split by visible responsibility, not line count alone. Good split targets for review UI:

- `review-page.tsx` for route orchestration
- `live-review-screen.tsx` for current screen composition seam
- `review-toolbar.tsx` for actions
- `video-canvas.tsx` for stage rendering
- `annotation-overlay.tsx` for boxes and masks
- `timeline.tsx` for frame navigation and range UI
- `review-sidebar.tsx` for selected annotation details
- `use-playback.ts`, `use-review-data.ts`, `use-annotation-selection.ts` for domain behavior

Example layout:

```text
features/video-review/
├─ pages/
│  └─ review-page.tsx
├─ components/
│  ├─ live-review-screen.tsx
│  ├─ review-toolbar.tsx
│  ├─ video-canvas.tsx
│  ├─ annotation-overlay.tsx
│  ├─ timeline.tsx
│  └─ review-sidebar.tsx
├─ hooks/
│  ├─ use-playback.ts
│  ├─ use-review-data.ts
│  └─ use-annotation-selection.ts
└─ types.ts
```

Repo-shaped example:

```tsx
function VideoReviewRoutePage() {
  const { videoId } = useParams<{ videoId: string }>();
  const review = useReviewData(videoId ?? null);
  const playback = usePlayback(review.video);
  const selection = useAnnotationSelection(review.annotations);

  return (
    <LiveReviewLayout
      toolbar={<ReviewToolbar playback={playback} />}
      stage={
        <VideoCanvas video={review.video}>
          <AnnotationOverlay
            annotations={review.annotations}
            selection={selection}
          />
        </VideoCanvas>
      }
      timeline={<Timeline playback={playback} />}
      sidebar={<ReviewSidebar selection={selection.current} />}
    />
  );
}
```

Use example as shape guidance, not as forced immediate refactor.

## State, hooks, Effects, purity

1. Keep state local. Lift only to closest common parent when two sections must stay in sync.
2. Use custom hooks for behavior. Good hook owns playback, keyboard shortcuts, selection rules, data loading, or other domain logic. Hook shares logic, not state instance.
3. Do not store derived values in state. If render can compute value from props or existing state, compute it there.
4. Use `useEffect` only for outside-world sync: network, timers, subscriptions, browser APIs, non-React systems. No effect as main control flow. User action logic stays in event handlers.
5. Prefer props first, context later. Context for deep shared values, not lazy shortcut around few prop hops.
6. Keep components pure. No mutation, network call, timer setup, DOM write, or hidden side effect in render.
7. Reset subtree with `key` when identity changes. Use stable durable IDs for keys. No array index when list can reorder, insert, or delete.
8. Optimize last. First fix state shape, prop churn, and unnecessary Effects. Memoization only after measurement.

## Smell check

Split component when you see one or more of these:

- more than about `5-7` `useState` calls in one page or screen file
- several unrelated `useEffect`s
- long JSX with clearly separate visual areas
- event handlers for many unrelated concerns
- many booleans like `isOpenA`, `isOpenB`, `isDragging`, `isHovered`, `isPlaying`, `isDirty` in one file
- `useEffect(() => setX(...), [deps])` for value you can derive
- prop copied into state without clear reset rule

## Good smells

- thin route page owns params and handoff only
- screen composes visible sections instead of owning every detail inline
- Effects are few and clearly about external sync
- derived values stay derived, not copied into state
- state ownership is obvious
- props stay small and explicit
- tests assert user-visible behavior

## Sources

- https://react.dev/learn/understanding-your-ui-as-a-tree
- https://react.dev/learn/you-might-not-need-an-effect
- https://react.dev/learn/managing-state
- https://react.dev/learn/reusing-logic-with-custom-hooks
- https://react.dev/learn/passing-data-deeply-with-context
- https://react.dev/learn/synchronizing-with-effects
- https://react.dev/reference/rules/components-and-hooks-must-be-pure

## Observations

- [pattern] Thin route or page components should read params, wire feature data, choose layout sections, and hand off to feature-owned screens. #react #frontend #routing
- [pattern] Split review UI by visible responsibility such as toolbar, stage, overlay, timeline, and sidebar instead of letting one screen file own all concerns. #react #frontend #component-composition
- [pattern] Custom hooks should package domain behavior like playback, review data, and selection logic; they do not magically share state instances. #react #hooks #frontend
- [guideline] Keep React render pure; move side effects into Effects or event handlers. #react #purity
- [guideline] Keep state minimal and local; derive computed values during render instead of storing duplicates. #react #state
- [guideline] Prefer props before context for shallow feature trees; use context only when deep sharing is real. #react #context
- [guideline] Use Effects only for external synchronization, not internal data reshaping. #react #effects
- [pattern] Lift shared state to closest common owner when sibling components must stay in sync. #react #state
- [pattern] Reset component state with `key` when identity changes. #react #keys
- [guardrail] Use stable data IDs for keys; array indexes break reordered or inserted lists. #react #keys
- [smell] Several unrelated Effects, many local booleans, and large mixed JSX in one screen usually mean split by responsibility now. #react #frontend #smell
- [performance] Optimize after measurement; memoization is not first tool. #react #performance
- [retrieval] Use this note for React best practices, thin route pages, split by responsibility, hooks, derived state, context, or key usage queries. #react #frontend #reference

## Relations

- indexed_by [[Reference Index]]
- relates_to [[Architecture]]
- relates_to [[Frontend Interaction Spec]]
- relates_to [[Testing tools]]
