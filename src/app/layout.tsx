// app/layout.tsx
// GlobalNav를 모든 화면 상단에 전역 적용. user는 실제로는 서버 세션에서 가져와 전달.

import type { Metadata } from "next";
import { GlobalNav } from "@/components/layout/GlobalNav";
import "./globals.css";

export const metadata: Metadata = {
  title: "ARS",
  description: "앨범 평가 서비스",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // TODO: Supabase 세션에서 user 가져와 GlobalNav에 전달 (P1: null로 시작)
  const user = null;

  return (
    <html lang="ko">
      <body className="min-h-dvh bg-bg text-text">
        <GlobalNav user={user} />
        {children}
      </body>
    </html>
  );
}
