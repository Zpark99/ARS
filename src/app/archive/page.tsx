// app/archive/page.tsx
// 화면정의서 03_아카이브. 2열 그리드. 데이터는 P1에서 Supabase albums로 교체.

import { AlbumGrid } from "@/components/album/AlbumGrid";
import type { Album } from "@/components/album/AlbumCard";

const mockAlbums: Album[] = Array.from({ length: 8 }, (_, i) => ({
  id: String(i + 1),
  title: ["양양", "Blonde", "Happier Than Ever", "To Pimp a Butterfly"][i % 4],
  artist: ["검정치마", "Frank Ocean", "Billie Eilish", "Kendrick Lamar"][i % 4],
  rating: [5, 5, 4, 5][i % 4],
}));

export default function ArchivePage() {
  return (
    <main className="mx-auto max-w-screen-sm px-4 py-6">
      <h1 className="mb-4 text-[22px] font-bold text-text">아카이브</h1>
      <AlbumGrid albums={mockAlbums} />
    </main>
  );
}
