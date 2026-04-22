---
title: React best practices
type: reference
canonical: true
domain: frontend
aliases:
- react rules
- thin route pages
- split by responsibility
permalink: video-annotator/reference/react-best-practices
tags:
- react
- frontend
- routing
- hooks
- state
- effects
- reference
---

# React best practices

Repo house rules for React. This note stores local frontend guidance, not a copy of generic React docs.

## House rules

- Keep route or page components thin. They should read params, start feature hooks, choose layout seams, and pass props down.
- Split by visible responsibility, not by arbitrary line count.
- Keep state as local as possible. Lift only when two parts truly need shared control.
- Do not store derived values in state.
- Use `useEffect` only for external synchronization.
- Prefer props before context for shallow trees.
- Use stable durable ids for keys.
- Optimize after measurement, not before.

## Smells that mean split now

- too many unrelated `useState` calls in one file
- several unrelated `useEffect`s
- one file owns route wiring, data loading, actions, and large JSX areas together
- many booleans for unrelated concerns
- `useEffect(() => setX(...), [deps])` for a value that can be derived

## Source links

- https://react.dev/learn/understanding-your-ui-as-a-tree
- https://react.dev/learn/you-might-not-need-an-effect
- https://react.dev/learn/reusing-logic-with-custom-hooks
- https://react.dev/reference/rules/components-and-hooks-must-be-pure

## Observations

- [pattern] Thin route or page components should read params, wire feature data, choose layout sections, and hand off to feature-owned screens. #react #frontend #routing
- [pattern] Split review UI by visible responsibility such as toolbar, stage, overlay, timeline, and sidebar instead of letting one screen file own all concerns. #react #frontend #component-composition
- [guideline] Keep React render pure; move side effects into Effects or event handlers. #react #purity
- [guideline] Keep state minimal and local; derive computed values during render instead of storing duplicates. #react #state
- [retrieval] Use this note for thin route pages, split-by-responsibility, derived-state, or React house-rule queries. #search

## Relations

- indexed_by [[Reference Index]]
- relates_to [[Architecture]]
