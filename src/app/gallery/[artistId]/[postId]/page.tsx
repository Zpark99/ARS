// app/gallery/[artistId]/[postId]/page.tsx
// 갤러리 글 상세 (#118 신설 → #120 브레드크럼/공유 보강 → #147 댓글 추가 → #150 좋아요 추가).
// 반응 탭(ReactionTab)과 동일한 패턴: 닉네임 조인 없이 user_id 앞 8자리만 표시.
// 댓글은 QA와 동일한 BoardCommentSection 재사용, target_type='gallery_post'(#147).
// 좋아요도 QA와 동일한 BoardPostLikeButton 재사용, target_type='gallery_post'(#150).
// 조회수·이미지는 컬럼 자체가 없어 제외.
// 본인 글 수정·삭제는 board 상세와 같은 OwnerPostActions(#64). 갤러리 이동·글 종류 변경은 범위 밖(021 트리거로도 차단).

import type { Metadata } from "next";
import { galleryPostMetadata } from "@/lib/seo";
import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { isValidUUID } from "@/lib/validation/like";
import { SharePostButton } from "@/components/gallery/SharePostButton";
import BoardCommentSection from "@/components/board/BoardCommentSection";
import BoardPostLikeButton from "@/components/board/BoardPostLikeButton";
import { OwnerPostActions } from "@/components/board/OwnerPostActions";
import type { GalleryPostFlag } from "@/components/cards/GalleryRow";

const CATEGORY_LABEL: Record<GalleryPostFlag, string> = {
  notice: "공지",
  concept: "개념글",
  normal: "일반",
};

type GalleryPostRow = {
  id: string;
  title: string;
  content: string;
  user_id: string;
  created_at: string;
  post_flag: GalleryPostFlag;
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// <title> "{글 제목}" (#196)
export async function generateMetadata({ params }: { params: Promise<{ artistId: string; postId: string }> }): Promise<Metadata> {
  const { artistId, postId } = await params;
  return galleryPostMetadata(artistId, postId);
}

export default async function GalleryPostPage({
  params,
}: {
  params: Promise<{ artistId: string; postId: string }>;
}) {
  const { artistId, postId } = await params;

  // 더미/가짜 라우팅 식별자가 라이브까지 새는 걸 막는 가드 (#109, mbid-1류 재발 3회 방지)
  if (!isValidUUID(artistId) || !isValidUUID(postId)) {
    console.error(`invalid gallery route params: artistId=${artistId} postId=${postId}`);
    notFound();
  }

  const supabase = await createClient();

  const [artistResult, postResult, authResult] = await Promise.all([
    supabase.from("artists").select("id, name").eq("id", artistId).maybeSingle(),
    supabase
      .from("gallery_posts")
      .select("id, title, content, user_id, created_at, post_flag")
      .eq("id", postId)
      .eq("artist_id", artistId)
      .maybeSingle(),
    supabase.auth.getUser(),
  ]);

  if (!artistResult.data) notFound();
  if (postResult.error) {
    console.error("gallery post fetch failed:", postResult.error);
  }
  if (!postResult.data) notFound();

  const post = postResult.data as unknown as GalleryPostRow;
  const artistName = artistResult.data.name;
  const currentUserId = authResult.data.user?.id ?? null;

  return (
    <div className="mx-auto flex max-w-[720px] flex-col gap-4 px-4 py-6 md:px-6">
      <nav className="flex flex-wrap items-center gap-1.5 text-caption text-text-muted">
        <Link href="/gallery" className="hover:text-text">
          갤러리
        </Link>
        <span>/</span>
        <Link href={`/gallery/${artistId}`} className="hover:text-text">
          {artistName} 갤러리
        </Link>
        <span>/</span>
        <span className="text-text">{CATEGORY_LABEL[post.post_flag]}</span>
      </nav>
      <div className="rounded-md border border-border bg-surface p-5">
        <OwnerPostActions
          table="gallery_posts"
          postId={post.id}
          title={post.title}
          content={post.content}
          isOwner={currentUserId === post.user_id}
          listHref={`/gallery/${artistId}`}
        >
          <h1 className="text-subtitle font-semibold text-text">{post.title}</h1>
          <div className="mt-1.5 flex items-center gap-2 text-caption text-text-muted">
            <span>사용자 {post.user_id.slice(0, 8)}</span>
            <span>{formatDate(post.created_at)}</span>
          </div>
          <p className="mt-4 whitespace-pre-wrap break-words text-body leading-relaxed text-text">
            {post.content}
          </p>
        </OwnerPostActions>
        <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
          <BoardPostLikeButton postId={post.id} currentUserId={currentUserId} targetType="gallery_post" />
          <SharePostButton />
        </div>
        <BoardCommentSection postId={post.id} currentUserId={currentUserId} targetType="gallery_post" />
      </div>
    </div>
  );
}
