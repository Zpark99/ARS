import { describe, expect, test } from "vitest";
import { isValidComment, isValidCommentTargetType, MAX_COMMENT_LENGTH } from "./comment";

describe("isValidComment", () => {
  test("정상적인 내용은 통과", () => {
    expect(isValidComment("좋은 앨범이에요")).toBe(true);
  });

  test("빈 문자열은 거부", () => {
    expect(isValidComment("")).toBe(false);
  });

  test("공백만 있으면 거부", () => {
    expect(isValidComment("   ")).toBe(false);
  });

  test("최대 길이를 초과하면 거부", () => {
    expect(isValidComment("a".repeat(MAX_COMMENT_LENGTH + 1))).toBe(false);
  });

  test("최대 길이와 정확히 같으면 통과", () => {
    expect(isValidComment("a".repeat(MAX_COMMENT_LENGTH))).toBe(true);
  });

  test("문자열이 아니면 거부", () => {
    expect(isValidComment(null)).toBe(false);
    expect(isValidComment(undefined)).toBe(false);
    expect(isValidComment(123)).toBe(false);
  });
});

describe("isValidCommentTargetType", () => {
  test("'album'은 통과", () => {
    expect(isValidCommentTargetType("album")).toBe(true);
  });

  test("'post'는 통과", () => {
    expect(isValidCommentTargetType("post")).toBe(true);
  });

  test("'comment'는 거부 (comments의 target이 아님)", () => {
    expect(isValidCommentTargetType("comment")).toBe(false);
  });

  test("빈 문자열, null, undefined는 거부", () => {
    expect(isValidCommentTargetType("")).toBe(false);
    expect(isValidCommentTargetType(null)).toBe(false);
    expect(isValidCommentTargetType(undefined)).toBe(false);
  });
});
