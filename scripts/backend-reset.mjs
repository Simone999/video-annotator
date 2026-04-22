import { rmSync } from "node:fs";

import { loadRepoEnv, resolveSqliteDatabasePath } from "./env.mjs";

const [mode] = process.argv.slice(2);

if (typeof mode !== "string" || mode.length === 0) {
  throw new Error("Usage: node scripts/backend-reset.mjs <mode>");
}

const env = loadRepoEnv(mode);
const databaseUrl = env.APP_DB_URL;
if (typeof databaseUrl === "string") {
  const databasePath = resolveSqliteDatabasePath(databaseUrl);
  if (databasePath !== null) {
    rmSync(databasePath, { force: true });
  }
}

const masksDir = env.APP_MASKS_DIR;
if (typeof masksDir === "string" && masksDir.length > 0) {
  rmSync(masksDir, { force: true, recursive: true });
}
