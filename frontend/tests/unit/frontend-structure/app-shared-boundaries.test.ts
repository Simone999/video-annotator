// @vitest-environment node

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const frontendRoot = fileURLToPath(new URL("../../..", import.meta.url));

function readFrontendFile(relativePath: string): string {
  return readFileSync(join(frontendRoot, relativePath), "utf8");
}

describe("frontend app and shared boundaries", () => {
  it("keeps reusable primitives in shared and router ownership in app/router", () => {
    expect(existsSync(join(frontendRoot, "src/shared/api/base-url.ts"))).toBe(
      true,
    );
    expect(
      existsSync(join(frontendRoot, "src/shared/ui/material-symbol-icon.tsx")),
    ).toBe(true);
    expect(
      existsSync(join(frontendRoot, "src/shared/ui/route-status-shell.tsx")),
    ).toBe(true);

    expect(existsSync(join(frontendRoot, "src/app/api-base-url.ts"))).toBe(
      false,
    );
    expect(
      existsSync(join(frontendRoot, "src/app/material-symbol-icon.tsx")),
    ).toBe(false);

    expect(
      existsSync(
        join(
          frontendRoot,
          "src/features/video-review/components/review-topbar.tsx",
        ),
      ),
    ).toBe(true);
    expect(
      existsSync(
        join(
          frontendRoot,
          "src/features/video-review/components/review-rail.tsx",
        ),
      ),
    ).toBe(true);

    const routerSource = readFrontendFile("src/app/router.tsx");
    const providersSource = readFrontendFile("src/app/providers.tsx");
    const libraryStatusSource = readFrontendFile(
      "src/features/video-library/components/video-library-status-panel.tsx",
    );
    const reviewStatusSource = readFrontendFile(
      "src/features/video-review/components/review-route-status-panel.tsx",
    );

    expect(routerSource).toContain("BrowserRouter");
    expect(providersSource).not.toContain("BrowserRouter");
    expect(libraryStatusSource).toContain("RouteStatusShell");
    expect(reviewStatusSource).toContain("RouteStatusShell");
  });
});
