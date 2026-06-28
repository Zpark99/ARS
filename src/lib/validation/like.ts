// lib/validation/like.ts
// likes 테이블의 target_type CHECK 제약 및 target_id(UUID) 형식을
// DB 호출 전에 앱 레벨에서 먼저 검증.

export type LikeTargetType = "album" | "comment";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isValidTargetType(
  targetType: unknown
): targetType is LikeTargetType {
  return targetType === "album" || targetType === "comment";
}

export function isValidUUID(id: unknown): id is string {
  return typeof id === "string" && UUID_REGEX.test(id);
}
