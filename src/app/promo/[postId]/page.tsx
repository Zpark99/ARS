// app/promo/[postId]/page.tsx
// 홍보 글 상세 (#120). BoardPostDetail(#127에서 qa/updates와 공용 추출) 재사용.

import type { Metadata } from "next";
import { boardPostMetadata } from "@/lib/seo";
import { BoardPostDetail } from "@/components/board/BoardPostDetail";

// <title> "{글 제목}" (#196)
export async function generateMetadata({ params }: { params: Promise<{ postId: string }> }): Promise<Metadata> {
  return boardPostMetadata((await params).postId, "promo");
}

export default async function PromoPostPage({
  params,
}: {
  params: Promise<{ postId: string }>;
}) {
  const { postId } = await params;
  return (
    <BoardPostDetail postId={postId} boardType="promo" backHref="/promo" backLabel="홍보게시판" />
  );
}
