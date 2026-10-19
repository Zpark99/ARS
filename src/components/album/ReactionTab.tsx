// components/album/ReactionTab.tsx
// 앨범 허브 스펙 - 반응 탭. 코멘트 목록 + 작성(#92).
// 404 해소 규칙: 조회는 반드시 target_type='album' + target_id=album.id (page.tsx에서 그대로 유지).
// CommentSection에서 이식 - fetch/optimistic update 로직은 그대로, 스타일만 디자인 토큰으로 교체.

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { MAX_COMMENT_LENGTH } from "@/lib/validation/comment";
import { toggleLike, UnauthorizedLikeError } from "@/lib/likes/toggleLike";
import type { CommentRow } from "@/types/album";

type CommentLikeInfo = { count: number; liked: boolean };

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function ReactionTab({
  albumId,
  initialComments,
  currentUserId,
  commentLikes,
}: {
  albumId: string;
  initialComments: CommentRow[];
  currentUserId: string | null;
  commentLikes: Record<string, CommentLikeInfo>;
}) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [likesState, setLikesState] = useState<Record<string, CommentLikeInfo>>(commentLikes);
  const [likingSet, setLikingSet] = useState<Set<string>>(new Set());

  const handleSubmit = async () => {
    if (!content.trim() || submitting) return;
    setSubmitting(true);
    setSubmitError("");
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetType: "album", targetId: albumId, content }),
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error ?? "코멘트 저장에 실패했습니다");
      }
      setContent("");
      router.refresh();
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : "코멘트 저장에 실패했습니다");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (deletingId) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/comments/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      router.refresh();
    } catch {
      // 삭제 실패 시 router.refresh()로 서버 원본 상태 복구
    } finally {
      setDeletingId(null);
    }
  };

  const handleCommentLike = async (commentId: string) => {
    if (likingSet.has(commentId)) return;
    if (!currentUserId) {
      router.push("/login");
      return;
    }

    const prev = likesState[commentId] ?? { count: 0, liked: false };
    const next = { count: prev.liked ? prev.count - 1 : prev.count + 1, liked: !prev.liked };
    setLikesState((s) => ({ ...s, [commentId]: next }));
    setLikingSet((prev) => new Set(prev).add(commentId));

    try {
      const result = await toggleLike("comment", commentId);
      setLikesState((s) => ({ ...s, [commentId]: result }));
    } catch (err) {
      setLikesState((s) => ({ ...s, [commentId]: prev }));
      if (err instanceof UnauthorizedLikeError) {
        router.push("/login");
      }
    } finally {
      setLikingSet((prev) => {
        const n = new Set(prev);
        n.delete(commentId);
        return n;
      });
    }
  };

  const hasMyComment = currentUserId ? initialComments.some((c) => c.user_id === currentUserId) : false;

  // 내 코멘트 맨 위 고정 (서버 정렬이 created_at desc이므로 filter만으로 순서 유지)
  const sortedComments = currentUserId
    ? [
        ...initialComments.filter((c) => c.user_id === currentUserId),
        ...initialComments.filter((c) => c.user_id !== currentUserId),
      ]
    : initialComments;

  return (
    <div className="px-4 py-5 md:px-6">
      <h2 className="mb-3 text-subtitle font-semibold text-text">반응</h2>

      {currentUserId && !hasMyComment ? (
        <div className="mb-5">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={MAX_COMMENT_LENGTH}
            placeholder="이 앨범에 대한 생각을 남겨보세요..."
            rows={3}
            className="w-full resize-none rounded-md border border-border bg-surface px-3 py-2.5 text-body text-text placeholder:text-text-muted focus:outline-none focus:border-accent"
          />
          <div className="mt-1.5 flex items-center justify-between">
            <span
              className={`text-caption tabular-nums ${
                content.length >= MAX_COMMENT_LENGTH ? "text-danger" : "text-text-muted"
              }`}
            >
              {content.length}/{MAX_COMMENT_LENGTH}
            </span>
            <Button size="sm" onClick={handleSubmit} disabled={!content.trim() || submitting}>
              {submitting ? "등록 중..." : "등록"}
            </Button>
          </div>
          {submitError && <p className="mt-1 text-caption text-danger">{submitError}</p>}
        </div>
      ) : currentUserId && hasMyComment ? (
        <p className="mb-5 text-caption text-text-muted">
          코멘트는 앨범당 하나만 작성할 수 있어요. 수정하려면 삭제 후 다시 작성해주세요.
        </p>
      ) : (
        <p className="mb-5 text-caption text-text-muted">
          <a href="/login" className="text-accent underline-offset-2 hover:underline">
            로그인
          </a>
          하면 코멘트를 남길 수 있어요
        </p>
      )}

      {sortedComments.length === 0 ? (
        <p className="py-10 text-center text-body text-text-muted">아직 코멘트가 없어요</p>
      ) : (
        <ul className="space-y-3">
          {sortedComments.map((comment) => {
            const isOwn = comment.user_id === currentUserId;
            return (
              <li
                key={comment.id}
                className={
                  isOwn
                    ? "rounded-md bg-surface px-3 py-3"
                    : "border-b border-border pb-4 last:border-b-0 last:pb-0"
                }
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <span className="text-caption font-semibold text-text">
                        {isOwn ? "나" : `사용자 ${comment.user_id.slice(0, 8)}`}
                      </span>
                      {isOwn && (
                        <span className="rounded-full bg-surface-raised px-1.5 py-0.5 text-caption leading-none text-text-muted">
                          내 코멘트
                        </span>
                      )}
                      <span className="text-caption text-text-muted">{formatDate(comment.created_at)}</span>
                    </div>
                    <p className="break-words text-body leading-relaxed text-text">{comment.content}</p>
                    <div className="mt-2">
                      <button
                        onClick={() => handleCommentLike(comment.id)}
                        disabled={likingSet.has(comment.id)}
                        aria-label={likesState[comment.id]?.liked ? "좋아요 취소" : "좋아요"}
                        className={`flex items-center gap-1 text-caption transition-colors disabled:opacity-50 ${
                          likesState[comment.id]?.liked ? "text-accent" : "text-text-muted hover:text-text"
                        }`}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill={likesState[comment.id]?.liked ? "currentColor" : "none"}
                          stroke="currentColor"
                          strokeWidth={2}
                          className="h-3.5 w-3.5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                          />
                        </svg>
                        <span>{likesState[comment.id]?.count ?? 0}</span>
                      </button>
                    </div>
                  </div>
                  {isOwn && (
                    <button
                      onClick={() => handleDelete(comment.id)}
                      disabled={deletingId === comment.id}
                      className="shrink-0 text-caption text-text-muted transition-colors hover:text-danger disabled:opacity-50"
                    >
                      {deletingId === comment.id ? "삭제 중" : "삭제"}
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
