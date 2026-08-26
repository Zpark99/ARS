// lib/validation/board.ts
// board_posts 테이블의 board_type/title/content CHECK 제약과 동일한 규칙을
// DB 호출 전에 앱 레벨에서 먼저 검증.

export type BoardType = "qa" | "updates" | "promo";

export const MAX_BOARD_TITLE_LENGTH = 100;
export const MAX_BOARD_CONTENT_LENGTH = 2000;

export function isValidBoardType(value: unknown): value is BoardType {
  return value === "qa" || value === "updates" || value === "promo";
}

// promo 글은 artist_id/album_id 필수 (board_posts_promo_requires_artist_album DB 제약과 동일)
export function requiresArtistAlbum(boardType: BoardType): boolean {
  return boardType === "promo";
}

export function isValidBoardTitle(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.trim().length >= 1 &&
    value.trim().length <= MAX_BOARD_TITLE_LENGTH
  );
}

export function isValidBoardContent(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.trim().length >= 1 &&
    value.trim().length <= MAX_BOARD_CONTENT_LENGTH
  );
}
