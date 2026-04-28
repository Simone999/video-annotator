import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join } from "node:path";
import process from "node:process";
import { setTimeout as sleep } from "node:timers/promises";

import { repoRoot } from "./env.mjs";

const COMPOSE_FILE = "docker-compose.e2e.yml";
const DEFAULT_SMOKE_SPECS = [
  "frontend/tests/e2e/routes.spec.ts",
  "frontend/tests/e2e/review-navigation.spec.ts",
];
const STACK_READY_TIMEOUT_MS = 120_000;
const PLAYWRIGHT_DEP_MARKER_PATH =
  process.env.DOCKER_E2E_PLAYWRIGHT_MARKER_PATH ??
  join(repoRoot, "node_modules", "@playwright", "test", "package.json");

function run(command, args, { env, quiet = false } = {}) {
  const result = spawnSync(command, args, {
    cwd: repoRoot,
    env: {
      ...process.env,
      ...env,
    },
    encoding: "utf8",
    stdio: quiet ? ["ignore", "ignore", "ignore"] : "inherit",
  });

  if (result.error) {
    throw result.error;
  }

  if (typeof result.status === "number" && result.status !== 0) {
    throw new Error(`${command} ${args.join(" ")} exited with ${result.status}`);
  }
}

function capture(command, args, { env } = {}) {
  const result = spawnSync(command, args, {
    cwd: repoRoot,
    env: {
      ...process.env,
      ...env,
    },
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });

  if (typeof result.stderr === "string" && result.stderr.length > 0) {
    process.stderr.write(result.stderr);
  }

  if (result.error) {
    throw result.error;
  }

  if (typeof result.status === "number" && result.status !== 0) {
    if (typeof result.stdout === "string" && result.stdout.length > 0) {
      process.stdout.write(result.stdout);
    }
    throw new Error(`${command} ${args.join(" ")} exited with ${result.status}`);
  }

  return result.stdout.trim();
}

function ensureRunnerDependencies() {
  if (existsSync(PLAYWRIGHT_DEP_MARKER_PATH)) {
    return;
  }

  throw new Error(
    "Docker E2E runner requires repo Node dependencies on the host bind mount. "
      + "Run `npm ci` before `npm run test:e2e:docker`. "
      + `Missing ${PLAYWRIGHT_DEP_MARKER_PATH}`,
  );
}

function asError(error) {
  return error instanceof Error ? error : new Error(String(error));
}

function dockerComposeArgs(...args) {
  return ["compose", "-f", COMPOSE_FILE, ...args];
}

function dockerComposeRunnerArgs(...args) {
  return ["compose", "--profile", "runner", "-f", COMPOSE_FILE, ...args];
}

async function waitForStackReady() {
  const deadline = Date.now() + STACK_READY_TIMEOUT_MS;

  while (Date.now() < deadline) {
    const backendReady = spawnSync(
      "docker",
      dockerComposeArgs(
        "exec",
        "-T",
        "backend",
        "python",
        "-c",
        'from urllib.request import urlopen; import os, sys; port = os.environ["BACKEND_PORT"]; sys.exit(0 if urlopen(f"http://127.0.0.1:{port}/openapi.json").status == 200 else 1)',
      ),
      {
        cwd: repoRoot,
        stdio: ["ignore", "ignore", "ignore"],
      },
    ).status;
    const frontendReady = spawnSync(
      "docker",
      dockerComposeArgs(
        "exec",
        "-T",
        "frontend",
        "node",
        "-e",
        'const port = process.env.FRONTEND_PORT; fetch(`http://127.0.0.1:${port}`).then((response) => { process.exit(response.ok ? 0 : 1); }).catch(() => process.exit(1));',
      ),
      {
        cwd: repoRoot,
        stdio: ["ignore", "ignore", "ignore"],
      },
    ).status;

    if (backendReady === 0 && frontendReady === 0) {
      return;
    }

    await sleep(1_000);
  }

  throw new Error("Docker E2E stack did not become healthy in time");
}

function seedReviewNavigationScenario() {
  const rawPayload = capture(
    "docker",
    dockerComposeArgs(
      "exec",
      "-T",
      "backend",
      "sh",
      "-lc",
      "uv run --no-sync --no-dev python -m scripts.seed_e2e --scenario review-navigation",
    ),
  );
  const payload = JSON.parse(rawPayload);

  if (typeof payload !== "object" || payload === null || payload.scenario === undefined) {
    throw new Error("Docker review-navigation seed did not return scenario payload");
  }

  return JSON.stringify(payload.scenario);
}

async function runDockerE2eTests(specArgs) {
  ensureRunnerDependencies();

  const specs = specArgs.length > 0 ? specArgs : DEFAULT_SMOKE_SPECS;

  run("docker", dockerComposeArgs("up", "-d", "backend", "frontend"));
  await waitForStackReady();
  const scenarioJson = seedReviewNavigationScenario();
  run(
    "docker",
    dockerComposeRunnerArgs(
      "run",
      "--rm",
      "-e",
      `E2E_REVIEW_NAVIGATION_SCENARIO_JSON=${scenarioJson}`,
      "playwright",
      "npm",
      "run",
      "test:e2e:strict",
      "--",
      ...specs,
    ),
    {
      env: {
        PLAYWRIGHT_RUN_MODE: "docker",
      },
    },
  );
}

async function main() {
  const [command = "full", ...specArgs] = process.argv.slice(2);

  if (command === "test") {
    await runDockerE2eTests(specArgs);
    return;
  }

  if (command === "full") {
    let primaryError = null;

    try {
      run("docker", dockerComposeArgs("down", "-v", "--remove-orphans"));
      run("docker", dockerComposeRunnerArgs("build", "backend-init", "backend", "frontend"));
      await runDockerE2eTests(specArgs);
    } catch (error) {
      primaryError = asError(error);
    } finally {
      try {
        run("docker", dockerComposeArgs("down", "-v", "--remove-orphans"));
      } catch (cleanupError) {
        if (primaryError === null) {
          throw cleanupError;
        }

        console.error(
          `Docker E2E cleanup failed after primary error: ${asError(cleanupError).message}`,
        );
      }
    }

    if (primaryError !== null) {
      throw primaryError;
    }
    return;
  }

  throw new Error("Usage: node scripts/docker-e2e.mjs <test|full> [spec ...]");
}

await main();
