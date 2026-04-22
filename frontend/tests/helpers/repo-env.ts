import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

type RepoEnv = Record<string, string | undefined>;

const repoRoot = fileURLToPath(new URL("../../../", import.meta.url));

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

function readEnvFile(relativePath: string): RepoEnv {
  const contents = readFileSync(join(repoRoot, relativePath), "utf8");

  return Object.fromEntries(
    contents
      .split(/\r?\n/u)
      .map((line) => line.trim())
      .filter((line) => line.length > 0 && !line.startsWith("#"))
      .map((line) => {
        const separatorIndex = line.indexOf("=");
        return [
          line.slice(0, separatorIndex).trim(),
          parseEnvValue(line.slice(separatorIndex + 1)),
        ];
      }),
  );
}

export function loadRepoEnv(mode: string): RepoEnv {
  return {
    ...readEnvFile(".env"),
    ...readEnvFile(`.env.${mode}`),
    ...process.env,
  };
}
