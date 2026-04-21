import { defineConfig, devices } from "@playwright/test";

const frontendPort = process.env.FRONTEND_E2E_PORT ?? "3000";
const frontendBaseUrl = `http://127.0.0.1:${frontendPort}`;

export default defineConfig({
  testDir: ".",
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
      testMatch: /global\.setup\.ts/,
    },
    {
      name: "chromium",
      dependencies: ["setup"],
      testMatch: /specs\/.*\.spec\.ts/,
      use: {
        ...devices["Desktop Chrome"],
      },
    },
  ],
  webServer: [
    {
      command: "npm run backend:dev:e2e",
      name: "backend",
      reuseExistingServer: !process.env.CI,
      stderr: "pipe",
      stdout: "ignore",
      timeout: 120_000,
      url: "http://127.0.0.1:8000/openapi.json",
    },
    {
      command: "npm run frontend:dev:e2e",
      name: "frontend",
      reuseExistingServer: !process.env.CI,
      stderr: "pipe",
      stdout: "ignore",
      timeout: 120_000,
      url: frontendBaseUrl,
    },
  ],
});
