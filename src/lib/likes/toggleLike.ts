// lib/likes/toggleLike.ts
// AlbumLikeButton / BoardPostLikeButton / CommentSection이 공유하는
// 좋아요 토글 API 호출. optimistic update/rollback은 각 컴포넌트(훅) 책임.

import type { LikeTargetType } from "@/lib/validation/like";

export class UnauthorizedLikeError extends Error {}

export type ToggleLikeResult = { liked: boolean; count: number };

export async function toggleLike(
  targetType: LikeTargetType,
  targetId: string
): Promise<ToggleLikeResult> {
  const res = await fetch("/api/likes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ targetType, targetId }),
  });

  if (res.status === 401) {
    throw new UnauthorizedLikeError();
  }
  if (!res.ok) {
    throw new Error("좋아요 처리에 실패했습니다");
  }

  return (await res.json()) as ToggleLikeResult;
}
