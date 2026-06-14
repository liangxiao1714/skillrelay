import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: false,
    include: ["tests/**/*.test.ts"],
    exclude: ["node_modules", "dist"],
    coverage: {
      provider: "v8",
      include: ["src/**/*.ts"],
      exclude: ["src/cli/index.ts"],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
      reportsDirectory: "coverage",
    },
    env: {
      TZ: "UTC",
    },
  },
});
