// 작성자 표시용 닉네임 조회 (#205).
// gallery_posts/board_posts/comments.user_id는 auth.users FK라 PostgREST embed가 안 됨 →
// id를 모아 profiles를 한 번 더 조회한다. FK 추가 + embed 전환은 #206(v1.1).
import type { SupabaseClient } from "@supabase/supabase-js";

/** user_id → nickname. 프로필이 없거나 닉네임이 빈 값이면 Map에 넣지 않는다(→ authorName 폴백). */
export async function fetchNicknameMap(
  supabase: SupabaseClient,
  userIds: string[]
): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  const ids = [...new Set(userIds)];
  if (ids.length === 0) return map;
  const { data, error } = await supabase.from("profiles").select("id, nickname").in("id", ids);
  if (error) console.error("profiles fetch failed:", error);
  for (const p of (data ?? []) as Array<{ id: string; nickname: string | null }>) {
    if (p.nickname) map.set(p.id, p.nickname);
  }
  return map;
}

/** 닉네임이 없으면 기존 표기("사용자 " + user_id 앞 8자)로 폴백. */
export function authorName(map: Map<string, string>, userId: string): string {
  return map.get(userId) ?? `사용자 ${userId.slice(0, 8)}`;
}
