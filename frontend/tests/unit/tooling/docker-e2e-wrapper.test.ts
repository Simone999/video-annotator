// @vitest-environment node

import { chmodSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const repoRoot = fileURLToPath(new URL("../../../../", import.meta.url));
const wrapperScriptPath = fileURLToPath(
  new URL("../../../../scripts/docker-e2e.mjs", import.meta.url),
);
const playwrightMarkerPath = fileURLToPath(
  new URL(
    "../../../../node_modules/@playwright/test/package.json",
    import.meta.url,
  ),
);

function makeFakeDockerHarness(): {
  readonly binDirectory: string;
  readonly logPath: string;
  readonly downCountPath: string;
} {
  const binDirectory = mkdtempSync(join(tmpdir(), "docker-e2e-fake-bin-"));
  const logPath = join(binDirectory, "docker.log");
  const downCountPath = join(binDirectory, "docker-down-count.txt");
  const dockerPath = join(binDirectory, "docker");

  writeFileSync(
    dockerPath,
    `#!/bin/sh
set -eu
printf '%s\\n' "$*" >> "$FAKE_DOCKER_LOG_PATH"
args="$*"

case "$args" in
  *"compose --profile runner -f docker-compose.e2e.yml build backend frontend"*)
    exit "\${FAKE_DOCKER_BUILD_STATUS:-0}"
    ;;
  *"compose -f docker-compose.e2e.yml up -d backend frontend"*)
    exit "\${FAKE_DOCKER_UP_STATUS:-0}"
    ;;
  *"compose -f docker-compose.e2e.yml exec -T backend python -c "*)
    exit 0
    ;;
  *"compose -f docker-compose.e2e.yml exec -T frontend node -e "*)
    exit 0
    ;;
  *"scripts.seed_e2e --scenario review-navigation"*)
    printf '%s' '{"scenario":{"frame_indices":[3,8],"object_id":"object-1","video_id":"video-1"}}'
    exit 0
    ;;
  *"compose --profile runner -f docker-compose.e2e.yml run --rm "*)
    exit "\${FAKE_DOCKER_RUN_STATUS:-0}"
    ;;
  *"compose -f docker-compose.e2e.yml down -v --remove-orphans"*)
    down_count=0
    if [ -f "$FAKE_DOCKER_DOWN_COUNT_FILE" ]; then
      down_count=$(cat "$FAKE_DOCKER_DOWN_COUNT_FILE")
    fi
    down_count=$((down_count + 1))
    printf '%s' "$down_count" > "$FAKE_DOCKER_DOWN_COUNT_FILE"
    if [ "\${FAKE_DOCKER_DOWN_FAIL_ON_CALL:-0}" = "$down_count" ]; then
      exit "\${FAKE_DOCKER_DOWN_STATUS:-1}"
    fi
    exit 0
    ;;
esac

exit 0
`,
    "utf8",
  );
  chmodSync(dockerPath, 0o755);

  return {
    binDirectory,
    logPath,
    downCountPath,
  };
}

function runDockerE2eScript(
  args: readonly string[],
  {
    env,
    fakeDocker,
  }: {
    readonly env?: Record<string, string>;
    readonly fakeDocker: {
      readonly binDirectory: string;
      readonly logPath: string;
      readonly downCountPath: string;
    };
  },
) {
  return spawnSync(process.execPath, [wrapperScriptPath, ...args], {
    cwd: repoRoot,
    encoding: "utf8",
    env: {
      ...process.env,
      PATH: `${fakeDocker.binDirectory}:${process.env.PATH ?? ""}`,
      FAKE_DOCKER_LOG_PATH: fakeDocker.logPath,
      FAKE_DOCKER_DOWN_COUNT_FILE: fakeDocker.downCountPath,
      DOCKER_E2E_PLAYWRIGHT_MARKER_PATH: playwrightMarkerPath,
      ...env,
    },
  });
}

describe("docker E2E wrapper", () => {
  it("preserves the primary full-run failure when cleanup also fails", () => {
    const fakeDocker = makeFakeDockerHarness();

    const result = runDockerE2eScript(["full"], {
      fakeDocker,
      env: {
        FAKE_DOCKER_RUN_STATUS: "1",
        FAKE_DOCKER_DOWN_FAIL_ON_CALL: "2",
        FAKE_DOCKER_DOWN_STATUS: "2",
      },
    });

    expect(result.status).toBe(1);
    expect(result.stderr).toContain("cleanup failed after primary error");
    expect(result.stderr).toContain(
      "docker compose --profile runner -f docker-compose.e2e.yml run --rm",
    );
    expect(result.stderr).toContain("exited with 1");

    const log = readFileSync(fakeDocker.logPath, "utf8");
    expect(log).toContain(
      "compose --profile runner -f docker-compose.e2e.yml build backend-init backend frontend",
    );
    expect(log).toContain(
      "npm run test:e2e:strict -- frontend/tests/e2e/routes.spec.ts frontend/tests/e2e/review-navigation.spec.ts",
    );
    expect(log).toContain(
      "compose -f docker-compose.e2e.yml down -v --remove-orphans",
    );
  });

  it("fails fast with npm ci guidance when runner dependencies are missing", () => {
    const fakeDocker = makeFakeDockerHarness();
    const missingMarkerPath = join(
      fakeDocker.binDirectory,
      "missing-playwright-marker.json",
    );

    const result = runDockerE2eScript(["test"], {
      fakeDocker,
      env: {
        DOCKER_E2E_PLAYWRIGHT_MARKER_PATH: missingMarkerPath,
      },
    });

    expect(result.status).toBe(1);
    expect(result.stderr).toContain("npm ci");
    expect(() => readFileSync(fakeDocker.logPath, "utf8")).toThrow();
  });
});
