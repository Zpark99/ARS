import { describe, expect, test } from "vitest";
import { isValidTargetType, isValidUUID } from "./like";

describe("isValidTargetType", () => {
  test("'album'은 통과", () => {
    expect(isValidTargetType("album")).toBe(true);
  });

  test("'comment'는 통과", () => {
    expect(isValidTargetType("comment")).toBe(true);
  });

  test("'post'는 통과", () => {
    expect(isValidTargetType("post")).toBe(true);
  });

  test("허용되지 않은 값은 거부", () => {
    expect(isValidTargetType("board")).toBe(false);
  });

  test("빈 문자열은 거부", () => {
    expect(isValidTargetType("")).toBe(false);
  });

  test("대문자가 섞이면 거부", () => {
    expect(isValidTargetType("Album")).toBe(false);
  });
});

describe("isValidUUID", () => {
  test("정상적인 UUID는 통과", () => {
    expect(isValidUUID("123e4567-e89b-12d3-a456-426614174000")).toBe(true);
  });

  test("형식이 틀린 문자열은 거부", () => {
    expect(isValidUUID("abc")).toBe(false);
    expect(isValidUUID("123")).toBe(false);
  });

  test("빈 문자열은 거부", () => {
    expect(isValidUUID("")).toBe(false);
  });

  test("길이는 맞지만 잘못된 문자가 포함되면 거부", () => {
    expect(isValidUUID("123e4567-e89b-12d3-a456-42661417400g")).toBe(false);
  });
});
