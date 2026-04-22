import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptsDir = dirname(fileURLToPath(import.meta.url));

export const repoRoot = resolve(scriptsDir, "..");

function parseEnvValue(value) {
  const trimmedValue = value.trim();
  if (
    (trimmedValue.startsWith('"') && trimmedValue.endsWith('"')) ||
    (trimmedValue.startsWith("'") && trimmedValue.endsWith("'"))
  ) {
    return trimmedValue.slice(1, -1);
  }

  return trimmedValue;
}

function parseEnvFile(filePath) {
  if (!existsSync(filePath)) {
    return {};
  }

  return Object.fromEntries(
    readFileSync(filePath, "utf8")
      .split(/\r?\n/u)
      .map((line) => line.trim())
      .filter((line) => line.length > 0 && line.startsWith("#") === false)
      .map((line) => {
        const separatorIndex = line.indexOf("=");
        if (separatorIndex === -1) {
          throw new Error(`Invalid env line in ${filePath}: ${line}`);
        }

        return [
          line.slice(0, separatorIndex).trim(),
          parseEnvValue(line.slice(separatorIndex + 1)),
        ];
      }),
  );
}

export function loadRepoEnv(mode) {
  const baseEnv = parseEnvFile(resolve(repoRoot, ".env"));
  const modeEnv =
    mode === "development"
      ? {}
      : parseEnvFile(resolve(repoRoot, `.env.${mode}`));

  return {
    ...baseEnv,
    ...modeEnv,
    ...process.env,
  };
}

export function interpolateEnvPlaceholders(value, env) {
  return value.replace(/\{([A-Z0-9_]+)\}/gu, (_match, variableName) => {
    const replacement = env[variableName];
    if (typeof replacement !== "string" || replacement.length === 0) {
      throw new Error(`Missing env value for ${variableName}`);
    }

    return replacement;
  });
}

export function buildHttpUrl(host, port, path = "") {
  const normalizedPath =
    path.length === 0 ? "" : path.startsWith("/") ? path : `/${path}`;
  return `http://${host}:${port}${normalizedPath}`;
}

export function resolveSqliteDatabasePath(databaseUrl) {
  const sqlitePrefix = "sqlite:///";
  if (databaseUrl.startsWith(sqlitePrefix) === false) {
    return null;
  }

  const databasePath = databaseUrl.slice(sqlitePrefix.length);
  if (databasePath.length === 0 || databasePath === ":memory:") {
    return null;
  }

  if (databasePath.startsWith("/")) {
    return databasePath;
  }

  return resolve(repoRoot, databasePath);
}
