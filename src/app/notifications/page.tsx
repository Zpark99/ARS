// app/notifications/page.tsx
// 알림 스텁(F4, #127). 헤더 벨 아이콘(/notifications)이 404로 가지 않도록
// 빈 상태만 렌더. 발생·목록·읽음 등 실기능은 스키마 자체가 없어 v1.1로 분리.

import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function NotificationsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="mx-auto flex max-w-[720px] flex-col gap-4 px-4 py-6 md:px-6">
      <h1 className="text-title text-text">알림</h1>
      {user ? (
        <p className="py-16 text-center text-body text-text-muted">아직 알림이 없어요</p>
      ) : (
        <p className="py-16 text-center text-body text-text-muted">
          <Link href="/login" className="text-accent underline-offset-2 hover:underline">
            로그인
          </Link>
          하면 알림을 확인할 수 있어요
        </p>
      )}
    </div>
  );
}
