import { readdir, rm } from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

const scriptsRoot = dirname(fileURLToPath(import.meta.url));
const frontendRoot = resolve(scriptsRoot, "..");
const repoRoot = resolve(frontendRoot, "..");
const vitestBin = resolve(repoRoot, "node_modules/vitest/vitest.mjs");
const blobReportsDirectory = resolve(frontendRoot, ".vitest-reports");
const coverageDirectory = resolve(frontendRoot, "coverage");
const testsRoot = resolve(frontendRoot, "tests");
const nodeHeapMb = process.env.VITEST_NODE_HEAP_MB ?? "4096";
const mergeNodeHeapMb = process.env.VITEST_MERGE_NODE_HEAP_MB ?? "12288";
const maxWorkers = process.env.VITEST_MAX_WORKERS ?? "1";

async function main() {
  await rm(blobReportsDirectory, { force: true, recursive: true });
  await rm(coverageDirectory, { force: true, recursive: true });

  const testFiles = await collectTestFiles(testsRoot);
  if (testFiles.length === 0) {
    await runVitestCommand(["run", "--passWithNoTests", "--coverage"]);
    return;
  }

  for (const [index, testFile] of testFiles.entries()) {
    await runVitestCommand([
      "run",
      testFile,
      "--passWithNoTests",
      "--coverage",
      "--coverage.thresholds.lines=0",
      "--coverage.thresholds.branches=0",
      "--coverage.reporter=json-summary",
      "--reporter=blob",
      `--outputFile.blob=${resolve(blobReportsDirectory, `blob-${String(index + 1)}.json`)}`,
      `--maxWorkers=${maxWorkers}`,
    ]);
  }

  await runVitestCommand(
    ["--mergeReports", blobReportsDirectory, "--coverage"],
    mergeNodeHeapMb,
  );
}

async function collectTestFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = resolve(directory, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === "e2e") {
          return [];
        }
        return collectTestFiles(entryPath);
      }
      if (!entry.isFile()) {
        return [];
      }
      if (entry.name.endsWith(".test.ts") || entry.name.endsWith(".test.tsx")) {
        return [relative(frontendRoot, entryPath)];
      }
      return [];
    }),
  );

  return files.flat().sort((left, right) => left.localeCompare(right));
}

async function runVitestCommand(args, heapMb = nodeHeapMb) {
  await new Promise((resolvePromise, rejectPromise) => {
    const child = spawn(process.execPath, [vitestBin, ...args], {
      cwd: frontendRoot,
      env: {
        ...process.env,
        NODE_OPTIONS: `--max-old-space-size=${heapMb}`,
      },
      stdio: "inherit",
    });
    child.on("error", rejectPromise);
    child.on("exit", (code) => {
      if (code === 0) {
        resolvePromise();
        return;
      }
      rejectPromise(
        new Error(
          `Vitest command failed (${code ?? "signal"}): ${args.join(" ")}`,
        ),
      );
    });
  });
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exit(1);
});
