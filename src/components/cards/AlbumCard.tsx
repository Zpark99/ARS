// components/cards/AlbumCard.tsx
// 컴포넌트스펙_3_홈카드조립 - A-1. AlbumCard
// grid variant + 뱃지 오버레이(TOP=★평점 / HOT=♥좋아요). 홈·아카이브 공용.
// components/album/AlbumCard.tsx에서 이동 + 뱃지 슬롯 추가 (기존 사용처: AlbumGrid)

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

export type AlbumCardBadge =
  | { type: "top"; value: number } // 평점, 예: 4.2
  | { type: "hot"; value: number }; // 좋아요 수

type AlbumCardProps = Album & {
  badge?: AlbumCardBadge;
};

export function AlbumCard({ mbid, title, artist, rating, coverUrl, badge }: AlbumCardProps) {
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
          {badge ? (
            <span className="absolute right-1.5 top-1.5 rounded-full bg-bg/85 px-1.5 py-0.5 text-caption text-accent">
              {badge.type === "top" ? `★ ${badge.value.toFixed(1)}` : `♥ ${badge.value}`}
            </span>
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
