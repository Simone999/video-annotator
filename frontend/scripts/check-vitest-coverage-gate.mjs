import { readFile } from "node:fs/promises";

function parseThreshold(argv) {
  const threshold = Number(argv[3] ?? "");
  if (Number.isFinite(threshold) && threshold >= 0) {
    return threshold;
  }
  throw new Error(
    "Usage: node scripts/check-vitest-coverage-gate.mjs <summary-path> <threshold>",
  );
}

function parsePercent(summary, kind) {
  const percent = summary?.total?.[kind]?.pct;
  return typeof percent === "number" ? percent : Number.NaN;
}

async function main() {
  const summaryPath = process.argv[2];
  if (typeof summaryPath !== "string" || summaryPath.length === 0) {
    throw new Error(
      "Usage: node scripts/check-vitest-coverage-gate.mjs <summary-path> <threshold>",
    );
  }

  const threshold = parseThreshold(process.argv);
  const raw = await readFile(summaryPath, "utf8");
  const summary = JSON.parse(raw);
  const lines = parsePercent(summary, "lines");
  const branches = parsePercent(summary, "branches");

  if (!Number.isFinite(lines) || !Number.isFinite(branches)) {
    throw new Error(
      "Frontend coverage summary is missing numeric line/branch totals",
    );
  }
  if (lines < threshold || branches < threshold) {
    throw new Error(
      `Frontend coverage gate failed: lines=${lines.toFixed(2)}% branches=${branches.toFixed(2)}% threshold=${threshold.toFixed(2)}%`,
    );
  }

  console.log(
    `Frontend coverage gate passed: lines=${lines.toFixed(2)}% branches=${branches.toFixed(2)}%`,
  );
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exit(1);
});
