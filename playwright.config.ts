import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: "http://127.0.0.1:5173",
    screenshot: "only-on-failure",
    trace: "on-first-retry",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
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
      url: "http://127.0.0.1:8000/api/videos",
    },
    {
      command: "npm run frontend:dev:e2e",
      name: "frontend",
      reuseExistingServer: !process.env.CI,
      stderr: "pipe",
      stdout: "ignore",
      timeout: 120_000,
      url: "http://127.0.0.1:5173",
    },
  ],
});
