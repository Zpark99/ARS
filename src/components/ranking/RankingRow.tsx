// components/ranking/RankingRow.tsx
// 랭킹 한 줄: 순위 + 커버 + 제목/아티스트 + 별점. 탭 → /album/[mbid] (실제 데이터 라우트).

import Image from "next/image";
import Link from "next/link";
import { RatingStars } from "@/components/ui/RatingStars";
import type { PopularAlbum } from "@/types/album";

type RankingRowProps = {
  album: PopularAlbum;
  rank: number;
};

export function RankingRow({ album, rank }: RankingRowProps) {
  return (
    <Link
      href={`/album/${album.mbid}`}
      className="flex items-center gap-3 rounded-md border border-border bg-surface p-3 transition-colors hover:border-text-muted/40"
    >
      <span className="w-6 shrink-0 text-center text-[15px] font-semibold text-text-muted">
        {rank}
      </span>

      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md bg-bg">
        {album.cover_url ? (
          <Image
            src={album.cover_url}
            alt={`${album.title} 커버`}
            fill
            className="object-cover"
            sizes="56px"
          />
        ) : null}
      </div>

      <div className="min-w-0 flex-1">
        <p className="line-clamp-1 text-[15px] font-medium text-text">
          {album.title}
        </p>
        <p className="line-clamp-1 text-[13px] text-text-muted">
          {album.artist_name}
        </p>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-0.5">
        {album.like_count !== undefined ? (
          <>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-3.5 w-3.5 text-accent"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
              />
            </svg>
            <span className="text-[12px] text-text-muted">{album.like_count}</span>
          </>
        ) : (
          <>
            <RatingStars value={album.avg_score} size={14} />
            <span className="text-[12px] text-text-muted">
              {album.avg_score.toFixed(1)}
            </span>
          </>
        )}
      </div>
    </Link>
  );
}
