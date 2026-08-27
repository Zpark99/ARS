// components/home/AlbumHubReviewSection.tsx
// 컴포넌트스펙_3_홈카드조립 - ③ 앨범 허브 리뷰 4열. AlbumCard + 리뷰 텍스트.

import { SectionHeader } from "@/components/ui/SectionHeader";
import { AlbumCard, type Album } from "@/components/cards/AlbumCard";

export type ReviewedAlbum = Album & { reviewText: string };

export function AlbumHubReviewSection({ albums }: { albums: ReviewedAlbum[] }) {
  return (
    <div className="flex flex-col gap-3">
      <SectionHeader title="앨범 허브 리뷰" href="/archive" />
      {albums.length === 0 ? (
        <p className="py-8 text-center text-body text-text-muted">아직 리뷰가 없어요.</p>
      ) : (
        <div className="flex gap-4 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:grid md:grid-cols-4 md:overflow-visible">
          {albums.map((album) => (
            <div key={album.id} className="w-[45vw] shrink-0 md:w-auto">
              <AlbumCard {...album} showRating={false} />
              <p className="mt-2 line-clamp-2 text-caption text-text-muted">{album.reviewText}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
