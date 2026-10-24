import { describe, expect, test } from "vitest";
import { authorName } from "./profiles";

describe("authorName", () => {
  const id = "958aaced-3465-4198-86e5-76c645ea65b0";
  test("닉네임 있으면 닉네임", () => expect(authorName(new Map([[id, "박진재"]]), id)).toBe("박진재"));
  test("없으면 user_id 앞 8자 폴백", () => expect(authorName(new Map(), id)).toBe("사용자 958aaced"));
});
