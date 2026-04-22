---
title: Keeping Vitest setup inside test config
type: engineering
permalink: video-annotator/engineering/keeping-vitest-setup-inside-test-config
canonical: true
domain: engineering
aliases:
- invalid chai property toBeInTheDocument
- failed to parse url from api
- vitest setupfiles not loaded
tags:
- vitest
- vite
- msw
- jest-dom
- env
- Invalid Chai property
- Failed to parse URL from /api
---

# Keeping Vitest setup inside test config

Use this note when frontend tests suddenly lose `jest-dom` matchers, when MSW handlers stop intercepting relative `/api/...` fetches, or when a Vite config refactor touches Vitest setup.

## Problem

A Vite config refactor can leave valid-looking Vitest fields in the wrong place.

When `setupFiles` and `exclude` move out of `test`, Vitest silently skips shared test bootstrap. Symptoms look broad and misleading:

- matcher failures such as `Invalid Chai property: toBeInTheDocument`
- relative fetch failures such as `Failed to parse URL from /api/...`
- route and component tests failing together even though product code is unchanged

## Root cause

`defineConfig` still accepts the object, but Vitest only reads `setupFiles` and `exclude` from the nested `test` block. Top-level placement means:

- `@testing-library/jest-dom/vitest` never loads
- shared MSW server lifecycle never loads
- jsdom tests using relative fetch paths break because no interceptor catches them

## Fix

Keep Vitest-only fields inside `test` in `frontend/vite.config.ts`:

- `test.setupFiles = "./tests/setup/vitest.setup.ts"`
- `test.exclude = [...configDefaults.exclude, "tests/e2e/**"]`

## What to remember

- if many frontend tests fail at once after config work, inspect the test bootstrap path before touching feature code
- `Invalid Chai property` plus relative `/api` fetch errors usually means shared Vitest setup did not load
- prefer one focused config fix over patching many tests

## Observations

- [root-cause] Broad frontend test regressions after Vite config refactors can come from misplaced Vitest fields, not broken app behavior. #vitest #vite #msw
- [symptom] `Invalid Chai property: toBeInTheDocument` and `Failed to parse URL from /api/...` together point to missing shared test bootstrap. #jest-dom #msw #testing
- [fix] Keep `setupFiles` and `exclude` inside the nested `test` block in `frontend/vite.config.ts`. #vitest #config

## Relations

- indexed_by [[Engineering Memory Index]]
- relates_to [[Aligning testing tooling with Storybook and factory-boy]]
- relates_to [[frontend-integration-tests]]