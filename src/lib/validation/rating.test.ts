import { describe, expect, test } from "vitest";
import { isValidRatingScore } from "./rating";

describe("isValidRatingScore", () => {
  test("0.5~5 사이의 0.5 단위 값은 통과", () => {
    expect(isValidRatingScore(4.5)).toBe(true);
    expect(isValidRatingScore(0.5)).toBe(true);
    expect(isValidRatingScore(5)).toBe(true);
  });

  test("0 이하는 거부", () => {
    expect(isValidRatingScore(0)).toBe(false);
  });

  test("5 초과는 거부", () => {
    expect(isValidRatingScore(5.5)).toBe(false);
  });

  test("0.5 단위가 아니면 거부", () => {
    expect(isValidRatingScore(3.7)).toBe(false);
  });

  test("숫자가 아니면 거부", () => {
    expect(isValidRatingScore("4")).toBe(false);
    expect(isValidRatingScore(null)).toBe(false);
    expect(isValidRatingScore(undefined)).toBe(false);
  });
});
