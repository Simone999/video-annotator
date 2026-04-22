// @vitest-environment node

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const frontendRoot = fileURLToPath(new URL("../../../", import.meta.url));

function readFrontendFile(relativePath: string): string {
  return readFileSync(join(frontendRoot, relativePath), "utf8");
}

describe("frontend style entry", () => {
  it("keeps one global style entry under src/styles and imports it only from main.tsx", () => {
    const styleEntryPath = join(frontendRoot, "src/styles/app.css");
    const tokensPath = join(frontendRoot, "src/styles/tokens.css");
    const basePath = join(frontendRoot, "src/styles/base.css");
    const utilitiesPath = join(frontendRoot, "src/styles/utilities.css");

    expect(existsSync(styleEntryPath)).toBe(true);
    expect(existsSync(tokensPath)).toBe(true);
    expect(existsSync(basePath)).toBe(true);
    expect(existsSync(utilitiesPath)).toBe(true);

    const styleEntry = readFrontendFile("src/styles/app.css");
    const mainSource = readFrontendFile("src/main.tsx");
    const appSource = readFrontendFile("src/app/App.tsx");
    const liveReviewSource = readFrontendFile(
      "src/features/video-review/components/live-review-screen.tsx",
    );

    expect(styleEntry).toContain('@import "tailwindcss";');
    expect(styleEntry).toContain('@import "./tokens.css";');
    expect(styleEntry).toContain('@import "./base.css";');
    expect(styleEntry).toContain('@import "./utilities.css";');
    expect(mainSource).toContain('import "./styles/app.css";');
    expect(appSource).not.toContain("app.css");
    expect(liveReviewSource).not.toContain("app.css");
  });
});
