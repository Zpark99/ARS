// lib/validation/comment.ts
// comments 테이블의 CHECK(char_length(content) <= 500), CHECK(target_type IN ('album','post'))
// 제약과 동일한 규칙을 DB 호출 전에 앱 레벨에서 먼저 검증.
import type { CommentTargetType } from "@/types/album";

export const MAX_COMMENT_LENGTH = 500;

export function isValidComment(content: unknown): content is string {
  return (
    typeof content === "string" &&
    content.trim().length >= 1 &&
    content.length <= MAX_COMMENT_LENGTH
  );
}

export function isValidCommentTargetType(
  targetType: unknown
): targetType is CommentTargetType {
  return targetType === "album" || targetType === "post";
}
