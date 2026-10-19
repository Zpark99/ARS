// components/album/AlbumHeader.tsx
// 앨범 허브 스펙 - 1. 앨범 헤더. 커버 + 제목/아티스트 + HOT 하트(#92).
// 하트 = HOT 투표(핵심 규칙 1) - 별도 좋아요 버튼을 두지 않고 이 버튼이 likes(target_type='album')를 그대로 사용.

"use client";

import AlbumCover from "@/components/AlbumCover";
import { useLikeToggle } from "@/hooks/useLikeToggle";
import { useRouter } from "next/navigation";

export function AlbumHeader({
  albumId,
  title,
  artistName,
  coverUrl,
  initialLiked,
  initialCount,
  isLoggedIn,
}: {
  albumId: string;
  title: string;
  artistName: string;
  coverUrl: string | null;
  initialLiked: boolean;
  initialCount: number;
  isLoggedIn: boolean;
}) {
  const router = useRouter();
  const { liked, count, loading, toggle } = useLikeToggle({
    targetType: "album",
    targetId: albumId,
    initialLiked,
    initialCount,
  });

  const handleClick = () => {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }
    toggle();
  };

  return (
    <div className="flex items-center gap-4 px-4 py-4 md:items-start md:gap-6 md:px-6">
      {/* AlbumCover는 absolute/h-full이라 래퍼에 높이가 있어야 함 — 없으면 0px로 안 보임(#190) */}
      <div className="aspect-square w-20 shrink-0 md:w-40">
        <AlbumCover src={coverUrl} alt={`${title} 앨범 커버`} />
      </div>
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-title text-text md:text-display">{title}</h1>
        <p className="mt-1 truncate text-body text-text-muted">{artistName}</p>
        <button
          type="button"
          onClick={handleClick}
          disabled={loading}
          aria-label={liked ? "HOT 투표 취소" : "HOT 투표"}
          className={`mt-3 inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-body font-semibold transition-colors disabled:opacity-50 ${
            liked
              ? "border-accent bg-accent text-accent-foreground"
              : "border-border bg-transparent text-text-muted hover:text-text"
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill={liked ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth={2}
            className="h-4 w-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
            />
          </svg>
          <span>HOT {count}</span>
        </button>
      </div>
    </div>
  );
}
