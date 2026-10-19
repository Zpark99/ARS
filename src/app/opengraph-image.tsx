// 사이트 공통 OG 이미지(app/opengraph-image.tsx → /opengraph-image, twitter:image도 자동)(#196).
// 1200×630, "ARS" + 영문 태그라인. 한글은 폰트 파일 로딩이 필요해 넣지 않음.
// 앨범별 OG(커버 사용)는 범위 밖.
import { ImageResponse } from "next/og";
import { BRAND } from "@/lib/brand";

export const alt = "ARS — Album archive & music community";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: BRAND.bg,
          gap: 24,
        }}
      >
        <div style={{ color: BRAND.accent, fontSize: 180, fontWeight: 700, letterSpacing: 8 }}>ARS</div>
        <div style={{ color: BRAND.textMuted, fontSize: 40 }}>Album archive &amp; music community</div>
      </div>
    ),
    size,
  );
}
