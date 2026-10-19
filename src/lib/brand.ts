// ⚠️ globals.css 토큰(--bg / --accent / --text-muted)과 함께 수정할 것 — brand.test.ts가 불일치를 잡는다.
// 아이콘·OG 이미지(ImageResponse)는 CSS 변수를 못 읽어 토큰 값을 여기서 복제한다(#196).
export const BRAND = {
  bg: "#050505",
  accent: "#a3e635",
  textMuted: "#9a9aa0",
} as const;
