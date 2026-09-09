// app/updates/[postId]/page.tsx
// 업데이트 글 상세 (#127). 홍보 상세(#120)와 동일한 BoardPostDetail 재사용, board_type만 다름.

import { BoardPostDetail } from "@/components/board/BoardPostDetail";

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
