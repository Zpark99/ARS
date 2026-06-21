import { describe, expect, test } from "vitest";
import { isValidRatingScore } from "./rating";

describe("isValidRatingScore", () => {
  test("1~5 사이 정수는 통과", () => {
    expect(isValidRatingScore(1)).toBe(true);
    expect(isValidRatingScore(5)).toBe(true);
  });

  test("0 이하는 거부", () => {
    expect(isValidRatingScore(0)).toBe(false);
  });

  test("5 초과는 거부", () => {
    expect(isValidRatingScore(5.5)).toBe(false);
  });

  test("정수가 아니면 거부 (이 앱은 0.5점 단위를 지원하지 않음)", () => {
    expect(isValidRatingScore(3.7)).toBe(false);
  });

  test("숫자가 아니면 거부", () => {
    expect(isValidRatingScore("4")).toBe(false);
    expect(isValidRatingScore(null)).toBe(false);
    expect(isValidRatingScore(undefined)).toBe(false);
  });
});
