import { expect, test, type Page } from "@playwright/test";
import {
  E2E_PREFIX,
  HAS_TEST_USER,
  STORAGE_STATE,
  anonClient,
  openGalleryArtistId,
  sweepE2ERows,
  testUserClient,
} from "./helpers";

// 제목에 든 [E2E]의 대괄호만 이스케이프
const titleRe = (s: string) => new RegExp(s.replace(/[[\]]/g, "\\$&"));

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

test("비관리자: 공지·개념글 탭 글쓰기 버튼·CTA 0개, 전체 탭은 글쓰기 가능 (#172, #183)", async ({ page }) => {
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
    // 글이 없으면 탭에 맞는 빈 상태 문구(공지도 모두에게 유지, #183), 있으면 글 목록 — 데이터와 무관하게 성립
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

  await page.getByRole("link", { name: titleRe(title) }).click();
  await expect(page).toHaveURL(new RegExp(`/gallery/${artistId}/[0-9a-f-]{36}$`));
  const postId = page.url().split("/").pop()!;
  await expect(page.getByText(title).first()).toBeVisible();

  const comment = `${E2E_PREFIX} 댓글 ${Date.now()}`;
  await page.getByPlaceholder("댓글을 남겨보세요...").fill(comment);
  await page.getByRole("button", { name: "등록", exact: true }).click();
  await expect(page.getByText(comment)).toBeVisible();

  // 본인 글이라 글 삭제 버튼(#64)도 있으므로 댓글 행 안의 삭제로 한정
  await page.getByRole("listitem").filter({ hasText: comment }).getByRole("button", { name: "삭제", exact: true }).click();
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

// 상세에서 본인 글 제목 수정 → 화면 반영 + 새로고침(DB) 반영까지 확인. 수정된 제목을 돌려줌
async function editOwnTitle(page: Page, title: string): Promise<string> {
  const edited = `${title} 수정`;
  await page.getByRole("group", { name: "내 글 관리" }).getByRole("button", { name: "수정" }).click();
  await expect(page.getByPlaceholder("제목")).toHaveValue(title);
  await page.getByPlaceholder("제목").fill(edited);
  await page.getByRole("button", { name: "수정 완료" }).click();
  await expect(page.getByRole("heading", { name: edited, exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("heading", { name: edited, exact: true })).toBeVisible();
  return edited;
}

async function deleteOwnPost(page: Page) {
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("group", { name: "내 글 관리" }).getByRole("button", { name: "삭제" }).click();
}

test("갤러리 본인 글: 작성 → 제목 수정 → 댓글 단 채로 삭제 → 목록·댓글 정리 (#64/021)", async ({ page }) => {
  const artistId = await openGalleryArtistId();
  await page.goto(`/gallery/${artistId}`);
  await expect(page.getByRole("button", { name: "로그아웃" })).toBeVisible();
  await page.getByRole("button", { name: "글쓰기", exact: true }).first().click();
  const title = `${E2E_PREFIX} ${Date.now()}`;
  await page.getByPlaceholder("제목").fill(title);
  await page.getByPlaceholder("내용").fill(`${E2E_PREFIX} 수정·삭제 테스트 글`);
  await page.getByRole("button", { name: "작성", exact: true }).click();
  await page.getByRole("link", { name: titleRe(title) }).click();
  await expect(page).toHaveURL(new RegExp(`/gallery/${artistId}/[0-9a-f-]{36}$`));
  const postId = page.url().split("/").pop()!;

  const edited = await editOwnTitle(page, title);

  // 댓글이 달린 채로 글을 지워도 댓글이 남지 않아야 함 — 앱은 글만 지우고 정리는 021 트리거 몫
  const comment = `${E2E_PREFIX} 댓글 ${Date.now()}`;
  await page.getByPlaceholder("댓글을 남겨보세요...").fill(comment);
  await page.getByRole("button", { name: "등록", exact: true }).click();
  // getByText는 저장 응답 전에도(입력창 값으로) 통과해 글 삭제와 경합한 적이 있음 → 목록 행으로 저장 완료를 기다림
  await expect(page.getByRole("listitem").filter({ hasText: comment })).toBeVisible();
  const countComments = async () =>
    (
      await anonClient()
        .from("comments")
        .select("id", { count: "exact", head: true })
        .eq("target_type", "gallery_post")
        .eq("target_id", postId)
    ).count;
  // 삭제 직전 DB에 댓글이 실제로 있어야 "트리거가 지웠다"는 검증이 성립
  expect(await countComments()).toBe(1);

  await deleteOwnPost(page);
  await expect(page).toHaveURL(new RegExp(`/gallery/${artistId}$`));
  await expect(page.getByRole("link", { name: titleRe(edited) })).toHaveCount(0);
  await expect
    .poll(async () => {
      const { count: posts } = await anonClient()
        .from("gallery_posts")
        .select("id", { count: "exact", head: true })
        .eq("id", postId);
      return { posts, comments: await countComments() };
    })
    .toEqual({ posts: 0, comments: 0 });
});

test("QA 본인 글: 작성 → 제목 수정 → 삭제 → 목록에서 사라짐 (#178)", async ({ page }) => {
  await page.goto("/qa");
  await expect(page.getByRole("button", { name: "로그아웃" })).toBeVisible();
  await page.getByRole("button", { name: "글쓰기", exact: true }).click();
  const title = `${E2E_PREFIX} ${Date.now()}`;
  await page.getByPlaceholder("제목").fill(title);
  await page.getByPlaceholder("내용").fill(`${E2E_PREFIX} 수정·삭제 테스트 글`);
  await page.getByRole("button", { name: "작성", exact: true }).click();
  await page.getByRole("link", { name: titleRe(title) }).click();
  await expect(page).toHaveURL(/\/qa\/[0-9a-f-]{36}$/);
  const postId = page.url().split("/").pop()!;

  const edited = await editOwnTitle(page, title);

  await deleteOwnPost(page);
  await expect(page).toHaveURL(/\/qa$/);
  await expect(page.getByRole("link", { name: titleRe(edited) })).toHaveCount(0);
  await expect
    .poll(async () => {
      const { count } = await anonClient().from("board_posts").select("id", { count: "exact", head: true }).eq("id", postId);
      return count;
    })
    .toBe(0);
});

test("남의 글엔 수정·삭제 버튼 0개 — 갤러리·board (#64/#178)", async ({ page }) => {
  const { client, userId } = await testUserClient();
  await client.auth.signOut({ scope: "local" });
  // 실제 존재하는 남의 글(더미 id 금지 — #49/#96). board 경로는 board_type과 같음(/qa·/promo·/updates)
  const [{ data: gallery }, { data: board }] = await Promise.all([
    anonClient().from("gallery_posts").select("id, artist_id, title").neq("user_id", userId).limit(1).single(),
    anonClient().from("board_posts").select("id, board_type, title").neq("user_id", userId).limit(1).single(),
  ]);
  if (!gallery || !board) throw new Error("남의 글이 DB에 없음");

  for (const [url, title] of [
    [`/gallery/${gallery.artist_id}/${gallery.id}`, gallery.title],
    [`/${board.board_type}/${board.id}`, board.title],
  ]) {
    await page.goto(url);
    await expect(page.getByRole("button", { name: "로그아웃" })).toBeVisible();
    // 상세가 실제로 렌더된 상태에서 버튼이 없어야 의미가 있음
    await expect(page.getByRole("heading", { name: title, exact: true })).toBeVisible();
    await expect(page.getByRole("group", { name: "내 글 관리" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "수정", exact: true })).toHaveCount(0);
  }
});

test("프로필 갤러리 글 → 글 상세 도달 (#180, 이름 링크 404 재발 방지)", async ({ page }) => {
  const { client, userId } = await testUserClient();
  const { data: artist } = await client.from("artists").select("id, name").eq("is_gallery_open", true).limit(1).single();
  const title = `${E2E_PREFIX} 프로필 링크 ${Date.now()}`;
  const { data: post, error } = await client
    .from("gallery_posts")
    .insert({ user_id: userId, artist_id: artist!.id, artist_name: artist!.name, title, content: `${E2E_PREFIX} x` })
    .select("id")
    .single();
  await client.auth.signOut({ scope: "local" });
  if (error || !post) throw error;

  await page.goto(`/profile/${userId}`);
  await page.getByRole("link", { name: titleRe(title) }).click();
  await expect(page).toHaveURL(`/gallery/${artist!.id}/${post.id}`);
  await expect(page.getByRole("heading", { name: title, exact: true })).toBeVisible();
});
