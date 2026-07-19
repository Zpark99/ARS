// components/album/AlbumCard.tsx
// Figma AlbumCard 대응. 커버 + 제목 + 아티스트 + 별점.
// 카드 탭 → /album/[mbid] (실제 데이터 라우트)

import Image from "next/image";
import Link from "next/link";
import { RatingStars } from "@/components/ui/RatingStars";

export type Album = {
  id: string;
  mbid: string;
  title: string;
  artist: string;
  rating: number; // 0~5
  coverUrl?: string | null;
};

export function AlbumCard({ mbid, title, artist, rating, coverUrl }: Album) {
  return (
    <Link href={`/album/${mbid}`} className="group block">
      <article className="flex flex-col gap-2 rounded-md border border-border bg-surface p-3 transition-colors group-hover:border-text-muted/40">
        <div className="relative aspect-square w-full overflow-hidden rounded-md bg-bg">
          {coverUrl ? (
            <Image
              src={coverUrl}
              alt={`${title} 커버`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 50vw, 200px"
            />
          ) : null}
        </div>
        <h3 className="line-clamp-1 text-[15px] font-medium leading-tight text-text">
          {title}
        </h3>
        <p className="line-clamp-1 text-[13px] text-text-muted">{artist}</p>
        <RatingStars value={rating} size={16} />
      </article>
    </Link>
  );
}