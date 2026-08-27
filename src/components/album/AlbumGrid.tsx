// components/album/AlbumGrid.tsx
// Figma AlbumGrid 대응. 2열 그리드. 카드 높이 정렬은 CSS Grid가 자동 처리.
// 아카이브(/archive) · 검색(/search) 공용

import { AlbumCard, type Album } from "@/components/cards/AlbumCard";

export function AlbumGrid({ albums }: { albums: Album[] }) {
  if (albums.length === 0) {
    return (
      <p className="py-12 text-center text-[14px] text-text-muted">
        아직 등록된 앨범이 없어요.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {albums.map((album) => (
        <AlbumCard key={album.id} {...album} />
      ))}
    </div>
  );
}