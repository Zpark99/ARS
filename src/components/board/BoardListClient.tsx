// components/board/BoardListClient.tsx
// QA·업데이트 목록 - 홍보/갤러리(PromoClient/TeamGalleryClient)와 동일한 목록 양식으로
// 통일(#127). 아코디언 펼침(BoardClient/BoardPostCard) 대신 행 목록 → 상세 라우트 클릭.

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { BoardPostRow, type BoardPostRowData } from "./BoardPostRow";
import BoardPostForm from "./BoardPostForm";
import { isValidBoardTitle, isValidBoardContent, type BoardType } from "@/lib/validation/board";
import { createClient } from "@/lib/supabase/client";
import { fetchNicknameMap, authorName } from "@/lib/profiles";
import { formatDate } from "@/lib/date";

export function BoardListClient({
  boardType,
  boardLabel,
  basePath,
  posts: initialPosts,
  isLoggedIn,
  currentUserId,
  canWrite,
}: {
  boardType: BoardType;
  boardLabel: string;
  basePath: string;
  posts: BoardPostRowData[];
  isLoggedIn: boolean;
  currentUserId: string | null;
  canWrite: boolean;
}) {
  const router = useRouter();
  const [posts, setPosts] = useState(initialPosts);
  const [isWriting, setIsWriting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleWriteClick = () => {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }
    setIsWriting((prev) => !prev);
    setSubmitError(null);
  };

  const handleCreate = async (title: string, content: string) => {
    if (!currentUserId || !isValidBoardTitle(title) || !isValidBoardContent(content)) return;
    const supabase = createClient();
    const { data, error } = await supabase
      .from("board_posts")
      .insert({ board_type: boardType, user_id: currentUserId, title, content })
      .select("id, title, user_id, created_at, like_count")
      .single();
    if (error || !data) {
      setSubmitError(error?.message ?? "등록에 실패했어요. 다시 시도해주세요.");
      return;
    }
    const names = await fetchNicknameMap(supabase, [data.user_id]);
    setPosts((prev) => [
      {
        id: data.id,
        title: data.title,
        author: authorName(names, data.user_id),
        likeCount: data.like_count,
        commentCount: 0,
        time: formatDate(data.created_at),
      },
      ...prev,
    ]);
    setIsWriting(false);
  };

  return (
    <div className="mx-auto flex max-w-[1364px] flex-col gap-5 px-4 py-6 md:px-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-title text-text">{boardLabel}</h1>
        {canWrite && (
          <Button variant="ghost" size="sm" onClick={handleWriteClick}>
            {isLoggedIn ? (isWriting ? "취소" : "글쓰기") : "글쓰기 🔒"}
          </Button>
        )}
      </div>

      {boardType === "qa" && (
        <p className="text-caption text-text-muted">
          써보시면서 불편한 점이나 개선이 필요한 부분이 있으면 남겨주세요
        </p>
      )}

      {isWriting && (
        <div className="rounded-md border border-border bg-surface p-4">
          <BoardPostForm onSubmit={handleCreate} onCancel={() => setIsWriting(false)} submitLabel="작성" />
          {submitError && <p className="mt-2 text-xs text-red-500">{submitError}</p>}
        </div>
      )}

      {posts.length === 0 ? (
        <p className="py-16 text-center text-body text-text-muted">아직 게시글이 없어요</p>
      ) : (
        <div className="rounded-md border border-border bg-surface px-3">
          {posts.map((post) => (
            <BoardPostRow key={post.id} post={post} href={`${basePath}/${post.id}`} />
          ))}
        </div>
      )}

      {posts.length > 0 ? (
        <Button variant="ghost" disabled className="self-center">
          더 보기
        </Button>
      ) : null}
    </div>
  );
}
