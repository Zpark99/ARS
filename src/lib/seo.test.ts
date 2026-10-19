// generateMetadata 조회가 가짜 식별자(mbid-1류)에서 DB를 안 때리고 {}를 돌려주는지(#196).
// 404 판정은 page의 notFound가 담당하므로 여기선 "조회 자체를 안 한다"만 본다.
import { beforeEach, describe, expect, test, vi } from "vitest";

const createClient = vi.fn();
vi.mock("@/lib/supabase/server", () => ({ createClient: () => createClient() }));

import { albumMetadata, boardPostMetadata, galleryMetadata, galleryPostMetadata } from "./seo";

const REAL = "b10fa515-48d2-47df-8906-9c46479efd82";

beforeEach(() => createClient.mockReset());

describe("가짜 식별자 → DB 조회 없이 {}", () => {
  test("albumMetadata('mbid-1')", async () => {
    expect(await albumMetadata("mbid-1")).toEqual({});
    expect(createClient).not.toHaveBeenCalled();
  });
  test("galleryMetadata('xxx')", async () => {
    expect(await galleryMetadata("xxx")).toEqual({});
    expect(createClient).not.toHaveBeenCalled();
  });
  test("galleryPostMetadata — 둘 중 하나만 가짜여도", async () => {
    expect(await galleryPostMetadata(REAL, "post-1")).toEqual({});
    expect(await galleryPostMetadata("artist-1", REAL)).toEqual({});
    expect(createClient).not.toHaveBeenCalled();
  });
  test("boardPostMetadata('mbid-1')", async () => {
    expect(await boardPostMetadata("mbid-1", "promo")).toEqual({});
    expect(createClient).not.toHaveBeenCalled();
  });
});

describe("실제 UUID → 제목 조회", () => {
  function clientReturning(row: Record<string, string> | null) {
    const chain = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: row }),
    };
    createClient.mockResolvedValue(chain);
    return chain;
  }

  test("앨범: '{앨범명} - {아티스트}'", async () => {
    clientReturning({ title: "201", artist_name: "검정치마" });
    expect(await albumMetadata(REAL)).toEqual({ title: "201 - 검정치마" });
    expect(createClient).toHaveBeenCalledTimes(1);
  });
  test("없는 앨범: {} (404는 page가)", async () => {
    clientReturning(null);
    expect(await albumMetadata(REAL)).toEqual({});
  });
  test("board 글: board_type 필터 포함", async () => {
    const chain = clientReturning({ title: "공지" });
    expect(await boardPostMetadata(REAL, "qa")).toEqual({ title: "공지" });
    expect(chain.eq).toHaveBeenCalledWith("board_type", "qa");
  });
});
