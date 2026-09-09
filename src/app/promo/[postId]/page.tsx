// app/promo/[postId]/page.tsx
// 홍보 글 상세 (#120). 카드 href="#"였던 자리의 실제 도착지.
// 아티스트 표시는 #116과 동일 분기: artist_id 있으면 artists(name) 조인, 없으면
// artist_name_text(수기 입력). board_posts는 comments.target_type='post'/likes
// target_type='post'로 이미 완비돼 있어(BoardPostCard·PromoPage 댓글수 집계에서
// 이미 사용 중) BoardCommentSection·BoardPostLikeButton을 새로 만들지 않고 재사용.

import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { isValidUUID } from "@/lib/validation/like";
import BoardPostLikeButton from "@/components/board/BoardPostLikeButton";
import BoardCommentSection from "@/components/board/BoardCommentSection";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

type PromoPostRow = {
  id: string;
  title: string;
  content: string;
  user_id: string;
  created_at: string;
  board_type: string;
  artists: { name: string } | null;
  artist_name_text: string | null;
  albums: { title: string; mbid: string } | null;
};

export default async function PromoPostPage({
  params,
}: {
  params: Promise<{ postId: string }>;
}) {
  const { postId } = await params;

  // 더미/가짜 라우팅 식별자가 라이브까지 새는 걸 막는 가드 (#109, mbid-1류 재발 3회 방지)
  if (!isValidUUID(postId)) {
    console.error(`invalid promo route param: postId=${postId}`);
    notFound();
  }

  const supabase = await createClient();

  const [postResult, authResult] = await Promise.all([
    supabase
      .from("board_posts")
      .select("id, title, content, user_id, created_at, board_type, artists(name), artist_name_text, albums(title, mbid)")
      .eq("id", postId)
      .maybeSingle(),
    supabase.auth.getUser(),
  ]);

  if (postResult.error) {
    console.error("promo post fetch failed:", postResult.error);
  }
  const post = postResult.data as unknown as PromoPostRow | null;
  if (!post || post.board_type !== "promo") notFound();

  const teamName = post.artists?.name ?? post.artist_name_text ?? null;
  const currentUserId = authResult.data.user?.id ?? null;

  return (
    <div className="mx-auto flex max-w-[720px] flex-col gap-4 px-4 py-6 md:px-6">
      <Link href="/promo" className="text-caption text-text-muted hover:text-text">
        ← 홍보게시판
      </Link>
      <div className="rounded-md border border-border bg-surface p-5">
        {teamName && (
          <span className="mb-2 inline-block rounded-full bg-accent px-2 py-0.5 text-caption text-accent-foreground">
            [{teamName}]
          </span>
        )}
        <h1 className="text-subtitle font-semibold text-text">{post.title}</h1>
        <div className="mt-1.5 flex items-center gap-2 text-caption text-text-muted">
          <span>사용자 {post.user_id.slice(0, 8)}</span>
          <span>{formatDate(post.created_at)}</span>
        </div>
        {post.albums && (
          <Link
            href={`/album/${post.albums.mbid}`}
            className="mt-2 inline-block text-caption text-accent hover:underline"
          >
            연결된 앨범: {post.albums.title}
          </Link>
        )}
        <p className="mt-4 whitespace-pre-wrap break-words text-body leading-relaxed text-text">
          {post.content}
        </p>
        <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
          <BoardPostLikeButton postId={post.id} currentUserId={currentUserId} />
        </div>
        <BoardCommentSection postId={post.id} currentUserId={currentUserId} />
      </div>
    </div>
  );
}
