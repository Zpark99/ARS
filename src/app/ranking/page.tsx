// app/ranking/page.tsx
// 평점순(기본) + 좋아요순 탭 지원. 나머지 탭(코멘트수/월간)은 비활성.

import { createClient } from "@/lib/supabase/server";
import { RankingTabs } from "@/components/ranking/RankingTabs";
import { RankingRow } from "@/components/ranking/RankingRow";
import type { PopularAlbum } from "@/types/album";

type AlbumWithRatings = {
  id: string;
  mbid: string;
  title: string;
  artist_name: string;
  cover_url: string | null;
  ratings: { score: number }[];
};

type AlbumBase = {
  id: string;
  mbid: string;
  title: string;
  artist_name: string;
  cover_url: string | null;
};

export default async function RankingPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string }>;
}) {
  const { sort = "rating" } = await searchParams;
  const supabase = await createClient();

  let ranking: PopularAlbum[];

  if (sort === "likes") {
    const [albumsResult, likesResult] = await Promise.all([
      supabase.from("albums").select("id, mbid, title, artist_name, cover_url"),
      supabase.from("likes").select("target_id").eq("target_type", "album"),
    ]);

    const likeCountMap: Record<string, number> = {};
    for (const like of likesResult.data ?? []) {
      likeCountMap[like.target_id] = (likeCountMap[like.target_id] ?? 0) + 1;
    }

    ranking = ((albumsResult.data ?? []) as AlbumBase[])
      .map((album) => ({
        id: album.id,
        mbid: album.mbid,
        title: album.title,
        artist_name: album.artist_name,
        cover_url: album.cover_url,
        rating_count: 0,
        avg_score: 0,
        like_count: likeCountMap[album.id] ?? 0,
      }))
      .filter((a) => a.like_count > 0)
      .sort((a, b) => b.like_count - a.like_count);
  } else {
    const { data } = await supabase
      .from("albums")
      .select("id, mbid, title, artist_name, cover_url, ratings(score)");

    ranking = ((data ?? []) as unknown as AlbumWithRatings[])
      .map((album) => {
        const ratingCount = album.ratings.length;
        const avgScore =
          ratingCount > 0
            ? album.ratings.reduce((sum, r) => sum + r.score, 0) / ratingCount
            : 0;
        return {
          id: album.id,
          mbid: album.mbid,
          title: album.title,
          artist_name: album.artist_name,
          cover_url: album.cover_url,
          rating_count: ratingCount,
          avg_score: avgScore,
        };
      })
      .filter((album) => album.rating_count > 0)
      .sort((a, b) => b.avg_score - a.avg_score || b.rating_count - a.rating_count);
  }

  return (
    <main className="mx-auto max-w-screen-sm px-4 py-6">
      <h1 className="mb-4 text-[22px] font-bold text-text">랭킹</h1>

      <RankingTabs activeSort={sort} />

      {ranking.length === 0 ? (
        <p className="py-12 text-center text-[14px] text-text-muted">
          아직 랭킹 데이터가 없어요
        </p>
      ) : (
        <ol className="flex flex-col gap-2">
          {ranking.map((album, index) => (
            <li key={album.id}>
              <RankingRow album={album} rank={index + 1} />
            </li>
          ))}
        </ol>
      )}
    </main>
  );
}
