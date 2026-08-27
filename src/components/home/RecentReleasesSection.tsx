// components/home/RecentReleasesSection.tsx
// 컴포넌트스펙_3_홈카드조립 - ④ 최근 발매 앨범. Spotify 최신 발매일순 캐러셀.

import { SectionHeader } from "@/components/ui/SectionHeader";
import { AlbumCarousel, type AlbumCarouselItem } from "./AlbumCarousel";

export function RecentReleasesSection({ albums }: { albums: AlbumCarouselItem[] }) {
  return (
    <div className="flex flex-col gap-3">
      <SectionHeader title="최근 발매 앨범" />
      <AlbumCarousel items={albums} />
    </div>
  );
}
