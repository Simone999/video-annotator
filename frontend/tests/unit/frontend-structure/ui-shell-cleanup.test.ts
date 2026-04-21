// @vitest-environment node

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const frontendRoot = fileURLToPath(new URL("../../..", import.meta.url));
const frontendSrcRoot = fileURLToPath(new URL("../../../src", import.meta.url));
const uiShellFeatureRoot = fileURLToPath(
  new URL("../../../src/features/ui-shell", import.meta.url),
);

describe("frontend structure", () => {
  it("removes ui-shell runtime leftovers from frontend src", () => {
    expect(existsSync(uiShellFeatureRoot)).toBe(false);

    const filesWithLegacyUiShellNaming = collectFiles(frontendSrcRoot).filter(
      (filePath) => {
        const relativePath = filePath.slice(frontendRoot.length + 1);
        const source = readFileSync(filePath, "utf8");

        return (
          relativePath.includes("ui-shell") ||
          source.includes("ui-shell") ||
          source.includes("UiShell")
        );
      },
    );

    expect(filesWithLegacyUiShellNaming).toEqual([]);
  });
});

function collectFiles(rootPath: string): string[] {
  const entries = readdirSync(rootPath, { withFileTypes: true });

  return entries.flatMap((entry) => {
    const entryPath = `${rootPath}/${entry.name}`;

    if (entry.isDirectory()) {
      return collectFiles(entryPath);
    }

    if (!statSync(entryPath).isFile()) {
      return [];
    }

    return [entryPath];
  });
}
