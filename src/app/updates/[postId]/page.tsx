// app/updates/[postId]/page.tsx
// 업데이트 글 상세 (#127). 홍보 상세(#120)와 동일한 BoardPostDetail 재사용, board_type만 다름.

import type { Metadata } from "next";
import { boardPostMetadata } from "@/lib/seo";
import { BoardPostDetail } from "@/components/board/BoardPostDetail";

// <title> "{글 제목}" (#196)
export async function generateMetadata({ params }: { params: Promise<{ postId: string }> }): Promise<Metadata> {
  return boardPostMetadata((await params).postId, "updates");
}

export default async function UpdatePostPage({
  params,
}: {
  params: Promise<{ postId: string }>;
}) {
  const { postId } = await params;
  return (
    <BoardPostDetail postId={postId} boardType="updates" backHref="/updates" backLabel="업데이트" />
  );
}
