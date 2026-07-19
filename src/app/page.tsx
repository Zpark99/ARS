// app/page.tsx
// 화면정의서 01_홈. 월간 아티스트 배너 + 최신 리뷰 피드(2단계 인터랙션).
// 월간 아티스트 배너는 관련 DB 뷰 부재로 임시 고정값 유지(#49 범위 밖). 최신 리뷰 피드는 Supabase 실데이터.

import { HomeFeed } from "@/components/home/HomeFeed";
import type { FeedPreview } from "@/components/home/FeedPreviewOverlay";
import { createClient } from "@/lib/supabase/server";

type AlbumBase = {
  id: string;
  mbid: string;
  title: string;
  artist_name: string;
};

async function getLatestFeed(): Promise<FeedPreview[]> {
  const supabase = await createClient();

  const { data: comments } = await supabase
    .from("comments")
    .select("user_id, target_id, content")
    .eq("target_type", "album")
    .order("created_at", { ascending: false })
    .limit(5);

  if (!comments || comments.length === 0) return [];

  const albumIds = [...new Set(comments.map((c) => c.target_id))];
  const userIds = [...new Set(comments.map((c) => c.user_id))];

  const [albumsResult, ratingsResult] = await Promise.all([
    supabase.from("albums").select("id, mbid, title, artist_name").in("id", albumIds),
    supabase.from("ratings").select("user_id, album_id, score").in("album_id", albumIds).in("user_id", userIds),
  ]);

  const albumMap = new Map((albumsResult.data as AlbumBase[] | null ?? []).map((a) => [a.id, a]));
  const scoreMap = new Map(
    (ratingsResult.data ?? []).map((r) => [`${r.user_id}:${r.album_id}`, r.score as number])
  );

  return comments
    .map((c) => {
      const album = albumMap.get(c.target_id);
      if (!album) return null;
      return {
        albumId: album.mbid,
        title: album.title,
        artist: album.artist_name,
        rating: scoreMap.get(`${c.user_id}:${c.target_id}`) ?? 0,
        oneLiner: c.content,
      };
    })
    .filter((item): item is FeedPreview => item !== null);
}

export default async function HomePage() {
  const feed = await getLatestFeed();

  return (
    <main className="mx-auto max-w-screen-sm px-4 py-6">
      {/* 월간 아티스트 배너 (P1은 단순 배너) */}
      <section className="mb-6 rounded-lg border border-border bg-surface p-4">
        <p className="text-[13px] text-text-muted">이달의 아티스트</p>
        <p className="mt-1 text-[18px] font-semibold text-text">검정치마</p>
      </section>

      {/* 최신 리뷰 피드 */}
      <h1 className="mb-3 text-[15px] font-semibold text-text">최신 평가</h1>
      {feed.length === 0 ? (
        <p className="py-12 text-center text-[14px] text-text-muted">
          아직 등록된 평가가 없어요.
        </p>
      ) : (
        <HomeFeed items={feed} />
      )}
    </main>
  );
}
