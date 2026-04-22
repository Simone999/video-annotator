---
title: Aligning testing tooling with Storybook and factory-boy
type: engineering
canonical: true
domain: engineering
aliases:
- storybook react types
- factory boy pyright
- testing tooling quirks
permalink: video-annotator/engineering/aligning-testing-tooling-with-storybook-and-factory-boy
tags:
- engineering
- testing
- storybook
- factory-boy
- pyright
- typescript
- react
---

# Aligning testing tooling with Storybook and factory-boy

This note captures two repo-specific setup quirks that showed up while aligning the documented testing stack with actual project dependencies.

## Storybook in the npm workspace

Storybook packages installed through the repo-root npm workspace were hoisted into root `node_modules/`. Frontend `tsc --noEmit -p frontend/tsconfig.json` then resolved Storybook declaration files from root `node_modules/`, which in turn resolved `react` from the same root package tree. If root `package.json` does not also declare `@types/react` and `@types/react-dom`, frontend typecheck fails even though the frontend workspace already declares those packages.

Keep these facts together:

- add Storybook runtime packages in `frontend/package.json`
- keep root `package-lock.json` canonical with repo-root `npm install`
- mirror `@types/react` and `@types/react-dom` in root `package.json` so hoisted Storybook declarations can resolve React types during frontend typecheck

## factory-boy under strict Pyright

`factory-boy` works at runtime for test factories, but strict Pyright flags its public API as private-export usage and complains about nested `Meta` overrides on factory classes. In this repo, the smallest stable fix was:

- add `factory-boy` to backend dev dependencies
- keep reusable builders in `backend/tests/factories/models.py`
- add a local Pyright directive at the top of that factory module to disable `reportPrivateImportUsage` and `reportIncompatibleVariableOverride`
- prove the module with a focused pytest smoke test instead of trying to make `factory-boy` perfectly typed

This keeps strict typing pressure on the rest of the backend while isolating the third-party typing mismatch to one test-helper module.

## Observations
- [setup] Storybook hoisted through the repo-root npm workspace can force frontend typecheck to look for React types at repo root, not only inside `frontend/` #storybook #typescript #react
- [setup] Root `package.json` should mirror `@types/react` and `@types/react-dom` when Storybook packages are hoisted to root `node_modules` #storybook #typescript #workspace
- [typing] `factory-boy` is runtime-safe here but not strict-Pyright-clean, so local suppression in the helper module is the smallest reliable fix #factory-boy #pyright #testing
- [retrieval] Use this note for Storybook workspace typing, factory-boy Pyright friction, React types from root package, or testing-toolchain setup caveats #testing #storybook #factory-boy

## Relations
- indexed_by [[Engineering Memory Index]]
- relates_to [[Testing tools]]
