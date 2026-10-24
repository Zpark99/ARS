// 서버(Vercel)는 UTC — 프로세스 TZ와 무관하게 KST 날짜가 나와야 한다 (#205).
// timeZone 없는 옛 formatDate는 TZ=UTC에서 "2026년 10월 4일"을 돌려줘 아래가 깨진다.
import { describe, expect, test } from "vitest";
import { formatDate } from "./date";

process.env.TZ = "UTC";

describe("formatDate (KST 고정)", () => {
  const utc = "2026-10-04T20:00:00Z"; // KST 10/5 05:00
  test("TZ=UTC에서도 한국 날짜", () => expect(formatDate(utc)).toBe("2026년 10월 5일"));
  test("dot 스타일", () => expect(formatDate(utc, "dot")).toBe("2026.10.05"));
  test("KST 자정 경계", () => expect(formatDate("2026-10-04T14:59:59Z")).toBe("2026년 10월 4일"));
});
