import { fileURLToPath } from "node:url";

import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { configDefaults, defineConfig } from "vitest/config";
import { loadEnv } from "vite";

const repoRoot = fileURLToPath(new URL("..", import.meta.url));

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, repoRoot, "");
  const backendHost = env.BACKEND_HOST || "127.0.0.1";
  const backendPort = Number(env.BACKEND_PORT || "8000");
  const frontendHost = env.FRONTEND_HOST || "127.0.0.1";
  const frontendPort = Number(env.FRONTEND_PORT || "5173");
  const apiBaseUrl = env.VITE_API_BASE_URL || "/api";

  return {
    envDir: repoRoot,
    plugins: [react(), tailwindcss()],
    server: {
      host: frontendHost,
      port: frontendPort,
      proxy:
        apiBaseUrl === "/api"
          ? {
              "/api": {
                target: `http://${backendHost}:${String(backendPort)}`,
              },
            }
          : undefined,
    },
    test: {
      coverage: {
        exclude: [
          "tests/**",
          "src/**/*.stories.tsx",
          "src/**/*.d.ts",
          "src/vite-env.d.ts",
        ],
        include: ["src/**/*.{ts,tsx}"],
        provider: "v8",
        reporter: ["text"],
        thresholds: {
          branches: 90,
          lines: 90,
        },
      },
      exclude: [...configDefaults.exclude, "tests/e2e/**"],
      setupFiles: "./tests/setup/vitest.setup.ts",
    },
  };
});
