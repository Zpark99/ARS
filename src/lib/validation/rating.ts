// lib/validation/rating.ts
// ratings 테이블의 CHECK(score >= 0.5 AND score <= 5 AND 0.5 단위) 제약과 동일한 규칙을
// DB 호출 전에 앱 레벨에서 먼저 검증.

export function isValidRatingScore(score: unknown): score is number {
  return (
    typeof score === "number" &&
    Number.isFinite(score) &&
    score >= 0.5 &&
    score <= 5 &&
    Number.isInteger(score * 2)
  );
}
