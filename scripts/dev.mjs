import { spawn } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";

import { buildHttpUrl, loadRepoEnv, repoRoot } from "./env.mjs";

const env = loadRepoEnv("development");
const backendHealthUrl = buildHttpUrl(
  env.BACKEND_HOST ?? "127.0.0.1",
  env.BACKEND_PORT ?? "8000",
  "/api/health",
);

let frontendProcess = null;
let shuttingDown = false;

const backendProcess = spawn("npm", ["run", "backend:dev"], {
  cwd: repoRoot,
  env,
  stdio: "inherit",
});

function stopChildProcess(childProcess) {
  if (childProcess === null || childProcess.killed) {
    return;
  }

  childProcess.kill("SIGTERM");
}

function shutdown(exitCode = 0) {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;
  stopChildProcess(frontendProcess);
  stopChildProcess(backendProcess);
  process.exit(exitCode);
}

backendProcess.on("exit", (code, signal) => {
  if (shuttingDown) {
    return;
  }

  if (signal !== null) {
    shutdown(1);
    return;
  }

  shutdown(code ?? 1);
});

for (const eventName of ["SIGINT", "SIGTERM"]) {
  process.on(eventName, () => {
    shutdown(0);
  });
}

async function waitForBackendReady() {
  const deadline = Date.now() + 30_000;

  while (Date.now() < deadline) {
    if (backendProcess.exitCode !== null) {
      throw new Error("Backend exited before becoming healthy.");
    }

    try {
      const response = await fetch(backendHealthUrl);
      if (response.ok) {
        return;
      }
    } catch {
      // Backend may still be booting; retry until deadline.
    }

    await sleep(250);
  }

  throw new Error(`Backend did not become healthy at ${backendHealthUrl}`);
}

await waitForBackendReady();

frontendProcess = spawn("npm", ["run", "frontend:dev"], {
  cwd: repoRoot,
  env,
  stdio: "inherit",
});

frontendProcess.on("exit", (code, signal) => {
  if (shuttingDown) {
    return;
  }

  if (signal !== null) {
    shutdown(1);
    return;
  }

  shutdown(code ?? 1);
});
