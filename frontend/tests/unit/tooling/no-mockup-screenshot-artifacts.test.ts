// @vitest-environment node

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const frontendRoot = fileURLToPath(new URL("../../../", import.meta.url));
const repoRoot = join(frontendRoot, "..");

describe("no-mockup screenshot artifacts", () => {
  it("keeps screenshot stories, live Storybook styling, and committed docs/ui captures", () => {
    const requiredStoryFiles = [
      "src/features/video-library/components/video-library-status-panel.stories.tsx",
      "src/features/video-review/components/review-route-status-panel.stories.tsx",
      "src/features/video-review/exact-frame-canvas.stories.tsx",
    ];
    const requiredScreenshotFiles = [
      "docs/ui/not-found-route.png",
      "docs/ui/video-library-status-loading.png",
      "docs/ui/video-library-status-error.png",
      "docs/ui/review-route-status-loading.png",
      "docs/ui/review-route-status-error.png",
      "docs/ui/exact-frame-canvas.png",
    ];
    const storybookPreviewSource = readFileSync(
      join(frontendRoot, ".storybook/preview.ts"),
      "utf8",
    );

    for (const relativePath of requiredStoryFiles) {
      expect(existsSync(join(frontendRoot, relativePath))).toBe(true);
    }

    expect(storybookPreviewSource).toContain('import "../src/styles/app.css";');

    for (const relativePath of requiredScreenshotFiles) {
      expect(existsSync(join(repoRoot, relativePath))).toBe(true);
    }
  });
});
