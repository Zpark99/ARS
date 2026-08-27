// components/cards/GalleryCard.tsx
// 컴포넌트스펙_5_갤러리홍보 - 신규. 전체 갤러리 디렉토리의 팀 카드.

import Link from "next/link";

export type GalleryCardData = {
  artistId: string;
  name: string;
  rank?: number;
  postCount: number;
  subCount: number;
};

export function GalleryCard({ gallery, href }: { gallery: GalleryCardData; href: string }) {
  const { name, rank, postCount, subCount } = gallery;

  return (
    <Link
      href={href}
      className="flex flex-col gap-2 rounded-md border border-border bg-surface-raised p-3"
    >
      <div className="flex items-center gap-2">
        {rank ? (
          <span
            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-caption ${
              rank <= 3 ? "bg-accent text-accent-foreground" : "bg-surface text-text-muted"
            }`}
          >
            {rank}
          </span>
        ) : null}
        <span className="truncate text-subtitle font-semibold text-text">{name}</span>
      </div>
      <p className="text-caption text-text-muted">
        글 {postCount} · 구독 {subCount}
      </p>
    </Link>
  );
}
