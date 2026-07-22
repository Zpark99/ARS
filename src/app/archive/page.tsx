// app/archive/page.tsx
// 화면정의서 03_아카이브. 2열 그리드. Supabase albums 실데이터.
// 필터: 아티스트명 검색(ilike) + 정렬(최신순/평점순). #53

import { AlbumGrid } from "@/components/album/AlbumGrid";
import { ArchiveFilters } from "@/components/archive/ArchiveFilters";
import { createClient } from "@/lib/supabase/server";

type AlbumWithRatings = {
  id: string;
  mbid: string;
  title: string;
  artist_name: string;
  cover_url: string | null;
  ratings: { score: number }[];
};

export default async function ArchivePage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string; q?: string }>;
}) {
  const { sort = "latest", q = "" } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("albums")
    .select("id, mbid, title, artist_name, cover_url, ratings(score)");

  if (q.trim()) {
    query = query.ilike("artist_name", `%${q.trim()}%`);
  }

  const { data } = await query.order("created_at", { ascending: false });

  const albums = ((data ?? []) as unknown as AlbumWithRatings[]).map((album) => {
    const ratingCount = album.ratings.length;
    const avgScore =
      ratingCount > 0
        ? album.ratings.reduce((sum, r) => sum + r.score, 0) / ratingCount
        : 0;
    return {
      id: album.id,
      mbid: album.mbid,
      title: album.title,
      artist: album.artist_name,
      rating: avgScore,
      coverUrl: album.cover_url,
    };
  });

  if (sort === "rating") {
    albums.sort((a, b) => b.rating - a.rating);
  }

  const isEmptySearch = albums.length === 0 && q.trim().length > 0;

  return (
    <main className="mx-auto max-w-screen-sm px-4 py-6">
      <h1 className="mb-4 text-[22px] font-bold text-text">아카이브</h1>
      <ArchiveFilters activeSort={sort} query={q} />
      {isEmptySearch ? (
        <p className="py-12 text-center text-[14px] text-text-muted">
          검색 결과가 없어요
        </p>
      ) : (
        <AlbumGrid albums={albums} />
      )}
    </main>
  );
}
