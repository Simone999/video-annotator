import { execFileSync } from "node:child_process";
import { resolve } from "node:path";

import { test } from "@playwright/test";

import { buildHttpUrl, loadRepoEnv } from "../helpers/repo-env";

const REPO_ROOT = resolve(__dirname, "../..");
const isDockerRunMode = process.env.PLAYWRIGHT_RUN_MODE === "docker";
const e2eEnv = loadRepoEnv(isDockerRunMode ? "docker-e2e" : "e2e");
const backendBaseUrl = isDockerRunMode
  ? buildHttpUrl("backend", e2eEnv.BACKEND_PORT ?? "8000")
  : buildHttpUrl(
      e2eEnv.BACKEND_HOST ?? "127.0.0.1",
      e2eEnv.BACKEND_PORT ?? "8001",
    );

function run(command: string, args: string[]) {
  execFileSync(command, args, {
    cwd: REPO_ROOT,
    stdio: "inherit",
  });
}

async function waitForSeededBackend() {
  const deadline = Date.now() + 30_000;

  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${backendBaseUrl}/api/videos`);
      if (!response.ok) {
        await new Promise<void>((resolveWait) => {
          setTimeout(resolveWait, 250);
        });
        continue;
      }

      const payload: unknown = await response.json();
      if (Array.isArray(payload) && payload.length > 0) {
        return;
      }
    } catch {
      // Backend may still be starting; retry until deadline.
    }

    await new Promise<void>((resolveWait) => {
      setTimeout(resolveWait, 250);
    });
  }

  throw new Error("Backend did not become ready with seeded videos");
}

test.setTimeout(60_000);

test("bootstrap explicit e2e storage", async () => {
  if (isDockerRunMode === false) {
    run("npm", ["run", "backend:db:reset:e2e"]);
    run("npm", ["run", "backend:db:migrate:e2e"]);
    run("npm", ["run", "backend:seed:e2e"]);
  }

  await waitForSeededBackend();
});
