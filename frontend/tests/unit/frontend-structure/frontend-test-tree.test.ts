// @vitest-environment node

import { existsSync, readdirSync, statSync } from "node:fs";
import { relative } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const frontendRoot = fileURLToPath(new URL("../../..", import.meta.url));
const frontendSrcRoot = fileURLToPath(new URL("../../../src", import.meta.url));
const frontendTestsRoot = fileURLToPath(new URL("../..", import.meta.url));
const deprecatedComponentTestsRoot = fileURLToPath(
  new URL("../../component", import.meta.url),
);

describe("frontend test tree", () => {
  it("keeps frontend Vitest suites under unit or integration only", () => {
    expect(existsSync(deprecatedComponentTestsRoot)).toBe(false);

    const srcVitestFiles =
      collectVitestFiles(frontendSrcRoot).map(toRelativePath);
    expect(srcVitestFiles).toEqual([]);

    const unexpectedTestFiles = collectVitestFiles(frontendTestsRoot)
      .map(toRelativePath)
      .filter(
        (relativePath) =>
          !relativePath.startsWith("tests/unit/") &&
          !relativePath.startsWith("tests/integration/"),
      );

    expect(unexpectedTestFiles).toEqual([]);
  });
});

function collectVitestFiles(rootPath: string): string[] {
  const entries = readdirSync(rootPath, { withFileTypes: true });

  return entries.flatMap((entry) => {
    const entryPath = `${rootPath}/${entry.name}`;

    if (entry.isDirectory()) {
      return collectVitestFiles(entryPath);
    }

    if (!statSync(entryPath).isFile()) {
      return [];
    }

    if (!/\.(test|spec)\.tsx?$/.test(entry.name)) {
      return [];
    }

    return [entryPath];
  });
}

function toRelativePath(filePath: string): string {
  return relative(frontendRoot, filePath);
}
