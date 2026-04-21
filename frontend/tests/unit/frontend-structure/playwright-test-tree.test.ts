// @vitest-environment node

import { existsSync, readdirSync, statSync } from "node:fs";
import { relative } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const repoRoot = fileURLToPath(new URL("../../../../", import.meta.url));
const frontendE2eRoot = fileURLToPath(new URL("../../e2e", import.meta.url));
const frontendE2eFixturesRoot = fileURLToPath(
  new URL("../../e2e/fixtures", import.meta.url),
);
const legacyPlaywrightSpecsRoot = fileURLToPath(
  new URL("../../../../tests/e2e/specs", import.meta.url),
);
const legacyPlaywrightFixturesRoot = fileURLToPath(
  new URL("../../../../tests/e2e/fixtures", import.meta.url),
);

describe("playwright test tree", () => {
  it("keeps committed frontend browser files under frontend/tests/e2e", () => {
    expect(existsSync(legacyPlaywrightSpecsRoot)).toBe(false);
    expect(existsSync(legacyPlaywrightFixturesRoot)).toBe(false);
    expect(existsSync(frontendE2eFixturesRoot)).toBe(true);
    expect(collectSpecFiles(frontendE2eRoot).map(toRelativePath)).not.toEqual(
      [],
    );
  });
});

function collectSpecFiles(rootPath: string): string[] {
  if (!existsSync(rootPath)) {
    return [];
  }

  const entries = readdirSync(rootPath, { withFileTypes: true });

  return entries.flatMap((entry) => {
    const entryPath = `${rootPath}/${entry.name}`;

    if (entry.isDirectory()) {
      return collectSpecFiles(entryPath);
    }

    if (!statSync(entryPath).isFile()) {
      return [];
    }

    if (!entry.name.endsWith(".spec.ts")) {
      return [];
    }

    return [entryPath];
  });
}

function toRelativePath(filePath: string): string {
  return relative(repoRoot, filePath);
}
