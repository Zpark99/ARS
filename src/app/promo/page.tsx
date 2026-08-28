// app/promo/page.tsx
// 컴포넌트스펙_5_갤러리홍보 - 화면 4: 홍보게시판 (#70). 레이아웃 우선(더미 데이터).
// 기존 BoardClient(qa/updates와 공유하던 아코디언 UI)에서 분리해 PromoCard 그리드로 재구성.
// 글쓰기 폼은 레이아웃만 구현(더미 제출). 실데이터·팀 검색형 선택 연동은 #88에서 진행.

import { PromoClient } from "@/components/promo/PromoClient";
import { createClient } from "@/lib/supabase/server";
import type { PromoCardData } from "@/components/cards/PromoCard";

const DUMMY_PROMOS: PromoCardData[] = [
  { id: "1", title: "신곡 홍보 부탁드립니다", team: "잔나비", thumbnailUrl: null, likeCount: 24, commentCount: 5, time: "10분 전" },
  { id: "2", title: "이번 앨범 커버 어떤가요", team: "검정치마", thumbnailUrl: null, likeCount: 18, commentCount: 3, time: "40분 전" },
  { id: "3", title: "팀 연결 없는 홍보글", team: null, thumbnailUrl: null, likeCount: 6, commentCount: 1, time: "2시간 전" },
  { id: "4", title: "쇼케이스 일정 공유해요", team: "혁오", thumbnailUrl: null, likeCount: 31, commentCount: 8, time: "3시간 전" },
  { id: "5", title: "티저 영상 올라왔어요", team: "적재", thumbnailUrl: null, likeCount: 15, commentCount: 2, time: "5시간 전" },
  { id: "6", title: "라디오 출연 소식", team: "10CM", thumbnailUrl: null, likeCount: 22, commentCount: 4, time: "8시간 전" },
];

export default async function PromoPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return <PromoClient promos={DUMMY_PROMOS} isLoggedIn={!!user} />;
}
