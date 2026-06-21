// app/ranking/page.tsx
// 화면정의서 랭킹. 평점순 전체 랭킹만 P1 범위 (좋아요/코멘트수/월간은 비활성 탭으로 노출).
// 새 테이블/뷰 없이 albums + ratings를 조인해 앱 레벨에서 평균/개수 집계.

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

export default async function RankingPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("albums")
    .select("id, mbid, title, artist_name, cover_url, ratings(score)");

  const ranking: PopularAlbum[] = ((data ?? []) as unknown as AlbumWithRatings[])
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

  return (
    <main className="mx-auto max-w-screen-sm px-4 py-6">
      <h1 className="mb-4 text-[22px] font-bold text-text">랭킹</h1>

      <RankingTabs />

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
