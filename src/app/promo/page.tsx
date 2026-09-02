// app/promo/page.tsx
// 컴포넌트스펙_5_갤러리홍보 - 화면 4: 홍보게시판 (#70 → #88 실데이터 연결).
// 앨범 허브 홍보 탭(album_id 필터)과 달리 여기는 필터 없는 board_posts promo 전체 목록.
// 상세 라우트가 사이트에 없어 카드 클릭은 앨범 허브 PromoTab과 동일하게 "#" 관례 유지.

import { PromoClient } from "@/components/promo/PromoClient";
import { createClient } from "@/lib/supabase/server";
import type { PromoCardData } from "@/components/cards/PromoCard";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

type PromoPostRow = {
  id: string;
  title: string;
  like_count: number;
  created_at: string;
  artists: { name: string } | null;
};

export default async function PromoPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("board_posts")
    .select("id, title, like_count, created_at, artists(name)")
    .eq("board_type", "promo")
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) {
    console.error("promo posts fetch failed:", error);
  }

  const rows = (data ?? []) as unknown as PromoPostRow[];
  const postIds = rows.map((p) => p.id);

  const commentCounts: Record<string, number> = {};
  if (postIds.length > 0) {
    const { data: promoComments, error: commentsErr } = await supabase
      .from("comments")
      .select("target_id")
      .eq("target_type", "post")
      .in("target_id", postIds);
    if (commentsErr) {
      console.error("promo comments fetch failed:", commentsErr);
    }
    for (const c of promoComments ?? []) {
      commentCounts[c.target_id] = (commentCounts[c.target_id] ?? 0) + 1;
    }
  }

  const promos: PromoCardData[] = rows.map((p) => ({
    id: p.id,
    title: p.title,
    team: p.artists?.name ?? null,
    thumbnailUrl: null,
    likeCount: p.like_count,
    commentCount: commentCounts[p.id] ?? 0,
    time: formatDate(p.created_at),
  }));

  return <PromoClient promos={promos} isLoggedIn={!!user} />;
}
