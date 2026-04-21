---
title: Test Guidance Audit
type: note
permalink: video-annotator/tests/test-guidance-audit
tags:
- tests
- testing
- agents
- audit
- playwright
- vitest
- pytest
---

# Test Guidance Audit

This note records an audit of `basic-memory/tests/` using 5 isolated agent runs plus 1 confirmation rerun.
Goal was simple: see whether a dumb agent can choose the right test layer and write good tests for `[[Video Ingest and Exact-Frame Review]]` when the task does not say `unit`, `integration`, or `e2e`.

## Pre-fix problems

- `tests/` had no dedicated `[[unit-tests]]` router note.
- Canonical test-note names were inconsistent, especially around `[[e2e-tests]]`.
- Router and leaf notes did not say strongly enough that existing tests are not source of truth for layer choice.
- `[[e2e-tests]]` still had stale example labels that drifted from the product shape.
- Repo had Playwright package fragments but no real root browser E2E harness.

## Changes made before audit

- added `[[unit-tests]]`
- rewrote `[[Tests Index]]` into the main layer router
- normalized canonical note names and links across test guidance
- strengthened `[[frontend-integration-tests]]`, `[[backend-api-integration-tests]]`, and `[[e2e-tests]]`
- fixed stale E2E example labels to match shipped UI
- saved shared prompt in [[Test Guidance Audit Prompt]]
- installed root Playwright harness with:
  - `playwright.config.ts`
  - root `test:e2e*` scripts
  - `e2e/video-ingest-and-exact-frame-review.spec.ts`
  - isolated E2E DB and masks dir through `APP_DB_URL` and `APP_MASKS_DIR`

## Agent results

| Agent | Model | Reasoning | Chosen layer | Output | Verdict |
| --- | --- | --- | --- | --- | --- |
| Volta | `gpt-5.4-mini` | `low` | frontend integration | Added one focused `App.test.tsx` case and ran frontend test green | good |
| Franklin | `gpt-5.4-mini` | `high` | browser E2E | Added one Playwright invalid-frame case, no verification | wrong |
| Lorentz | `gpt-5.3-codex-spark` | `low` | frontend integration | Added two `App.test.tsx` cases, left test red before forced stop | mixed |
| Helmholtz | `gpt-5.3-codex-spark` | `high` | frontend integration | Read notes and code, then inspected existing tests and stopped without edits | wrong |
| Erdos | `gpt-5.2` | `medium` | frontend integration plus backend API integration | Chose plausible layers, wrote no tests, ran no verification | wrong |

## Confirmation rerun

After 3 agents repeated the same mistake of using existing tests as routing evidence, the notes were patched to say:

- choose layer from feature notes and product code first
- do not use existing tests as source of truth for layer choice

Then the weakest failed model was rerun once in a fresh `/tmp` worktree:

| Agent | Model | Reasoning | Chosen layer | Output | Verdict |
| --- | --- | --- | --- | --- | --- |
| Tesla | `gpt-5.2` | `medium` | frontend integration plus backend API integration | Did not cite existing tests as routing truth anymore, but still stopped at planning and wrote no tests | mixed |

The rerun shows the note fix helped one failure mode, but did not make the weakest model reliably execute.

## Good patterns from the agents

- 5 of 5 read the test-guidance notes before proposing a boundary.
- 4 of 5 avoided defaulting to browser E2E.
- 3 of 5 recognized frontend integration as the natural default for open/load/jump/step review behavior.
- best agent kept the scope narrow, asserted canonical frame text, and ran the relevant frontend test command.

## Repeated mistakes from the agents

- 3 of 5 used existing tests as source of truth or as justification for boundary choice before the note fix.
- 3 of 5 stopped at planning or inspection instead of finishing implementation plus verification.
- 2 of 5 reused existing test fixture names like `sample-b.mp4` instead of the note examples and real repo fixture names.
- 1 of 5 escalated to browser E2E because lower-layer coverage already existed, which is backward reasoning for boundary choice.

## What the audit says about current guidance

The guidance is now good enough to steer most agents away from default browser E2E and toward frontend integration for this feature slice.
The guidance is not yet strong enough to guarantee execution discipline.
Weak models still stall in planning, and direct memory search still tends to rank `[[Tests Index]]` above the leaf note for queries like `unit tests`, `frontend integration tests`, `backend api integration tests`, and `e2e tests`.

That means routing is discoverable, but leaf-note retrieval is still imperfect.

## Recommended reading order for future agents

1. `[[Tests Index]]`
2. one leaf note chosen from the router
3. `[[Testing tools]]`
4. owning feature note
5. owning testing task note
6. product code

Only after boundary is already chosen should an agent look at existing tests for style or shared helpers.

## Observations

- [result] Most agents picked a non-browser-first boundary after reading the test notes, so the layer router is directionally correct. #testing #agents #audit
- [failure_mode] Existing tests were the most common wrong routing signal until the notes were patched to forbid that explicitly. #testing #agents #anti-pattern
- [result] The confirmation rerun stopped using existing tests as routing truth, but the weakest model still failed to execute. #testing #agents #rerun
- [tooling] A real root Playwright harness with an isolated E2E database was required before browser-workflow auditing was honest. #testing #playwright #tooling
- [retrieval] `Tests Index` is easy to find, but direct search still prefers the router over leaf notes for some plain test-type queries. #testing #search #navigation

## Relations

- indexed_by [[Tests Index]]
- relates_to [[Test Guidance Audit Prompt]]
- relates_to [[Tests Index]]
- relates_to [[Testing tools]]
- relates_to [[unit-tests]]
- relates_to [[frontend-integration-tests]]
- relates_to [[backend-api-integration-tests]]
- relates_to [[e2e-tests]]
- relates_to [[Video Ingest and Exact-Frame Review]]
- relates_to [[Testing video ingest and exact-frame review]]
