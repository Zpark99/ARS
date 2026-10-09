import { expect, test } from "@playwright/test";
import { E2E_PREFIX, HAS_TEST_USER, STORAGE_STATE, anonClient, openGalleryArtistId, sweepE2ERows } from "./helpers";

// 로그인 테스트 = 프로덕션 DB 쓰기. test@test.com(비관리자) 세션만 사용, 만든 행은 전부 [E2E] 접두어.
test.skip(!HAS_TEST_USER, ".env.test 없음 — 로그인 테스트 skip");
test.use({ storageState: HAS_TEST_USER ? STORAGE_STATE : undefined });

test.afterAll(async () => {
  expect(await sweepE2ERows(), "정리 후 [E2E] 잔존 행").toBe(0);
});

test("비관리자 로그인: /updates 글쓰기 없음 (#125)", async ({ page }) => {
  await page.goto("/updates");
  // 세션 주입이 실패하면 이 검증은 비로그인과 구분이 안 되므로 로그인 상태부터 확인
  await expect(page.getByRole("button", { name: "로그아웃" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "업데이트" })).toBeVisible();
  await expect(page.getByRole("button", { name: /글쓰기/ })).toHaveCount(0);
});

test("비관리자: 공지·개념글 탭 글쓰기 버튼·CTA 0개, 전체 탭은 글쓰기 가능 (#172)", async ({ page }) => {
  const artistId = await openGalleryArtistId();
  await page.goto(`/gallery/${artistId}`);
  await expect(page.getByRole("button", { name: "로그아웃" })).toBeVisible();

  for (const [tab, emptyText] of [
    ["공지", "아직 공지가 없어요"],
    ["개념글", "아직 개념글이 없어요"],
  ]) {
    const tabButton = page.getByRole("button", { name: tab, exact: true });
    await tabButton.click();
    await expect(tabButton).toHaveAttribute("aria-pressed", "true");
    // 우상단 버튼과 빈 상태 CTA 모두 없어야 함
    await expect(page.getByRole("button", { name: /글쓰기/ })).toHaveCount(0);
    // 글이 없으면 탭에 맞는 빈 상태 문구, 있으면 글 목록 — 데이터와 무관하게 성립
    await expect(
      page.getByText(emptyText).or(page.locator(`a[href^="/gallery/${artistId}/"]`)).first(),
    ).toBeVisible();
    await expect(page.getByText("첫 글의 주인공이 되세요")).toHaveCount(0);
  }

  await page.getByRole("button", { name: "전체", exact: true }).click();
  await page.getByRole("button", { name: "글쓰기", exact: true }).first().click();
  await expect(page.getByPlaceholder("제목")).toBeVisible();
  await expect(page.getByText("공지로 등록돼요")).toHaveCount(0);
});

test("갤러리 글 작성 → 상세 → 댓글 작성 → 댓글 삭제 (#121/#149)", async ({ page }) => {
  const artistId = await openGalleryArtistId();
  await page.goto(`/gallery/${artistId}`);
  await expect(page.getByRole("button", { name: "로그아웃" })).toBeVisible();
  await page.getByRole("button", { name: "글쓰기", exact: true }).first().click();
  await expect(page.getByPlaceholder("제목")).toBeVisible();

  const title = `${E2E_PREFIX} ${Date.now()}`;
  await page.getByPlaceholder("제목").fill(title);
  await page.getByPlaceholder("내용").fill(`${E2E_PREFIX} 자동 테스트 글 — 테스트 종료 시 삭제됩니다`);
  await page.getByRole("button", { name: "작성", exact: true }).click();

  await page.getByRole("link", { name: new RegExp(title.replace(/[[\]]/g, "\\$&")) }).click();
  await expect(page).toHaveURL(new RegExp(`/gallery/${artistId}/[0-9a-f-]{36}$`));
  const postId = page.url().split("/").pop()!;
  await expect(page.getByText(title).first()).toBeVisible();

  const comment = `${E2E_PREFIX} 댓글 ${Date.now()}`;
  await page.getByPlaceholder("댓글을 남겨보세요...").fill(comment);
  await page.getByRole("button", { name: "등록", exact: true }).click();
  await expect(page.getByText(comment)).toBeVisible();

  await page.getByRole("button", { name: "삭제", exact: true }).click();
  await expect(page.getByText(comment)).toHaveCount(0);
  // UI에서 사라진 것만이 아니라 DB에서도 지워졌는지
  await expect
    .poll(async () => {
      const { count } = await anonClient()
        .from("comments")
        .select("id", { count: "exact", head: true })
        .eq("target_type", "gallery_post")
        .eq("target_id", postId);
      return count;
    })
    .toBe(0);
});
