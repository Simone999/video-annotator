import { execFileSync } from "node:child_process";
import { resolve } from "node:path";

import { expect, test as base } from "@playwright/test";

const REPO_ROOT = resolve(__dirname, "../../..");

type ReviewNavigationScenario = {
  readonly frame_indices: readonly [number, number];
  readonly object_id: string;
  readonly video_id: string;
};

export const test = base.extend<{
  reviewNavigationSeed: ReviewNavigationScenario;
}>({
  reviewNavigationSeed: async ({}, use) => {
    const output = execFileSync(
      "uv",
      [
        "--directory",
        "backend",
        "run",
        "python",
        "scripts/seed_e2e.py",
        "--scenario",
        "review-navigation",
      ],
      {
        cwd: REPO_ROOT,
        encoding: "utf8",
        env: {
          ...process.env,
          APP_DB_URL: "sqlite:////tmp/video-annotator-playwright.sqlite3",
          APP_MASKS_DIR: "/tmp/video-annotator-playwright-masks",
        },
      },
    );
    const payload: unknown = JSON.parse(output);
    if (
      typeof payload !== "object" ||
      payload === null ||
      !("scenario" in payload) ||
      payload.scenario === undefined
    ) {
      throw new Error("Review-navigation seed did not return scenario payload");
    }

    await use(payload.scenario as ReviewNavigationScenario);
  },
});

export { expect };
