// components/cards/GalleryRow.tsx
// 컴포넌트스펙_3_홈카드조립 - A-3. GalleryRow
// 갤러리 글 목록 한 행. 홈 갤러리 핫글 + 팀 갤러리 공용.

import Link from "next/link";

export type GalleryPostFlag = "notice" | "concept" | "normal";

export type GalleryRowData = {
  id: string;
  title: string;
  author: string;
  likeCount: number;
  time: string;
  flag?: GalleryPostFlag;
  visited?: boolean;
};

const FLAG_LABEL: Record<Exclude<GalleryPostFlag, "normal">, string> = {
  notice: "공지",
  concept: "컨셉",
};

export function GalleryRow({ post, href }: { post: GalleryRowData; href: string }) {
  const { title, author, likeCount, time, flag, visited } = post;

  return (
    <Link
      href={href}
      className="flex items-center gap-2 border-b border-border py-2.5 last:border-b-0"
    >
      {flag && flag !== "normal" ? (
        <span className="shrink-0 text-caption text-accent">[{FLAG_LABEL[flag]}]</span>
      ) : null}
      <span
        className={`min-w-0 flex-1 truncate text-body ${visited ? "text-text-muted" : "text-text"}`}
      >
        {title}
      </span>
      <span className="shrink-0 text-caption text-text-muted">{author}</span>
      <span className="shrink-0 text-caption text-text-muted">♥ {likeCount}</span>
      <span className="shrink-0 text-caption text-text-muted">{time}</span>
    </Link>
  );
}
