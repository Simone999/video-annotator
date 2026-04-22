import { describe, expect, it } from "vitest";

import viteConfig from "../../../vite.config";

describe("vitest coverage config", () => {
  it("enforces 90 percent line and branch coverage for runtime frontend code", () => {
    const testConfig = viteConfig.test;

    expect(testConfig?.coverage).toEqual({
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "tests/**",
        "src/**/*.stories.tsx",
        "src/**/*.d.ts",
        "src/vite-env.d.ts",
      ],
      provider: "v8",
      reporter: ["text"],
      thresholds: {
        branches: 90,
        lines: 90,
      },
    });
  });
});
