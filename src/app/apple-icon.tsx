// iOS 홈 화면 아이콘(app/apple-icon.tsx → /apple-icon). icon.tsx와 같은 디자인 180px(#196).
// iOS가 모서리를 알아서 깎으므로 borderRadius 없음.
import { ImageResponse } from "next/og";
import { BRAND } from "@/lib/brand";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
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
          fontSize: 132,
          fontWeight: 700,
        }}
      >
        A
      </div>
    ),
    size,
  );
}
