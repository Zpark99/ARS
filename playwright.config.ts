import { defineConfig } from "@playwright/test";

// E2E는 로컬 next build+start 대상(프로덕션 URL 아님). DB는 dev=prod 단일이라
// 쓰기 테스트는 test@test.com 전용 + [E2E] 접두어 + teardown에서 잔존 0건 확인(#65).
const PORT = 3100;

export default defineConfig({
  testDir: "./e2e",
  // 쓰기 테스트가 만든 [E2E] 글을 다른 테스트가 집어 들지 않도록 직렬 실행
  workers: 1,
  fullyParallel: false,
  retries: 0,
  reporter: "list",
  globalSetup: "./e2e/global-setup.ts",
  globalTeardown: "./e2e/global-teardown.ts",
  use: {
    baseURL: `http://localhost:${PORT}`,
    // 시스템 Chrome 사용 — Playwright 번들 브라우저 다운로드 불필요
    channel: "chrome",
    trace: "retain-on-failure",
  },
  webServer: {
    command: `npm run build && npm run start -- -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: true,
    timeout: 240_000,
  },
});
