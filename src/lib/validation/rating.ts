// lib/validation/rating.ts
// ratings 테이블의 CHECK(score >= 1 AND score <= 5) 제약과 동일한 규칙을
// DB 호출 전에 앱 레벨에서 먼저 검증.

export function isValidRatingScore(score: unknown): score is number {
  return (
    typeof score === "number" &&
    Number.isInteger(score) &&
    score >= 1 &&
    score <= 5
  );
}
