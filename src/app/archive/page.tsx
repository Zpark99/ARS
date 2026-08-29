// app/archive/page.tsx
// 컴포넌트스펙_4_아카이브. 앨범 카탈로그(허브 입구) (#69).
// 실데이터: albums 테이블 (ranking 페이지와 동일 소스). rating은 AlbumGrid가
// showRating=false로 숨기므로 조인 없이 0 고정. genre/year는 스키마에 없어
// 미분류/등록연도로 대체 — 두 필터는 사실상 동작 안 함(#88 스코프, 이번엔 동선만).

import { ArchiveClient, type ArchiveAlbum } from "@/components/archive/ArchiveClient";
import { createClient } from "@/lib/supabase/server";

export default async function ArchivePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data } = await supabase
    .from("albums")
    .select("id, mbid, title, artist_name, cover_url, like_count, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  const albums: ArchiveAlbum[] = (data ?? []).map((a) => ({
    id: a.id,
    mbid: a.mbid,
    title: a.title,
    artist: a.artist_name,
    rating: 0,
    coverUrl: a.cover_url,
    genre: "미분류",
    year: new Date(a.created_at).getFullYear(),
    likeCount: a.like_count ?? 0,
  }));

  return <ArchiveClient albums={albums} isLoggedIn={!!user} />;
}
