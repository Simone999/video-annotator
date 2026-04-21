---
title: e2e-tests
type: note
permalink: video-annotator/tests/e2e-tests
tags:
- testing
- e2e
- playwright
- pytest
- vitest
- testing-library
---

# e2e-tests

This note explains how to write good E2E tests for video-annotator.
Use it when you need browser E2E tests, Playwright workflow guidance, or the repo rule for when E2E tests are the right layer.
Start with durable E2E guidance first, then adapt it to this repo's real stack, UI labels, and workflow shape.
Choose E2E from feature importance and boundary needs first.
Do not use existing tests as source of truth for whether browser E2E is justified.

## Table of contents

- [Routing](#routing)
- [What a good E2E test is](#what-a-good-e2e-test-is)
- [What to cover](#what-to-cover)
- [How to write them well](#how-to-write-them-well)
- [Done checklist](#done-checklist)
- [Rule of thumb](#rule-of-thumb)
- [Test case examples](#test-case-examples)

## Routing

Need help choosing the test layer first? Start with [[Tests Index]].
Use this note only after browser E2E is already the chosen boundary.
If one manual browser smoke or screenshot artifact is enough, use [[Using dev-browser for browser smoke verification]] instead of adding committed Playwright coverage.

## What a good E2E test is

A good E2E test proves that a **real user-visible workflow** works from browser to backend to database, in an environment that is close to production. It should be **few in number**, **independent**, **deterministic**, and focused on **business value**, because broad-stack tests are slower and costlier to maintain than lower-level tests. For this product, that means testing workflows like:

* open a video
* jump to an exact frame
* step frame-by-frame
* draw a box
* generate a SAM2 mask
* propagate through a frame range
* correct or delete annotations
* export final annotations

Because E2E tests are slower and more expensive than lower-level tests, use them only for the product’s most important paths.

## What to cover

Use E2E tests for **critical journeys**, not everything. For example:

* open a video and load existing annotations
* step to next and previous frame reliably
* draw a box on the current frame
* generate a mask from SAM2 using that box
* propagate the mask through a selected frame range
* export annotations
* one or two important failure paths

Do **not** try to cover every toolbar click or every edge case in E2E. Most validation, geometry logic, API behavior, and small UI states belong in lower-level tests.

## How to write them well

### 1. Test one story, not one click

Each E2E test should read like a user story:
* “user draws a box and generates a SAM2 mask”
* “user propagates a mask from frame 50 to 70”

No giant tests that cover multiple flows. Independent tests are easier to debug and run in parallel.

### 2. Use selectors a user would recognize

Prefer selectors such as:

* `getByRole`
* `getByLabel`
* visible button names

Good:

```ts
page.getByLabel('Frame number')
page.getByRole('button', { name: 'Load frame' })
page.getByRole('button', { name: 'Generate mask' })
```

Avoid CSS classes, DOM shape, and XPath for normal app interactions. Prefer user-facing, semantic queries, as they survive refactors better.

### 3. Assert outcomes, not implementation details

Check what the user can actually observe.

* current frame label shows `120`
* a box appears on the frame
* a mask overlay becomes visible
* propagation completes for the selected range
* deleted mask is gone after reload
* exported files are downloadable

Avoid assertions like:

* internal React state changed
* a specific function was called
* a certain request body shape was sent

Use Playwright’s assertions like `toBeVisible`, `toHaveText`, `toHaveURL`.

### 4. Never sleep when you can wait for signal

Do **not** use fixed delays like `waitForTimeout(2000)`. Instead, wait for something meaningful: a visible element, a network/UI state change.

### 5. Control the data

Use known test data and reset it between tests. Use:

* known small test videos
* known existing annotations
* predictable SAM2 responses, when SAM2 itself is not what you are validating
* a clean output directory for exported files

### 6. Mock only what you do not own

Keep **frontend, FastAPI app, and database real**. Stub or mock only external systems or parts that would make tests unstable for the wrong reason (e.g. SAM2 model run).

### 7. Make failures easy to investigate

Enable Playwright’s Trace Viewer, screenshots, and video on retries or failures. The viewer shows DOM, network, actions, and timeline in one place.

## Done checklist

Before you commit an E2E test, ask:

* Is this a critical reviewer workflow?
* Does it tell one clear story?
* Does it verify the exact frame when frame accuracy matters?
* Does it check visible annotation outcomes?
* Is the test data stable and controlled?
* Does it avoid fixed sleeps?
* Does it keep my app real and fake only true externals?
* Does it use the right layer for the rule being tested?
* Will the failure be easy to debug with traces, screenshots, or video?

## Rule of thumb

* test most rules in backend tests
* test screen behavior in frontend integration tests
* test only the most valuable workflows in E2E

## Test case examples

Following scenarios are not exhaustive

### Example 1: jump to an exact frame

```ts
import { test, expect } from '@playwright/test';

test('user can jump to an exact frame', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('button', { name: 'Open bedroom.mp4' }).click();
  await page.getByLabel('Frame number').fill('120');
  await page.getByRole('button', { name: 'Load frame' }).click();

  await expect(page.getByText('Canonical frame 120')).toBeVisible();
  await expect(page.getByAltText('Exact frame 120')).toBeVisible();
});
```

Why this is good:

* tests a real user story
* checks the exact canonical frame
* matches shipped product entrypoint and labels

### Example 2: frame-by-frame navigation

```ts
test('user can step frame-by-frame in both directions', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('button', { name: 'Open bedroom.mp4' }).click();
  await page.getByLabel('Frame number').fill('200');
  await page.getByRole('button', { name: 'Load frame' }).click();
  await expect(page.getByText('Canonical frame 200')).toBeVisible();

  await page.getByRole('button', { name: 'Next frame' }).click();
  await expect(page.getByText('Canonical frame 201')).toBeVisible();

  await page.getByRole('button', { name: 'Previous frame' }).click();
  await expect(page.getByText('Canonical frame 200')).toBeVisible();
});
```

Why this is good:

* checks one of the product’s core promises
* validates exact-frame stepping instead of generic playback behavior

### Example 3: draw box, generate mask and propagate through a selected end frame

```ts
test('user draws a box, generates a mask, and starts propagation from current frame', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('button', { name: 'Open bedroom.mp4' }).click();
  await page.getByLabel('New object label').fill('right hand');
  await page.getByRole('button', { name: 'Create object' }).click();
  await page.getByRole('button', { name: /right hand/i }).click();

  await page.getByLabel('Frame number').fill('50');
  await page.getByRole('button', { name: 'Load frame' }).click();

  const canvas = page.getByLabel('Exact frame canvas');
  const box = await canvas.boundingBox();
  if (box === null) {
    throw new Error('Exact frame canvas missing');
  }

  await page.mouse.move(box.x + 20, box.y + 20);
  await page.mouse.down();
  await page.mouse.move(box.x + 140, box.y + 100);
  await page.mouse.up();

  await page.getByRole('button', { name: 'Run SAM2' }).click();
  await expect(page.getByAltText(/SAM2 mask for/i)).toBeVisible();

  await page.getByLabel('Propagation end frame').fill('60');
  await page.getByRole('button', { name: 'Start propagation' }).click();

  await expect(page.getByText(/Propagation job/)).toBeVisible();
});
```

Why this is good:

* uses shipped SAM2 control names
* checks workflow state, not only button clicks
* stays coherent with current propagation shape where start frame is current frame

### Example 4: delete a saved box and confirm it stays gone

```ts
test('user deletes a saved box and keeps it gone after reload', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('button', { name: 'Open bedroom.mp4' }).click();
  await page.getByLabel('Frame number').fill('90');
  await page.getByRole('button', { name: 'Load frame' }).click();

  await expect(page.getByRole('button', { name: 'Delete saved box' })).toBeEnabled();
  await page.getByRole('button', { name: 'Delete saved box' }).click();
  await page.getByRole('button', { name: 'Load frame' }).click();

  await expect(page.getByLabel(/Saved annotation box for/i)).toHaveCount(0);
});
```

Why this is good:

* covers real correction workflow that exists today
* checks persisted outcome after reload instead of transient UI state
* avoids pretending export UI already exists


## Observations
- [pattern] Good browser E2E in this repo proves reviewer-visible workflows around canonical backend `frame_idx`, persisted reopen, and workflow wiring rather than small UI rules. #testing #e2e
- [guardrail] Browser playback stays contextual only; browser E2E must never treat playback time as annotation truth. #exact-frame #testing
- [tooling] Repo stack uses `Playwright` for browser E2E, `pytest` plus `TestClient` for backend contracts, and `Vitest` plus `jsdom` plus Testing Library for frontend integration checks. #testing #tooling
- [pattern] Current browser examples should use shipped labels like `Frame number`, `Load frame`, `New object label`, `Run SAM2`, and `Propagation end frame` instead of invented generic labels. #frontend #playwright
- [status] Export examples in this note stay aspirational because export feature is not implemented yet. #export #testing
- [retrieval] Use this note for e2e tests, browser E2E tests, Playwright tests, exact-frame browser tests, manual-box browser tests, or test-layer choice queries. #search #playwright #exact-frame
- [retrieval] Search query `e2e tests` should land on this note when reader wants browser workflow guidance instead of backend or frontend integration guidance. #testing #e2e #playwright
- [guardrail] Choose browser E2E only when lower layers cannot prove the workflow value cleanly; existing tests do not justify broadening the boundary by themselves. #testing #e2e #boundary
- [guardrail] Use current workflow labels and fixture names from product code or feature notes; do not copy stale names from older tests. #testing #e2e #fixtures
- [routing] This note pairs with [[Testing tools]], [[frontend-integration-tests]], and [[backend-api-integration-tests]] when choosing the right test layer. #testing #e2e #playwright
- [routing] `dev-browser` supports manual browser smoke and screenshot evidence, but committed full browser suites in this repo still belong to `Playwright`. #testing #e2e #dev-browser

## Relations
- indexed_by [[Tests Index]]
- relates_to [[unit-tests]]
- relates_to [[frontend-integration-tests]]
- relates_to [[backend-api-integration-tests]]
- relates_to [[Test Plan]]
- relates_to [[Testing tools]]
- relates_to [[Video Ingest and Exact-Frame Review]]
- relates_to [[Annotation Foundation and Manual Box Workflow]]
- relates_to [[SAM2 Shell and Runtime]]
- relates_to [[Export]]
- relates_to [[Using dev-browser for browser smoke verification]]
