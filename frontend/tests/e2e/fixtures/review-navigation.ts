/// <reference types="node" />

import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import { expect, test as base } from "@playwright/test";

import { loadRepoEnv } from "../../helpers/repo-env";

const REPO_ROOT = fileURLToPath(new URL("../../../..", import.meta.url));
const isDockerRunMode = process.env.PLAYWRIGHT_RUN_MODE === "docker";
const e2eEnv = loadRepoEnv(isDockerRunMode ? "docker-e2e" : "e2e");

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
    if (isDockerRunMode) {
      const scenarioJson = process.env.E2E_REVIEW_NAVIGATION_SCENARIO_JSON;
      if (typeof scenarioJson !== "string" || scenarioJson.length === 0) {
        throw new Error(
          "Docker review-navigation E2E requires E2E_REVIEW_NAVIGATION_SCENARIO_JSON",
        );
      }
      await use(JSON.parse(scenarioJson) as ReviewNavigationScenario);
      return;
    }

    const output = execFileSync(
      "uv",
      [
        "--directory",
        "backend",
        "run",
        "python",
        "-m",
        "scripts.seed_e2e",
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
