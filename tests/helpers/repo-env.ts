import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const repoRoot = resolve(__dirname, "..", "..");

function parseEnvValue(value: string): string {
  const trimmedValue = value.trim();
  if (
    (trimmedValue.startsWith('"') && trimmedValue.endsWith('"')) ||
    (trimmedValue.startsWith("'") && trimmedValue.endsWith("'"))
  ) {
    return trimmedValue.slice(1, -1);
  }

  return trimmedValue;
}

function parseEnvFile(filePath: string): Record<string, string> {
  if (existsSync(filePath) === false) {
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

export function loadRepoEnv(mode: string): Record<string, string | undefined> {
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

export function buildHttpUrl(host: string, port: string, path = ""): string {
  const normalizedPath =
    path.length === 0 ? "" : path.startsWith("/") ? path : `/${path}`;
  return `http://${host}:${port}${normalizedPath}`;
}
