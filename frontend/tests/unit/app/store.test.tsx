// @vitest-environment jsdom

import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useAppStore } from "../../../src/app/store";

describe("useAppStore", () => {
  it("throws when app store provider is missing", () => {
    expect(() => renderHook(() => useAppStore())).toThrow(
      "App store unavailable.",
    );
  });
});
