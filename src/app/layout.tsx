// app/layout.tsx
// GlobalHeader를 모든 화면 상단에 전역 적용. 서버 세션에서 로그인 사용자 정보를 가져와 전달.

import type { Metadata } from "next";
import localFont from "next/font/local";
import { GlobalHeader } from "@/components/layout/GlobalHeader";
import { GlobalFooter } from "@/components/layout/GlobalFooter";
import { TabBar } from "@/components/layout/TabBar";
import { createClient } from "@/lib/supabase/server";
import "./globals.css";

const pretendard = localFont({
  src: "../../node_modules/pretendard/dist/web/variable/woff2/PretendardVariable.woff2",
  variable: "--font-pretendard",
  weight: "45 920",
  display: "swap",
});

// 사이트 공통 메타(#196). description은 README 소개 문구와 동일. 페이지별 title은 각 page의
// metadata/generateMetadata가 template("%s | ARS")에 끼워 넣는다. og:image/twitter:image는
// app/opengraph-image.tsx 파일 규약으로 자동 추가, metadataBase로 절대 URL이 된다.
const SITE_DESCRIPTION = "리스너는 즐길 수 있고, 아티스트는 홍보를 할 수 있는 음악 커뮤니티";

export const metadata: Metadata = {
  metadataBase: new URL("https://ars-eta-one.vercel.app"),
  title: { default: "ARS", template: "%s | ARS" },
  description: SITE_DESCRIPTION,
  // og/twitter title은 비워 두면 Next가 각 페이지의 resolved title("{앨범명} - {아티스트} | ARS")을
  // 상속시킨다 — 고정 "ARS"로 두면 모든 공유 링크가 같은 제목으로 보임
  openGraph: { type: "website", locale: "ko_KR", siteName: "ARS" },
  twitter: { card: "summary_large_image" },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  const user = authUser
    ? {
        id: authUser.id,
        name:
          authUser.user_metadata?.full_name ??
          authUser.user_metadata?.name ??
          authUser.email?.split("@")[0] ??
          "사용자",
        avatarUrl: authUser.user_metadata?.avatar_url ?? null,
      }
    : null;

  return (
    <html lang="ko" className={pretendard.variable}>
      <body className="flex min-h-dvh flex-col bg-bg pb-14 text-text md:pb-0">
        <GlobalHeader user={user} />
        <main className="flex-1">{children}</main>
        <GlobalFooter />
        <TabBar user={user} />
      </body>
    </html>
  );
}
