// app/gallery/[artistId]/[postId]/page.tsx
// 갤러리 글 상세 (#118). 팀 갤러리(/gallery/[artistId])에서 href="#"였던 카드의 실제 도착지.
// 반응 탭(ReactionTab)과 동일한 패턴: 닉네임 조인 없이 user_id 앞 8자리만 표시.

import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { isValidUUID } from "@/lib/validation/like";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
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

  const [artistResult, postResult] = await Promise.all([
    supabase.from("artists").select("id, name").eq("id", artistId).maybeSingle(),
    supabase
      .from("gallery_posts")
      .select("id, title, content, user_id, created_at")
      .eq("id", postId)
      .eq("artist_id", artistId)
      .maybeSingle(),
  ]);

  if (!artistResult.data) notFound();
  if (postResult.error) {
    console.error("gallery post fetch failed:", postResult.error);
  }
  if (!postResult.data) notFound();

  const post = postResult.data;

  return (
    <div className="mx-auto flex max-w-[720px] flex-col gap-4 px-4 py-6 md:px-6">
      <Link
        href={`/gallery/${artistId}`}
        className="text-caption text-text-muted hover:text-text"
      >
        ← {artistResult.data.name} 갤러리
      </Link>
      <div className="rounded-md border border-border bg-surface p-5">
        <h1 className="text-subtitle font-semibold text-text">{post.title}</h1>
        <div className="mt-1.5 flex items-center gap-2 text-caption text-text-muted">
          <span>사용자 {post.user_id.slice(0, 8)}</span>
          <span>{formatDate(post.created_at)}</span>
        </div>
        <p className="mt-4 whitespace-pre-wrap break-words text-body leading-relaxed text-text">
          {post.content}
        </p>
      </div>
    </div>
  );
}
