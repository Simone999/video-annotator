// @vitest-environment node

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const frontendRoot = fileURLToPath(new URL("../../../", import.meta.url));

function readFrontendArtifact(relativePath: string): string {
  return readFileSync(join(frontendRoot, relativePath), "utf8");
}

describe("frontend Docker E2E artifacts", () => {
  it("keeps Docker runtime and API base URL explicit without changing host e2e env", () => {
    const dockerfile = readFrontendArtifact("Dockerfile.e2e");
    const hostE2eEnvFile = readFrontendArtifact(".env.e2e");

    expect(dockerfile).toContain(
      "ENV VITE_API_BASE_URL=http://backend:8000/api",
    );
    expect(dockerfile).toContain("EXPOSE 3000");
    expect(dockerfile).toContain(
      'CMD ["npm", "run", "dev", "--", "--mode", "e2e", "--host", "0.0.0.0", "--port", "3000"]',
    );
    expect(hostE2eEnvFile.trim()).toBe(
      "VITE_API_BASE_URL=http://127.0.0.1:8000/api",
    );
  });
});
