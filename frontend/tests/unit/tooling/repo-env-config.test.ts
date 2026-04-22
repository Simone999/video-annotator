// @vitest-environment node

import { describe, expect, it } from "vitest";

import { loadRepoEnv } from "../../helpers/repo-env";

describe("repo env loader", () => {
  it("loads development, e2e, and docker e2e defaults from repo env files", () => {
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
