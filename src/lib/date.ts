// 날짜 표시는 항상 KST (#205).
// Vercel 서버 컴포넌트는 UTC라 timeZone 없이 toLocaleDateString을 쓰면
// KST 00~09시 작성 글이 전날 날짜로 렌더됐다(twelveM 별점 9/5 07:36 KST → "9월 4일").
const KST = "Asia/Seoul";

/** "2026년 10월 5일" (기본) / "2026.10.05" (dot) */
export function formatDate(iso: string, style: "long" | "dot" = "long"): string {
  const d = new Date(iso);
  if (style === "dot") {
    const p = Object.fromEntries(
      new Intl.DateTimeFormat("en-US", { timeZone: KST, year: "numeric", month: "2-digit", day: "2-digit" })
        .formatToParts(d)
        .map((x) => [x.type, x.value])
    );
    return `${p.year}.${p.month}.${p.day}`;
  }
  return d.toLocaleDateString("ko-KR", { timeZone: KST, year: "numeric", month: "short", day: "numeric" });
}
