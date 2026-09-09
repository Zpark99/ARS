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

export const metadata: Metadata = {
  title: "ARS",
  description: "앨범 평가 서비스",
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
