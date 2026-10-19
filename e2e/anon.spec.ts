import { expect, test, type Page } from "@playwright/test";
import { anonClient, anyAlbum, anyAlbumMbid, longestNameGalleryArtistId, openGalleryArtistId } from "./helpers";

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

test("가짜 식별자 전 라우트 404 유지 — generateMetadata가 404 흐름을 안 깬다 (#196)", async ({ page }) => {
  for (const path of ["/gallery/xxx", "/gallery/xxx/yyy", "/promo/mbid-1", "/qa/mbid-1", "/updates/mbid-1"]) {
    const res = await page.goto(path);
    expect(res?.status(), path).toBe(404);
  }
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

test("푸터: 문의 → /qa 도달, 이용약관·href=# 링크 없음 (#111)", async ({ page }) => {
  await page.goto("/");
  const footer = page.getByRole("contentinfo");
  await expect(footer.locator('a[href="#"]')).toHaveCount(0);
  await expect(footer.getByRole("link", { name: "이용약관" })).toHaveCount(0);
  await footer.getByRole("link", { name: "문의", exact: true }).click();
  await expect(page).toHaveURL(/\/qa$/);
  await expect(page.getByRole("heading", { name: "QA", exact: true })).toBeVisible();
});

test("앨범 허브 커버 박스 높이 > 0 — 1440·375 (#190)", async ({ page }) => {
  const mbid = await anyAlbumMbid();
  for (const width of [1440, 375]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(`/album/${mbid}`);
    // 커버 래퍼 = h1의 부모 바로 앞 형제. 커버 로드 여부와 무관하게(placeholder 포함) 정사각형이어야 한다.
    const box = await page.locator("xpath=//h1/../preceding-sibling::div[1]").boundingBox();
    expect(box, `${width}px 커버 래퍼 없음`).toBeTruthy();
    expect(box!.height, `${width}px 커버 높이 0`).toBeGreaterThan(0);
    expect(Math.abs(box!.height - box!.width), `${width}px 커버가 정사각형 아님`).toBeLessThanOrEqual(1);
  }
});

test("갤러리 375 긴 팀명: 구독 버튼 한 줄 유지 (#190)", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto(`/gallery/${await longestNameGalleryArtistId()}`);
  const button = page.getByRole("button", { name: "구독 준비 중" });
  await expect(button).toBeVisible();
  const box = await button.boundingBox();
  // Button sm = text-body 22px + py-1.5 12px + border 2px = 36px. 2줄이면 58px.
  expect(box!.height, "구독 버튼이 2줄로 꺾임").toBeLessThanOrEqual(40);
});

test("홈 월간 앨범: 부제가 실제 집계 기간과 일치 + 피드가 좌측 컬럼보다 길지 않음 (#192)", async ({ page }) => {
  // DB 상태로 기대값을 정한다 — 최근 30일 평가가 있으면 "최근 30일", 없고 전체 평가가 있으면 "전체 기간" 폴백.
  const sb = anonClient();
  const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const [{ count: recent }, { count: all }] = await Promise.all([
    sb.from("ratings").select("id", { count: "exact", head: true }).gte("created_at", cutoff),
    sb.from("ratings").select("id", { count: "exact", head: true }),
  ]);

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  // 첫 <section> = 월간 앨범(좌) + 실시간 피드(우) 2열 그리드. 직계 자식이 각 섹션 루트.
  const grid = page.locator("main section").first();
  const monthly = grid.locator("> div").nth(0);
  const feed = grid.locator("> div").nth(1);
  await expect(monthly.getByRole("heading", { name: "월간 앨범" })).toBeVisible();
  await expect(monthly.getByText((recent ?? 0) > 0 ? "최근 30일" : "전체 기간", { exact: true })).toBeVisible();
  // 캐러셀이 채워져도 페이지 가로 스크롤은 없어야 한다(fr 트랙 min-content 회귀 방지)
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(1440);
  if ((all ?? 0) > 0) {
    await expect(monthly.locator('a[href^="/album/"]').first()).toBeVisible();
    // 1440: 피드 목록 박스가 좌측 월간 앨범 섹션 아래로 삐져나오지 않는다(안쪽 스크롤)
    const feedList = feed.locator("div.rounded-md").first();
    const [m, f] = await Promise.all([monthly.boundingBox(), feedList.boundingBox()]);
    expect(f, "피드 목록 없음(활동 0건이면 이 검사는 의미 없음)").toBeTruthy();
    expect(f!.y + f!.height, "피드가 좌측 월간 앨범 섹션보다 길다").toBeLessThanOrEqual(m!.y + m!.height + 1);
  }
});

test("메타: 홈 title·og:title·og:image, 앨범 허브 title에 앨범명, 아이콘·OG 이미지 200 (#196)", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle("ARS");
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute("content", "ARS");
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", /\/opengraph-image/);
  await expect(page.locator('link[rel="icon"]')).toHaveAttribute("href", /\/icon/);

  const album = await anyAlbum();
  await page.goto(`/album/${album.mbid}`);
  // 앨범명은 정규식 메타문자를 포함할 수 있어 문자열 prefix로 검사 (template "%s | ARS")
  const title = await page.title();
  expect(title.startsWith(`${album.title} - `), `title="${title}"`).toBe(true);
  expect(title.endsWith(" | ARS"), `title="${title}"`).toBe(true);

  for (const path of ["/icon", "/apple-icon", "/opengraph-image"]) {
    const res = await page.request.get(path);
    expect(res.status(), path).toBe(200);
    expect(res.headers()["content-type"], path).toContain("image/png");
  }
});
