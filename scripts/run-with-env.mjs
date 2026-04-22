import { spawn } from "node:child_process";

import { interpolateEnvPlaceholders, loadRepoEnv, repoRoot } from "./env.mjs";

const [mode, separator, ...commandArgs] = process.argv.slice(2);

if (typeof mode !== "string" || separator !== "--" || commandArgs.length === 0) {
  throw new Error(
    "Usage: node scripts/run-with-env.mjs <mode> -- <command> [args...]",
  );
}

const env = loadRepoEnv(mode);
const [command, ...args] = commandArgs.map((argument) =>
  interpolateEnvPlaceholders(argument, env),
);

const child = spawn(command, args, {
  cwd: repoRoot,
  env,
  stdio: "inherit",
});

child.on("exit", (code, signal) => {
  if (signal !== null) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 1);
});
