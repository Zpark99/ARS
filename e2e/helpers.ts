import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Supabase URL/anon key는 .env.local, 테스트 계정 자격증명은 .env.test(둘 다 git 미추적)
for (const file of [".env.local", ".env.test"]) {
  try {
    process.loadEnvFile(file);
  } catch {
    // 파일 없으면 건너뜀 — .env.test가 없으면 로그인 테스트만 skip
  }
}

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
const EMAIL = process.env.E2E_TEST_EMAIL ?? "";
const PASSWORD = process.env.E2E_TEST_PASSWORD ?? "";

export const HAS_TEST_USER = Boolean(EMAIL && PASSWORD);
export const STORAGE_STATE = "e2e/.auth/user.json";
export const E2E_PREFIX = "[E2E]";

export function anonClient(): SupabaseClient {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) throw new Error(".env.local의 Supabase 환경변수가 없습니다");
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: false } });
}

// 테스트 계정으로 로그인한 클라이언트. 관리자 계정이면 즉시 중단 — E2E는 관리자 계정을 쓰지 않는다.
export async function testUserClient(): Promise<{ client: SupabaseClient; userId: string }> {
  const client = anonClient();
  const { data, error } = await client.auth.signInWithPassword({ email: EMAIL, password: PASSWORD });
  if (error || !data.user) throw new Error(`테스트 계정 로그인 실패: ${error?.message}`);
  const { data: profile } = await client.from("profiles").select("is_admin").eq("id", data.user.id).single();
  if (profile?.is_admin) throw new Error("E2E 계정이 관리자입니다 — 중단");
  return { client, userId: data.user.id };
}

// 테스트 계정이 만든 [E2E] 갤러리 글과 그 글의 댓글·좋아요를 지우고, 남은 행 수를 반환한다.
// gallery_posts엔 삭제 정리 트리거가 없어(#148) 댓글·좋아요를 먼저 지운다.
export async function sweepE2ERows(): Promise<number> {
  if (!HAS_TEST_USER) return 0;
  const { client, userId } = await testUserClient();
  const { data: posts, error } = await client
    .from("gallery_posts")
    .select("id")
    .eq("user_id", userId)
    .like("title", `${E2E_PREFIX}%`);
  if (error) throw error;
  const ids = (posts ?? []).map((p) => p.id);
  if (ids.length) {
    await client.from("comments").delete().eq("target_type", "gallery_post").in("target_id", ids);
    await client.from("likes").delete().eq("target_type", "gallery_post").in("target_id", ids);
    await client.from("gallery_posts").delete().in("id", ids);
  }
  // 글에 안 묶인 [E2E] 댓글(글 생성 후 중단 등)까지 정리
  await client.from("comments").delete().eq("user_id", userId).like("content", `${E2E_PREFIX}%`);

  const [{ count: postLeft }, { count: commentLeft }] = await Promise.all([
    client.from("gallery_posts").select("id", { count: "exact", head: true }).like("title", `${E2E_PREFIX}%`),
    client.from("comments").select("id", { count: "exact", head: true }).like("content", `${E2E_PREFIX}%`),
  ]);
  // local: 이 정리용 세션만 폐기. 기본값(global)이면 브라우저에 주입한 세션까지 같이 죽는다
  await client.auth.signOut({ scope: "local" });
  return (postLeft ?? 0) + (commentLeft ?? 0);
}
