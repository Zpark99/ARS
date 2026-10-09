import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { createServerClient } from "@supabase/ssr";
import {
  HAS_TEST_USER,
  STORAGE_STATE,
  SUPABASE_ANON_KEY,
  SUPABASE_URL,
  sweepE2ERows,
} from "./helpers";

// 구글 OAuth는 UI 자동화가 안 되므로, 테스트 계정(email/password)으로 로그인한 세션 쿠키를
// 앱과 같은 @supabase/ssr 포맷으로 만들어 storageState로 주입한다.
export default async function globalSetup() {
  if (!HAS_TEST_USER) {
    console.warn("[e2e] .env.test(E2E_TEST_EMAIL/E2E_TEST_PASSWORD) 없음 — 로그인 테스트는 skip");
    return;
  }

  // 이전 실행이 중간에 죽어 남긴 [E2E] 행부터 정리
  await sweepE2ERows();

  const cookies: { name: string; value: string }[] = [];
  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => cookies,
      setAll: (toSet) => {
        for (const { name, value } of toSet) {
          const i = cookies.findIndex((c) => c.name === name);
          if (i >= 0) cookies.splice(i, 1);
          if (value) cookies.push({ name, value });
        }
      },
    },
  });
  const { data, error } = await supabase.auth.signInWithPassword({
    email: process.env.E2E_TEST_EMAIL!,
    password: process.env.E2E_TEST_PASSWORD!,
  });
  if (error || !data.user) throw new Error(`테스트 계정 로그인 실패: ${error?.message}`);
  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", data.user.id).single();
  if (profile?.is_admin) throw new Error("E2E 계정이 관리자입니다 — 중단");
  if (!cookies.length) throw new Error("세션 쿠키가 생성되지 않았습니다");

  mkdirSync(dirname(STORAGE_STATE), { recursive: true });
  writeFileSync(
    STORAGE_STATE,
    JSON.stringify({
      cookies: cookies.map((c) => ({
        name: c.name,
        value: c.value,
        domain: "localhost",
        path: "/",
        expires: -1,
        httpOnly: false,
        secure: false,
        sameSite: "Lax",
      })),
      origins: [],
    }),
  );
}
