import { describe, expect, it } from "vitest";

import viteConfig from "../../../vite.config";

function resolveVitestTestConfig() {
  const resolvedConfig =
    typeof viteConfig === "function"
      ? viteConfig({
          command: "serve",
          isPreview: false,
          isSsrBuild: false,
          mode: "development",
        })
      : viteConfig;

  return resolvedConfig.test;
}

describe("vitest coverage config", () => {
  it("enforces 90 percent line and branch coverage for runtime frontend code", () => {
    const testConfig = resolveVitestTestConfig();
    const coverageConfig = testConfig?.coverage;

    expect(coverageConfig?.include).toEqual(["src/**/*.{ts,tsx}"]);
    expect(coverageConfig?.exclude).toEqual([
      "tests/**",
      "src/**/*.stories.tsx",
      "src/**/*.d.ts",
      "src/vite-env.d.ts",
    ]);
    expect(coverageConfig?.provider).toBe("v8");
    expect(coverageConfig?.reporter).toEqual(["text"]);
    expect(coverageConfig?.thresholds?.branches).toBe(90);
    expect(coverageConfig?.thresholds?.lines).toBe(90);
  });

  it("keeps forked workers and shared setup for frontend tooling stability", () => {
    const testConfig = resolveVitestTestConfig();

    expect(testConfig?.fileParallelism).toBe(true);
    expect(testConfig?.maxWorkers).toBe("50%");
    expect(testConfig?.pool).toBe("forks");
    expect(testConfig?.setupFiles).toBe("./tests/setup/vitest.setup.ts");
  });
});
