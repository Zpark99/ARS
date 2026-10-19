// components/cards/PromoCard.tsx
// 컴포넌트스펙_3_홈카드조립 - A-4. PromoCard
// 홍보글 카드. 홈 홍보게시판 + /promo 목록 + 앨범 허브 홍보 탭 공용.

import Image from "next/image";
import Link from "next/link";

export type PromoCardData = {
  id: string;
  title: string;
  team?: string | null;
  thumbnailUrl?: string | null;
  likeCount: number;
  commentCount: number;
  time: string;
};

export function PromoCard({ promo, href }: { promo: PromoCardData; href: string }) {
  const { title, team, thumbnailUrl, likeCount, commentCount, time } = promo;

  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-md border border-border bg-surface-raised p-3"
    >
      {/* 썸네일 없으면 56px 빈 박스를 그리지 않음(#194) */}
      {thumbnailUrl ? (
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-sm bg-bg">
          <Image src={thumbnailUrl} alt="" fill className="object-cover" sizes="56px" />
        </div>
      ) : null}
      <div className="min-w-0 flex-1">
        {team ? (
          <span className="mb-1 inline-block rounded-full bg-accent px-2 py-0.5 text-caption text-accent-foreground">
            [{team}]
          </span>
        ) : null}
        <p className="truncate text-body text-text">{title}</p>
        <p className="text-caption text-text-muted">
          ♥ {likeCount} · 💬 {commentCount} · {time}
        </p>
      </div>
    </Link>
  );
}
