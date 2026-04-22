// @vitest-environment node

import { afterEach, describe, expect, it } from "vitest";

import { loadRepoEnv } from "../../helpers/repo-env";

const originalEnv = {
  APP_DB_URL: process.env.APP_DB_URL,
  APP_MASKS_DIR: process.env.APP_MASKS_DIR,
  BACKEND_HOST: process.env.BACKEND_HOST,
  BACKEND_PORT: process.env.BACKEND_PORT,
  FRONTEND_HOST: process.env.FRONTEND_HOST,
  FRONTEND_PORT: process.env.FRONTEND_PORT,
  VITE_API_BASE_URL: process.env.VITE_API_BASE_URL,
};

function clearEnvVar(key: keyof typeof originalEnv): void {
  switch (key) {
    case "APP_DB_URL":
      delete process.env.APP_DB_URL;
      return;
    case "APP_MASKS_DIR":
      delete process.env.APP_MASKS_DIR;
      return;
    case "BACKEND_HOST":
      delete process.env.BACKEND_HOST;
      return;
    case "BACKEND_PORT":
      delete process.env.BACKEND_PORT;
      return;
    case "FRONTEND_HOST":
      delete process.env.FRONTEND_HOST;
      return;
    case "FRONTEND_PORT":
      delete process.env.FRONTEND_PORT;
      return;
    case "VITE_API_BASE_URL":
      delete process.env.VITE_API_BASE_URL;
      return;
  }
}

function restoreEnvVar(
  key: keyof typeof originalEnv,
  value: string | undefined,
): void {
  if (value === undefined) {
    clearEnvVar(key);
    return;
  }

  process.env[key] = value;
}

afterEach(() => {
  for (const [key, value] of Object.entries(originalEnv)) {
    restoreEnvVar(key as keyof typeof originalEnv, value);
  }
});

describe("repo env loader", () => {
  it("loads development from .env and e2e modes from dedicated env files", () => {
    for (const key of Object.keys(originalEnv)) {
      clearEnvVar(key as keyof typeof originalEnv);
    }

    const developmentEnv = loadRepoEnv("development");
    const e2eEnv = loadRepoEnv("e2e");
    const dockerE2eEnv = loadRepoEnv("docker-e2e");

    expect(developmentEnv.BACKEND_HOST).toBe("127.0.0.1");
    expect(developmentEnv.BACKEND_PORT).toBe("8000");
    expect(developmentEnv.FRONTEND_PORT).toBe("5173");
    expect(developmentEnv.VITE_API_BASE_URL).toBe("/api");

    expect(e2eEnv.BACKEND_PORT).toBe("8001");
    expect(e2eEnv.FRONTEND_PORT).toBe("3000");
    expect(e2eEnv.APP_DB_URL).toBe(
      "sqlite:////tmp/video-annotator-playwright.sqlite3",
    );
    expect(e2eEnv.APP_MASKS_DIR).toBe("/tmp/video-annotator-playwright-masks");
    expect(e2eEnv.VITE_API_BASE_URL).toBe("http://127.0.0.1:8001/api");

    expect(dockerE2eEnv.BACKEND_HOST).toBe("0.0.0.0");
    expect(dockerE2eEnv.BACKEND_PORT).toBe("8000");
    expect(dockerE2eEnv.FRONTEND_HOST).toBe("0.0.0.0");
    expect(dockerE2eEnv.FRONTEND_PORT).toBe("3000");
    expect(dockerE2eEnv.APP_DB_URL).toBe(
      "sqlite:////var/lib/video-annotator-e2e/video-annotator-playwright.sqlite3",
    );
    expect(dockerE2eEnv.APP_MASKS_DIR).toBe(
      "/var/lib/video-annotator-e2e/masks",
    );
    expect(dockerE2eEnv.VITE_API_BASE_URL).toBe("http://backend:8000/api");
  });
});
