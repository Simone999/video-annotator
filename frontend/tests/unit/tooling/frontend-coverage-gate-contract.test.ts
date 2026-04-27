// @vitest-environment node

import { mkdtempSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const frontendRoot = fileURLToPath(new URL("../../../", import.meta.url));
const gateScriptPath = fileURLToPath(
  new URL("../../../scripts/check-vitest-coverage-gate.mjs", import.meta.url),
);

type CoverageSummaryPayload = {
  total: {
    branches: { pct: number | string };
    lines: { pct: number | string };
  };
};

function writeSummary(payload: CoverageSummaryPayload): string {
  const directory = mkdtempSync(join(tmpdir(), "frontend-coverage-gate-"));
  const summaryPath = join(directory, "coverage-summary.json");

  writeFileSync(summaryPath, JSON.stringify(payload), "utf8");
  return summaryPath;
}

function runGate(summaryPath: string, threshold = "90") {
  return spawnSync(process.execPath, [gateScriptPath, summaryPath, threshold], {
    cwd: frontendRoot,
    encoding: "utf8",
  });
}

describe("frontend coverage gate contract", () => {
  it("passes when line and branch percentages meet the threshold", () => {
    const summaryPath = writeSummary({
      total: {
        branches: { pct: 92 },
        lines: { pct: 95 },
      },
    });

    const result = runGate(summaryPath);

    expect(result.status).toBe(0);
    expect(result.stdout).toContain("Frontend coverage gate passed");
  });

  it("fails when coverage summary reports unknown totals", () => {
    const summaryPath = writeSummary({
      total: {
        branches: { pct: "Unknown" },
        lines: { pct: "Unknown" },
      },
    });

    const result = runGate(summaryPath);

    expect(result.status).toBe(1);
    expect(result.stderr).toContain("missing numeric");
  });
});
