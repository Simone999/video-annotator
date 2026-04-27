// @vitest-environment node

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { afterEach, describe, expect, it, vi } from "vitest";

const frontendRoot = fileURLToPath(new URL("../../../", import.meta.url));
const runnerModuleUrl = new URL(
  "../../../scripts/run-vitest-coverage.mjs",
  import.meta.url,
);
const originalEnv = { ...process.env };

type MockChildProcess = {
  on(
    event: "error" | "exit",
    handler: (value?: Error | number | null) => void,
  ): MockChildProcess;
};

type MockDirent = {
  name: string;
  isDirectory(): boolean;
  isFile(): boolean;
};

type SpawnOptions = {
  env: NodeJS.ProcessEnv;
};

function readFrontendFile(relativePath: string): string {
  return readFileSync(join(frontendRoot, relativePath), "utf8");
}

function createSuccessfulChild(): MockChildProcess {
  const handlers = new Map<
    "error" | "exit",
    (value?: Error | number | null) => void
  >();

  queueMicrotask(() => {
    handlers.get("exit")?.(0);
  });

  return {
    on(event, handler) {
      handlers.set(event, handler);
      return this;
    },
  };
}

function createDirent(name: string, kind: "file" | "directory"): MockDirent {
  return {
    name,
    isDirectory() {
      return kind === "directory";
    },
    isFile() {
      return kind === "file";
    },
  };
}

function restoreProcessEnv(): void {
  for (const key of Object.keys(process.env)) {
    if (!(key in originalEnv)) {
      Reflect.deleteProperty(process.env, key);
    }
  }

  Object.assign(process.env, originalEnv);
}

async function importRunnerModule(): Promise<void> {
  await import(`${runnerModuleUrl.href}?t=${String(Date.now())}`);
}

function getSpawnCall(
  calls: ReadonlyArray<[string, string[], SpawnOptions]>,
  index: number,
): [string, string[], SpawnOptions] {
  const call = calls[index];
  expect(call).toBeDefined();
  return call;
}

function createSpawnMock() {
  return vi.fn<(...args: [string, string[], SpawnOptions]) => MockChildProcess>(
    () => createSuccessfulChild(),
  );
}

afterEach(() => {
  restoreProcessEnv();
  vi.resetModules();
  vi.restoreAllMocks();
});

describe("frontend test runner contract", () => {
  it("exposes direct unit, integration, and sharded coverage commands", () => {
    const packageJson = JSON.parse(readFrontendFile("package.json")) as {
      scripts?: Record<string, string>;
    };
    const scripts = packageJson.scripts ?? {};

    expect(scripts.test).toBe(
      "node scripts/run-vitest-coverage.mjs && node scripts/check-vitest-coverage-gate.mjs coverage/coverage-summary.json 90",
    );
    expect(scripts["test:unit"]).toBe("vitest run tests/unit");
    expect(scripts["test:integration"]).toBe("vitest run tests/integration");
    expect(scripts["test:sharded"]).toBe(
      "VITEST_COVERAGE_SHARDED=1 node scripts/run-vitest-coverage.mjs && node scripts/check-vitest-coverage-gate.mjs coverage/coverage-summary.json 90",
    );
  });

  it("preserves existing NODE_OPTIONS during default coverage runs", async () => {
    const spawnMock = createSpawnMock();
    const rmMock = vi.fn().mockResolvedValue(undefined);
    const readdirMock = vi.fn().mockResolvedValue([]);

    vi.doMock("node:child_process", () => ({ spawn: spawnMock }));
    vi.doMock("node:fs/promises", () => ({ readdir: readdirMock, rm: rmMock }));

    process.env.NODE_OPTIONS = "--trace-warnings";
    delete process.env.VITEST_COVERAGE_SHARDED;

    await importRunnerModule();

    await vi.waitFor(() => {
      expect(spawnMock).toHaveBeenCalledTimes(1);
    });

    const [command, args, options] = getSpawnCall(spawnMock.mock.calls, 0);

    expect(command).toBe(process.execPath);
    expect(args).toContain("run");
    expect(args).toContain("--coverage");
    expect(args).toContain("--coverage.reporter=text");
    expect(args).toContain("--coverage.reporter=json-summary");
    expect(options.env.NODE_OPTIONS).toContain("--trace-warnings");
    expect(options.env.NODE_OPTIONS).toContain("--max-old-space-size=4096");
  });

  it("runs sharded coverage per test file, skips e2e, and merges reports once", async () => {
    const spawnMock = createSpawnMock();
    const rmMock = vi.fn().mockResolvedValue(undefined);
    const readdirMock = vi.fn((directory: string) => {
      if (directory.endsWith("/tests")) {
        return [
          createDirent("unit", "directory"),
          createDirent("integration", "directory"),
          createDirent("e2e", "directory"),
        ];
      }
      if (directory.endsWith("/tests/unit")) {
        return [
          createDirent("alpha.test.ts", "file"),
          createDirent("ignore.txt", "file"),
        ];
      }
      if (directory.endsWith("/tests/integration")) {
        return [createDirent("beta.test.tsx", "file")];
      }
      return [];
    });

    vi.doMock("node:child_process", () => ({ spawn: spawnMock }));
    vi.doMock("node:fs/promises", () => ({ readdir: readdirMock, rm: rmMock }));

    process.env.VITEST_COVERAGE_SHARDED = "1";

    await importRunnerModule();

    await vi.waitFor(() => {
      expect(spawnMock).toHaveBeenCalledTimes(3);
    });

    const vitestArgsList = spawnMock.mock.calls.map(([, args]) =>
      args.slice(1),
    );

    expect(vitestArgsList[0]).toEqual(
      expect.arrayContaining([
        "run",
        "tests/integration/beta.test.tsx",
        "--coverage",
        "--coverage.thresholds.lines=0",
        "--coverage.thresholds.branches=0",
        "--coverage.reporter=json-summary",
        "--reporter=blob",
        "--maxWorkers=1",
      ]),
    );
    expect(vitestArgsList[1]).toEqual(
      expect.arrayContaining([
        "run",
        "tests/unit/alpha.test.ts",
        "--coverage",
        "--coverage.thresholds.lines=0",
        "--coverage.thresholds.branches=0",
        "--coverage.reporter=json-summary",
        "--reporter=blob",
        "--maxWorkers=1",
      ]),
    );
    expect(vitestArgsList[2]).toEqual([
      "--mergeReports",
      expect.stringContaining(".vitest-reports"),
      "--coverage",
      "--coverage.reporter=text",
      "--coverage.reporter=json-summary",
    ]);
  });
});
