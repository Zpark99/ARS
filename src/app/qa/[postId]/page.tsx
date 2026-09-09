// app/qa/[postId]/page.tsx
// QA 글 상세 (#127). 홍보 상세(#120)와 동일한 BoardPostDetail 재사용, board_type만 다름.

import { BoardPostDetail } from "@/components/board/BoardPostDetail";

export default async function QaPostPage({
  params,
}: {
  params: Promise<{ postId: string }>;
}) {
  const { postId } = await params;
  return <BoardPostDetail postId={postId} boardType="qa" backHref="/qa" backLabel="QA" />;
}
