import { describe, expect, it } from "vitest";

import { DEFAULT_API_BASE_URL } from "../../../src/shared/api/base-url";

describe("DEFAULT_API_BASE_URL", () => {
  it("falls back to /api in test envs without configured base url", () => {
    expect(DEFAULT_API_BASE_URL).toBe("/api");
  });
});
