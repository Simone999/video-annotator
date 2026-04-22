/// <reference types="node" />

import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import { expect, test as base } from "@playwright/test";

import { loadRepoEnv } from "../../helpers/repo-env";

const REPO_ROOT = fileURLToPath(new URL("../../../..", import.meta.url));
const e2eEnv = loadRepoEnv("e2e");

type ReviewNavigationScenario = {
  readonly frame_indices: readonly [number, number];
  readonly object_id: string;
  readonly video_id: string;
};

export const test = base.extend<{
  reviewNavigationSeed: ReviewNavigationScenario;
}>({
  reviewNavigationSeed: async ({ page }, use) => {
    void page;
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
          APP_DB_URL: e2eEnv.APP_DB_URL,
          APP_MASKS_DIR: e2eEnv.APP_MASKS_DIR,
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
