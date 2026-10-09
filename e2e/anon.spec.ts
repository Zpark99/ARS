import { expect, test, type Page } from "@playwright/test";
import { openGalleryArtistId } from "./helpers";

const UUID = "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}";

// 화면에 보이는 링크 중 pattern에 맞는 첫 href. 더미 식별자가 아니라 실제 UUID 경로인지까지 본다(#49/#96).
async function firstVisibleHref(page: Page, pattern: RegExp) {
  const hrefs = await page
    .locator("a[href]:visible")
    .evaluateAll((els) => els.map((el) => el.getAttribute("href") ?? ""));
  const href = hrefs.find((h) => pattern.test(h));
  expect(href, `${pattern} 에 맞는 링크가 홈에 없음`).toBeTruthy();
  return href!;
}

test("홈 → 앨범 카드 → 앨범 허브 도달", async ({ page }) => {
  await page.goto("/");
  const href = await firstVisibleHref(page, new RegExp(`^/album/${UUID}$`));
  await page.locator(`a[href="${href}"]:visible`).first().click();
  await expect(page).toHaveURL(href);
  await expect(page.getByRole("tab", { name: "반응", exact: true })).toBeVisible();
  await expect(page.getByRole("tab", { name: "정보", exact: true })).toBeVisible();
});

test("홈 게시글 → 상세 도달 (#146)", async ({ page }) => {
  await page.goto("/");
  const href = await firstVisibleHref(page, new RegExp(`^/(promo/${UUID}|gallery/${UUID}/${UUID})$`));
  await page.locator(`a[href="${href}"]:visible`).first().click();
  await expect(page).toHaveURL(href);
  await expect(page.getByRole("heading", { name: "댓글", exact: true })).toBeVisible();
});

test("/album/mbid-1 → 404 (#109 더미 식별자 가드)", async ({ page }) => {
  const res = await page.goto("/album/mbid-1");
  expect(res?.status()).toBe(404);
});

test("비로그인: /updates 글쓰기 없음 · 갤러리 글쓰기는 로그인으로 (#125)", async ({ page }) => {
  await page.goto("/updates");
  await expect(page.getByRole("heading", { name: "업데이트" })).toBeVisible();
  await expect(page.getByRole("button", { name: /글쓰기/ })).toHaveCount(0);

  await page.goto(`/gallery/${await openGalleryArtistId()}`);
  // 비로그인 글쓰기는 폼 대신 로그인으로 보낸다
  await page.getByRole("button", { name: "글쓰기 🔒" }).first().click();
  await expect(page).toHaveURL(/\/login$/);
});
