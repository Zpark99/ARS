// app/promo/page.tsx
// 컴포넌트스펙_5_갤러리홍보 - 화면 4: 홍보게시판 (#70 → #88 실데이터 연결).
// 앨범 허브 홍보 탭(album_id 필터)과 달리 여기는 필터 없는 board_posts promo 전체 목록.
// 게시글 상세는 /promo/[postId] (#120).

import type { Metadata } from "next";
import { PromoClient } from "@/components/promo/PromoClient";
import { createClient } from "@/lib/supabase/server";
import type { PromoCardData } from "@/components/cards/PromoCard";
import { formatDate } from "@/lib/date";

type PromoPostRow = {
  id: string;
  title: string;
  like_count: number;
  created_at: string;
  artists: { name: string } | null;
  artist_name_text: string | null;
};

export const metadata: Metadata = { title: "홍보게시판" };

export default async function PromoPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data, error }, artistsResult] = await Promise.all([
    supabase
      .from("board_posts")
      .select("id, title, like_count, created_at, artists(name), artist_name_text")
      .eq("board_type", "promo")
      .order("created_at", { ascending: false })
      .limit(50),
    supabase.from("artists").select("id, name").order("name"),
  ]);
  if (error) {
    console.error("promo posts fetch failed:", error);
  }
  if (artistsResult.error) {
    console.error("promo artists fetch failed:", artistsResult.error);
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
    team: p.artists?.name ?? p.artist_name_text ?? null,
    thumbnailUrl: null,
    likeCount: p.like_count,
    commentCount: commentCounts[p.id] ?? 0,
    time: formatDate(p.created_at),
  }));

  return (
    <PromoClient
      promos={promos}
      isLoggedIn={!!user}
      currentUserId={user?.id ?? null}
      artists={artistsResult.data ?? []}
    />
  );
}
