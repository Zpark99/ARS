// components/board/OwnerPostActions.tsx
// 본인 글 수정·삭제 — 갤러리(#64)·QA/홍보/업데이트(#178) 상세 공용. #70/#127에서 빠졌던 기능 복구.
// 상세 페이지(서버 컴포넌트)가 제목·본문을 children으로 넘기고, 수정 중엔 그 자리를 폼으로 바꾼다.
// 수정 요청엔 title·content만 싣는다 — board_type·artist_id·post_flag는 021 트리거가 막지만 요청 자체를 깨끗하게.
// 삭제 시 댓글·좋아요 정리는 DB 트리거(009/021)가 처리.

"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import BoardPostForm from "@/components/board/BoardPostForm";

export function OwnerPostActions({
  table,
  postId,
  title,
  content,
  isOwner,
  listHref,
  editNote,
  children,
}: {
  table: "board_posts" | "gallery_posts";
  postId: string;
  title: string;
  content: string;
  isOwner: boolean;
  listHref: string;
  editNote?: string;
  children: ReactNode;
}) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOwner) return <>{children}</>;

  // RLS에 걸리면 에러 없이 0행으로 끝나므로 select로 실제 반영 행 수까지 확인한다
  const handleUpdate = async (newTitle: string, newContent: string) => {
    setError(null);
    const { data, error } = await createClient()
      .from(table)
      .update({ title: newTitle, content: newContent })
      .eq("id", postId)
      .select("id");
    if (error || !data?.length) {
      setError(error?.message ?? "수정하지 못했어요. 다시 시도해주세요.");
      return;
    }
    setIsEditing(false);
    router.refresh();
  };

  const handleDelete = async () => {
    if (!window.confirm("게시글을 삭제할까요?")) return;
    setError(null);
    setDeleting(true);
    const { data, error } = await createClient().from(table).delete().eq("id", postId).select("id");
    if (error || !data?.length) {
      setDeleting(false);
      setError(error?.message ?? "삭제하지 못했어요. 다시 시도해주세요.");
      return;
    }
    // replace: 뒤로 가기로 삭제된 글(404)에 돌아가지 않게
    router.replace(listHref);
  };

  if (isEditing) {
    return (
      <div className="flex flex-col gap-2">
        {editNote && <p className="text-caption text-text-muted">{editNote}</p>}
        <BoardPostForm
          initialTitle={title}
          initialContent={content}
          submitLabel="수정 완료"
          onSubmit={handleUpdate}
          onCancel={() => {
            setIsEditing(false);
            setError(null);
          }}
        />
        {error && <p className="text-caption text-danger">{error}</p>}
      </div>
    );
  }

  return (
    <>
      {children}
      <div role="group" aria-label="내 글 관리" className="mt-3 flex justify-end gap-3 text-caption">
        <button type="button" onClick={() => setIsEditing(true)} className="text-text-muted hover:text-text">
          수정
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          className="text-text-muted hover:text-danger disabled:opacity-50"
        >
          {deleting ? "삭제 중" : "삭제"}
        </button>
      </div>
      {error && <p className="mt-1 text-right text-caption text-danger">{error}</p>}
    </>
  );
}
