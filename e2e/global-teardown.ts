import { sweepE2ERows } from "./helpers";

// 잔존 [E2E] 행 0건 확인까지가 테스트의 일부. 남으면 실행 자체를 실패로 만든다.
export default async function globalTeardown() {
  const left = await sweepE2ERows();
  if (left > 0) throw new Error(`[e2e] 정리 후에도 [E2E] 행 ${left}건 잔존`);
}
