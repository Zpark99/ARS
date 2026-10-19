// brand.ts(아이콘·OG용 복제 값)가 globals.css 토큰과 어긋나지 않는지(#196).
// 둘 중 하나만 바꾸면 여기서 깨진다.
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";
import { BRAND } from "./brand";

const css = readFileSync(resolve(__dirname, "../app/globals.css"), "utf8");
const token = (name: string) => css.match(new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{3,8})`))?.[1];

describe("BRAND ↔ globals.css 토큰", () => {
  test("accent", () => expect(BRAND.accent).toBe(token("accent")));
  test("bg", () => expect(BRAND.bg).toBe(token("bg")));
  test("text-muted", () => expect(BRAND.textMuted).toBe(token("text-muted")));
});
