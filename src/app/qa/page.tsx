// app/qa/page.tsx
// QA 게시판 목록 - 홍보/갤러리와 동일한 행 목록 양식으로 통일(#127).
// 아코디언 펼침(BoardClient) 대신 BoardListClient(행 목록 → /qa/[postId] 상세).

import { BoardListClient } from "@/components/board/BoardListClient";
import { createClient } from "@/lib/supabase/server";
import type { BoardPostRowData } from "@/components/board/BoardPostRow";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

type QaPostRow = {
  id: string;
  title: string;
  user_id: string;
  created_at: string;
  like_count: number;
};

export default async function QaPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("board_posts")
    .select("id, title, user_id, created_at, like_count")
    .eq("board_type", "qa")
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) {
    console.error("qa posts fetch failed:", error);
  }

  const rows = (data ?? []) as QaPostRow[];
  const postIds = rows.map((p) => p.id);

  const commentCounts: Record<string, number> = {};
  if (postIds.length > 0) {
    const { data: comments, error: commentsErr } = await supabase
      .from("comments")
      .select("target_id")
      .eq("target_type", "post")
      .in("target_id", postIds);
    if (commentsErr) {
      console.error("qa comments fetch failed:", commentsErr);
    }
    for (const c of comments ?? []) {
      commentCounts[c.target_id] = (commentCounts[c.target_id] ?? 0) + 1;
    }
  }

  const posts: BoardPostRowData[] = rows.map((p) => ({
    id: p.id,
    title: p.title,
    author: `사용자 ${p.user_id.slice(0, 8)}`,
    likeCount: p.like_count,
    commentCount: commentCounts[p.id] ?? 0,
    time: formatDate(p.created_at),
  }));

  return (
    <BoardListClient
      boardType="qa"
      boardLabel="QA"
      basePath="/qa"
      posts={posts}
      isLoggedIn={!!user}
      currentUserId={user?.id ?? null}
      canWrite
    />
  );
}
