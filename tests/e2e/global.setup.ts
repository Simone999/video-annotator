import { execFileSync } from "node:child_process";
import { resolve } from "node:path";

import { test } from "@playwright/test";

const REPO_ROOT = resolve(__dirname, "../..");

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
      const response = await fetch("http://127.0.0.1:8000/api/videos");
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
  run("npm", ["run", "backend:db:reset:e2e"]);
  run("npm", ["run", "backend:db:migrate:e2e"]);
  run("npm", ["run", "backend:seed:e2e"]);
  await waitForSeededBackend();
});
