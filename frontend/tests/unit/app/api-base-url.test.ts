import { afterEach, describe, expect, it, vi } from "vitest";

describe("DEFAULT_API_BASE_URL", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("uses configured api base url when env value is present", async () => {
    vi.stubEnv("VITE_API_BASE_URL", "http://127.0.0.1:9000/api");
    vi.resetModules();

    const { DEFAULT_API_BASE_URL } =
      await import("../../../src/shared/api/base-url");

    expect(DEFAULT_API_BASE_URL).toBe("http://127.0.0.1:9000/api");
  });

  it("falls back to slash-api when env value is empty", async () => {
    vi.stubEnv("VITE_API_BASE_URL", "");
    vi.resetModules();

    const { DEFAULT_API_BASE_URL } =
      await import("../../../src/shared/api/base-url");

    expect(DEFAULT_API_BASE_URL).toBe("/api");
  });
});
