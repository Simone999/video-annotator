import { defineConfig, devices } from "@playwright/test";
import { resolve } from "node:path";

import { buildHttpUrl, loadRepoEnv } from "../helpers/repo-env";

const isDockerRunMode = process.env.PLAYWRIGHT_RUN_MODE === "docker";
const e2eEnv = loadRepoEnv(isDockerRunMode ? "docker-e2e" : "e2e");
const frontendBaseUrl = isDockerRunMode
  ? buildHttpUrl("frontend", e2eEnv.FRONTEND_PORT ?? "3000")
  : buildHttpUrl(
      e2eEnv.FRONTEND_HOST ?? "127.0.0.1",
      e2eEnv.FRONTEND_PORT ?? "3000",
    );
const backendBaseUrl = isDockerRunMode
  ? buildHttpUrl("backend", e2eEnv.BACKEND_PORT ?? "8000")
  : buildHttpUrl(
      e2eEnv.BACKEND_HOST ?? "127.0.0.1",
      e2eEnv.BACKEND_PORT ?? "8001",
    );
const repoRoot = resolve(__dirname, "../..");

export default defineConfig({
  testDir: repoRoot,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: frontendBaseUrl,
    screenshot: "only-on-failure",
    trace: "on-first-retry",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "setup",
      testMatch: /tests\/e2e\/global\.setup\.ts/,
    },
    {
      name: "chromium",
      dependencies: ["setup"],
      testMatch: /frontend\/tests\/e2e\/.*\.spec\.ts/,
      use: {
        ...devices["Desktop Chrome"],
      },
    },
  ],
  webServer: isDockerRunMode
    ? undefined
    : [
        {
          command: "npm run backend:dev:e2e",
          name: "backend",
          reuseExistingServer: false,
          stderr: "pipe",
          stdout: "ignore",
          timeout: 120_000,
          url: `${backendBaseUrl}/openapi.json`,
        },
        {
          command: "npm run frontend:dev:e2e",
          name: "frontend",
          reuseExistingServer: false,
          stderr: "pipe",
          stdout: "ignore",
          timeout: 120_000,
          url: frontendBaseUrl,
        },
      ],
});
