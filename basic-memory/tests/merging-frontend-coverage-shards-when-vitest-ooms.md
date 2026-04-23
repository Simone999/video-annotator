---
title: merging-frontend-coverage-shards-when-vitest-ooms
type: test_guide
permalink: video-annotator/tests/merging-frontend-coverage-shards-when-vitest-ooms
canonical: true
domain: testing
aliases:
- frontend coverage shards
- vitest coverage oom
- merge frontend coverage json
tags:
- tests
- frontend
- vitest
- coverage
- oom
- merge
---

# Merging frontend coverage shards when Vitest OOMs

Use this when repo-level frontend coverage OOMs before `npm run test` can finish.

## Technique

- Run raw `vitest` from `frontend/`, not the workspace wrapper.
- Split the suite into stable batches.
- For each batch, emit JSON coverage and disable per-run thresholds:
  - `../node_modules/.bin/vitest run ... --coverage --coverage.reporter=json --coverage.reportsDirectory=/tmp/<dir> --coverage.thresholds.lines=0 --coverage.thresholds.branches=0`
- Merge only batch JSON files produced from the same code revision.
- Compute the final merged summary with `istanbul-lib-coverage` and enforce the repo gates there.

## Gotchas

- Stale coverage maps from files changed after earlier shards will corrupt merged branch totals. Rerun every shard that touches modified source files.
- Keep the split list stable so future reruns compare like-for-like coverage.
- Browser-proof or targeted reruns can still use plain `vitest run` without coverage while you debug a failing shard.

## Verification snippet

```js
const { createCoverageMap } = require("istanbul-lib-coverage");
const fs = require("fs");
const files = [
  "/tmp/frontend-current-batch1/coverage-final.json",
  "/tmp/frontend-current-batch2/coverage-final.json",
  "/tmp/frontend-current-batch3/coverage-final.json",
  "/tmp/frontend-current-batch4/coverage-final.json",
  "/tmp/frontend-current-batch5a/coverage-final.json",
  "/tmp/frontend-current-batch5b/coverage-final.json",
];
const map = createCoverageMap({});
for (const file of files) {
  map.merge(JSON.parse(fs.readFileSync(file, "utf8")));
}
const summary = map.getCoverageSummary().toJSON();
if (summary.lines.pct < 90 || summary.branches.pct < 90) process.exit(1);
```

## Observations

- [technique] Frontend coverage sharding is acceptable in this repo when one full Vitest coverage run OOMs, as long as every shard comes from the same revision and the merged summary still enforces `90%` lines and branches. #frontend #testing #coverage
- [gotcha] Do not merge old shard JSON with new code after you changed covered files. Branch maps drift and totals go false-red. #frontend #testing #coverage

## Relations

- indexed_by [[Tests Index]]
- relates_to [[Testing tools]]
- relates_to [[frontend-integration-tests]]