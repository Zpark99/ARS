import { describe, expect, test } from "vitest";
import {
  isValidBoardType,
  isValidBoardTitle,
  isValidBoardContent,
  MAX_BOARD_TITLE_LENGTH,
  MAX_BOARD_CONTENT_LENGTH,
} from "./board";

describe("isValidBoardType", () => {
  test("qa는 통과", () => {
    expect(isValidBoardType("qa")).toBe(true);
  });

  test("updates는 통과", () => {
    expect(isValidBoardType("updates")).toBe(true);
  });

  test("gallery는 거부", () => {
    expect(isValidBoardType("gallery")).toBe(false);
  });

  test("빈 문자열은 거부", () => {
    expect(isValidBoardType("")).toBe(false);
  });

  test("대문자는 거부", () => {
    expect(isValidBoardType("QA")).toBe(false);
  });
});

describe("isValidBoardTitle", () => {
  test("정상적인 제목은 통과", () => {
    expect(isValidBoardTitle("궁금한 게 있어요")).toBe(true);
  });

  test("빈 문자열은 거부", () => {
    expect(isValidBoardTitle("")).toBe(false);
  });

  test("공백만 있으면 거부", () => {
    expect(isValidBoardTitle("   ")).toBe(false);
  });

  test("최대 길이를 초과하면 거부", () => {
    expect(isValidBoardTitle("a".repeat(MAX_BOARD_TITLE_LENGTH + 1))).toBe(false);
  });

  test("최대 길이와 정확히 같으면 통과", () => {
    expect(isValidBoardTitle("a".repeat(MAX_BOARD_TITLE_LENGTH))).toBe(true);
  });
});

describe("isValidBoardContent", () => {
  test("정상적인 내용은 통과", () => {
    expect(isValidBoardContent("자세한 내용입니다")).toBe(true);
  });

  test("빈 문자열은 거부", () => {
    expect(isValidBoardContent("")).toBe(false);
  });

  test("최대 길이를 초과하면 거부", () => {
    expect(isValidBoardContent("a".repeat(MAX_BOARD_CONTENT_LENGTH + 1))).toBe(false);
  });

  test("최대 길이와 정확히 같으면 통과", () => {
    expect(isValidBoardContent("a".repeat(MAX_BOARD_CONTENT_LENGTH))).toBe(true);
  });
});
