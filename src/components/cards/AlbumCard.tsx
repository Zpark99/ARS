// components/cards/AlbumCard.tsx
// 컴포넌트스펙_3_홈카드조립 - A-1. AlbumCard
// grid variant + 뱃지 오버레이(TOP=★평점 / HOT=♥좋아요). 홈·아카이브 공용.
// components/album/AlbumCard.tsx에서 이동 + 뱃지 슬롯 추가 (기존 사용처: AlbumGrid)

import Link from "next/link";
import { RatingStars } from "@/components/ui/RatingStars";
import AlbumCover from "@/components/AlbumCover";

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
  /** 홈 캐러셀 등 평점 텍스트가 필요 없는 자리에서 false로 숨김. 평점은 앨범 허브 정보탭이 기준. */
  showRating?: boolean;
};

export function AlbumCard({
  mbid,
  title,
  artist,
  rating,
  coverUrl,
  badge,
  showRating = true,
}: AlbumCardProps) {
  return (
    <Link href={`/album/${mbid}`} className="group block">
      <article className="flex flex-col gap-2 rounded-md border border-border bg-surface p-3 transition-colors group-hover:border-text-muted/40">
        <div className="relative aspect-square w-full overflow-hidden rounded-md bg-bg">
          <AlbumCover src={coverUrl ?? null} alt={`${title} 커버`} />
          {badge ? (
            <span className="absolute right-1.5 top-1.5 rounded-full bg-bg/85 px-1.5 py-0.5 text-caption text-accent">
              {badge.type === "top" ? `★ ${badge.value.toFixed(1)}` : `♥ ${badge.value}`}
            </span>
          ) : null}
        </div>
        {/* 15/13px 하드코딩 → body/caption 토큰(#194) */}
        <h3 className="line-clamp-1 text-body font-medium text-text">{title}</h3>
        <p className="line-clamp-1 text-caption text-text-muted">{artist}</p>
        {showRating ? <RatingStars value={rating} size={16} /> : null}
      </article>
    </Link>
  );
}
