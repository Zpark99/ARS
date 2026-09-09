// app/promo/[postId]/page.tsx
// 홍보 글 상세 (#120). BoardPostDetail(#127에서 qa/updates와 공용 추출) 재사용.

import { BoardPostDetail } from "@/components/board/BoardPostDetail";

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
