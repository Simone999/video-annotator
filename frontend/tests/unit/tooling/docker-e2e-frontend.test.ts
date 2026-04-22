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
  it("keeps Docker runtime env-driven from shared repo env files", () => {
    const dockerfile = readFrontendArtifact("Dockerfile.e2e");
    const dockerEnvFile = readFrontendArtifact("../.env.docker-e2e");

    expect(dockerfile).toContain("ENV FRONTEND_HOST=0.0.0.0");
    expect(dockerfile).toContain("ENV FRONTEND_PORT=3000");
    expect(dockerfile).toContain(
      "ENV VITE_API_BASE_URL=http://backend:8000/api",
    );
    expect(dockerfile).toContain("EXPOSE ${FRONTEND_PORT}");
    expect(dockerfile).toContain(
      'CMD ["sh", "-lc", "npm run dev -- --mode e2e --host ${FRONTEND_HOST} --port ${FRONTEND_PORT}"]',
    );
    expect(dockerEnvFile).toContain("FRONTEND_HOST=0.0.0.0");
    expect(dockerEnvFile).toContain("FRONTEND_PORT=3000");
    expect(dockerEnvFile).toContain(
      "VITE_API_BASE_URL=http://backend:8000/api",
    );
  });
});
