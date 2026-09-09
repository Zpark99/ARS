// components/board/BoardPostRow.tsx
// QA·업데이트 목록 행 - 갤러리(GalleryRow)와 동일한 시각 규칙(제목/작성자/카운트/시간)을
// board_posts(qa/updates)에 맞춰 재사용해 홍보/갤러리와 양식을 통일한다(#127).

import Link from "next/link";

export type BoardPostRowData = {
  id: string;
  title: string;
  author: string;
  likeCount: number;
  commentCount: number;
  time: string;
};

export function BoardPostRow({ post, href }: { post: BoardPostRowData; href: string }) {
  const { title, author, likeCount, commentCount, time } = post;

  return (
    <Link href={href} className="flex items-center gap-2 border-b border-border py-2.5 last:border-b-0">
      <span className="min-w-0 flex-1 truncate text-body text-text">{title}</span>
      <span className="shrink-0 text-caption text-text-muted">{author}</span>
      <span className="shrink-0 text-caption text-text-muted">
        ♥ {likeCount} · 💬 {commentCount}
      </span>
      <span className="shrink-0 text-caption text-text-muted">{time}</span>
    </Link>
  );
}
