// 파비콘 — Next 메타데이터 파일 규약(app/icon.tsx → /icon). 어두운 배경 + accent "A" 한 글자(#196).
// 한글은 폰트 로딩이 필요해 넣지 않는다. 기존 Next 기본 favicon.ico는 제거.
import { ImageResponse } from "next/og";
import { BRAND } from "@/lib/brand";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: BRAND.bg,
          color: BRAND.accent,
          borderRadius: 7,
          fontSize: 24,
          fontWeight: 700,
        }}
      >
        A
      </div>
    ),
    size,
  );
}
