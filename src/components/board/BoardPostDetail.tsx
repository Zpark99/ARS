// components/board/BoardPostDetail.tsx
// board_posts 단건 상세 - 홍보(#120/PR#121)에서 만든 패턴을 QA·업데이트까지
// board_type 파라미터화해서 재사용(#127, 새 게시판 만들지 않음).
// 아티스트/앨범 표시는 promo에만 값이 있고 qa/updates는 항상 null이라 그대로 둬도 안전.
// comments.target_type='post'/likes target_type='post'는 board_posts 공통이라
// BoardCommentSection·BoardPostLikeButton을 boardType 무관하게 재사용.
// 공유 버튼(SharePostButton)은 순수 클라이언트 동작이라 스키마 무관하게 추가(#150).
// 본인 글 수정·삭제는 OwnerPostActions(#178). 홍보 팀·앨범은 수정 범위 밖.

import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { fetchNicknameMap, authorName } from "@/lib/profiles";
import { isValidUUID } from "@/lib/validation/like";
import type { BoardType } from "@/lib/validation/board";
import BoardPostLikeButton from "@/components/board/BoardPostLikeButton";
import BoardCommentSection from "@/components/board/BoardCommentSection";
import { OwnerPostActions } from "@/components/board/OwnerPostActions";
import { SharePostButton } from "@/components/gallery/SharePostButton";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

type BoardPostRow = {
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

export async function BoardPostDetail({
  postId,
  boardType,
  backHref,
  backLabel,
}: {
  postId: string;
  boardType: BoardType;
  backHref: string;
  backLabel: string;
}) {
  // 더미/가짜 라우팅 식별자가 라이브까지 새는 걸 막는 가드 (#109, mbid-1류 재발 3회 방지)
  if (!isValidUUID(postId)) {
    console.error(`invalid board post route param: postId=${postId}`);
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
    console.error("board post fetch failed:", postResult.error);
  }
  const post = postResult.data as unknown as BoardPostRow | null;
  if (!post || post.board_type !== boardType) notFound();

  const teamName = post.artists?.name ?? post.artist_name_text ?? null;
  const currentUserId = authResult.data.user?.id ?? null;
  const author = authorName(await fetchNicknameMap(supabase, [post.user_id]), post.user_id);

  return (
    <div className="mx-auto flex max-w-[720px] flex-col gap-4 px-4 py-6 md:px-6">
      <Link href={backHref} className="text-caption text-text-muted hover:text-text">
        ← {backLabel}
      </Link>
      <div className="rounded-md border border-border bg-surface p-5">
        <OwnerPostActions
          table="board_posts"
          postId={post.id}
          title={post.title}
          content={post.content}
          isOwner={currentUserId === post.user_id}
          listHref={backHref}
          editNote={boardType === "promo" ? "팀·앨범은 수정할 수 없어요" : undefined}
        >
          {teamName && (
            <span className="mb-2 inline-block rounded-full bg-accent px-2 py-0.5 text-caption text-accent-foreground">
              [{teamName}]
            </span>
          )}
          <h1 className="text-subtitle font-semibold text-text">{post.title}</h1>
          <div className="mt-1.5 flex items-center gap-2 text-caption text-text-muted">
            <span>{author}</span>
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
        </OwnerPostActions>
        <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
          <BoardPostLikeButton postId={post.id} currentUserId={currentUserId} />
          <SharePostButton />
        </div>
        <BoardCommentSection postId={post.id} currentUserId={currentUserId} />
      </div>
    </div>
  );
}
