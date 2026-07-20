// app/archive/page.tsx
// 화면정의서 03_아카이브. 2열 그리드. Supabase albums 실데이터.

import { AlbumGrid } from "@/components/album/AlbumGrid";
import { createClient } from "@/lib/supabase/server";

type AlbumWithRatings = {
  id: string;
  mbid: string;
  title: string;
  artist_name: string;
  cover_url: string | null;
  ratings: { score: number }[];
};

export default async function ArchivePage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("albums")
    .select("id, mbid, title, artist_name, cover_url, ratings(score)")
    .order("created_at", { ascending: false });

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

  return (
    <main className="mx-auto max-w-screen-sm px-4 py-6">
      <h1 className="mb-4 text-[22px] font-bold text-text">아카이브</h1>
      <AlbumGrid albums={albums} />
    </main>
  );
}
