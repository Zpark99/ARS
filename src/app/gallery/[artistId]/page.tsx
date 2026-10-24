// app/gallery/[artistId]/page.tsx
// 컴포넌트스펙_5_갤러리홍보 - 화면 3: 팀별 갤러리 (#70 → #88 실데이터 연결).
// artistId는 artists.id(실제 UUID). 게시글 상세는 /gallery/[artistId]/[postId] (#118).

import type { Metadata } from "next";
import { galleryMetadata } from "@/lib/seo";
import { notFound } from "next/navigation";
import { TeamGalleryClient } from "@/components/gallery/TeamGalleryClient";
import type { GalleryRowData, GalleryPostFlag } from "@/components/cards/GalleryRow";
import { createClient } from "@/lib/supabase/server";
import { fetchNicknameMap, authorName } from "@/lib/profiles";
import { isValidUUID } from "@/lib/validation/like";
import { formatDate } from "@/lib/date";

type GalleryPostRow = {
  id: string;
  title: string;
  user_id: string;
  created_at: string;
  post_flag: GalleryPostFlag;
  like_count: number;
};

// <title> "{팀명} 갤러리" (#196)
export async function generateMetadata({ params }: { params: Promise<{ artistId: string }> }): Promise<Metadata> {
  return galleryMetadata((await params).artistId);
}

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

  // 공지(post_flag='notice') 지정은 관리자만 (#125). RLS gallery_insert_own이 DB에서도 막음.
  const isAdmin = authResult.data.user
    ? (await supabase.rpc("is_admin")).data === true
    : false;

  const { data: postRows, error } = await supabase
    .from("gallery_posts")
    .select("id, title, user_id, created_at, post_flag, like_count")
    .eq("artist_id", artistId)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) {
    console.error("team gallery posts fetch failed:", error);
  }

  const rows = (postRows ?? []) as GalleryPostRow[];
  const names = await fetchNicknameMap(supabase, rows.map((p) => p.user_id));
  const posts: GalleryRowData[] = rows.map((p) => ({
    id: p.id,
    title: p.title,
    author: authorName(names, p.user_id),
    likeCount: p.like_count,
    time: formatDate(p.created_at),
    flag: p.post_flag,
  }));

  return (
    <TeamGalleryClient
      teamName={artistResult.data.name}
      artistId={artistId}
      posts={posts}
      isLoggedIn={!!authResult.data.user}
      currentUserId={authResult.data.user?.id ?? null}
      isAdmin={isAdmin}
    />
  );
}
