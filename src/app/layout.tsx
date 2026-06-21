// app/layout.tsx
// GlobalNav를 모든 화면 상단에 전역 적용. 서버 세션에서 로그인 사용자 정보를 가져와 전달.

import type { Metadata } from "next";
import { GlobalNav } from "@/components/layout/GlobalNav";
import { createClient } from "@/lib/supabase/server";
import "./globals.css";

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
    <html lang="ko">
      <body className="min-h-dvh bg-bg text-text">
        <GlobalNav user={user} />
        {children}
      </body>
    </html>
  );
}
