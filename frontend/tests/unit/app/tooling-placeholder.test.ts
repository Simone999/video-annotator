import { describe, expect, it } from "vitest";

import { frontendScaffold } from "../../../src/tooling-placeholder";

describe("frontendScaffold", () => {
  it("keeps scaffold metadata stable", () => {
    expect(frontendScaffold).toEqual({
      name: "Video Annotator",
      stage: "frontend-scaffold",
      subtitle: "React + TypeScript + Vite foundation",
    });
  });
});
