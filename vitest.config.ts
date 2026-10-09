import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    environment: "node",
    // e2e/*.spec.ts는 Playwright 전용 — vitest가 집어 가지 않게 제외
    exclude: [...configDefaults.exclude, "e2e/**"],
  },
});
