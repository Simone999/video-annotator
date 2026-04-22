import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      "/api": {
        target: "http://127.0.0.1:8000",
      },
    },
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
        lines: 80,
      },
    },
    exclude: [...configDefaults.exclude, "tests/e2e/**"],
    setupFiles: "./tests/setup/vitest.setup.ts",
  },
});
