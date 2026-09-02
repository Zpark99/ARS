// app/gallery/[artistId]/page.tsx
// 컴포넌트스펙_5_갤러리홍보 - 화면 3: 팀별 갤러리 (#70 → #88 실데이터 연결).
// artistId는 artists.id(실제 UUID). 게시글 상세 라우트가 없어 클릭은 "#" 관례 유지
// (앨범 허브 GalleryTab과 동일, #100/#103에서 이미 그렇게 배포됨).

import { notFound } from "next/navigation";
import { TeamGalleryClient } from "@/components/gallery/TeamGalleryClient";
import type { GalleryRowData, GalleryPostFlag } from "@/components/cards/GalleryRow";
import { createClient } from "@/lib/supabase/server";
import { isValidUUID } from "@/lib/validation/like";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

type GalleryPostRow = {
  id: string;
  title: string;
  user_id: string;
  created_at: string;
  post_flag: GalleryPostFlag;
};

export default async function TeamGalleryPage({
  params,
}: {
  params: Promise<{ artistId: string }>;
}) {
  const { artistId } = await params;

  // 더미/가짜 라우팅 식별자가 라이브까지 새는 걸 막는 가드 (#109, mbid-1류 재발 3회 방지)
  if (!isValidUUID(artistId)) {
    console.error(`invalid artistId format: ${artistId} (path: /gallery/${artistId})`);
    notFound();
  }

  const supabase = await createClient();

  const [artistResult, authResult] = await Promise.all([
    supabase.from("artists").select("id, name").eq("id", artistId).maybeSingle(),
    supabase.auth.getUser(),
  ]);

  if (!artistResult.data) notFound();

  const { data: postRows, error } = await supabase
    .from("gallery_posts")
    .select("id, title, user_id, created_at, post_flag")
    .eq("artist_id", artistId)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) {
    console.error("team gallery posts fetch failed:", error);
  }

  // 반응 탭(ReactionTab)과 동일한 패턴: 닉네임 조인 없이 user_id 앞 8자리만 표시
  const posts: GalleryRowData[] = ((postRows ?? []) as GalleryPostRow[]).map((p) => ({
    id: p.id,
    title: p.title,
    author: `사용자 ${p.user_id.slice(0, 8)}`,
    likeCount: 0, // gallery_posts는 아직 좋아요 스키마 없음 (#104 백로그)
    time: formatDate(p.created_at),
    flag: p.post_flag,
  }));

  return (
    <TeamGalleryClient
      teamName={artistResult.data.name}
      posts={posts}
      isLoggedIn={!!authResult.data.user}
    />
  );
}
