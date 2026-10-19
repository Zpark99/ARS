// 아이콘·OG 이미지(ImageResponse)는 CSS 변수를 못 읽어 globals.css 토큰 값을 여기서 복제한다(#196).
// globals.css --bg / --accent / --text-muted 를 바꾸면 여기도 같이.
export const BRAND = {
  bg: "#050505",
  accent: "#a3e635",
  textMuted: "#9a9aa0",
} as const;
