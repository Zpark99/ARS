// app/archive/page.tsx
// 컴포넌트스펙_4_아카이브. 앨범 카탈로그(허브 입구) (#69).
// 1단계: 레이아웃 확정 (더미 데이터). Supabase 연결은 #88(전 화면 데이터 연결)에서 일괄 진행.

import { ArchiveClient, type ArchiveAlbum } from "@/components/archive/ArchiveClient";
import { createClient } from "@/lib/supabase/server";

const DUMMY_ALBUMS: ArchiveAlbum[] = [
  { id: "1", mbid: "mbid-1", title: "Ballad Pop", artist: "검정치마", rating: 4.2, coverUrl: null, genre: "록", year: 2026, likeCount: 128 },
  { id: "2", mbid: "mbid-2", title: "Beautiful Future", artist: "잔나비", rating: 4.6, coverUrl: null, genre: "록", year: 2026, likeCount: 96 },
  { id: "3", mbid: "mbid-3", title: "New Wave", artist: "혁오", rating: 3.9, coverUrl: null, genre: "일렉트로닉", year: 2025, likeCount: 64 },
  { id: "4", mbid: "mbid-4", title: "Midnight", artist: "정승환", rating: 4.0, coverUrl: null, genre: "발라드", year: 2025, likeCount: 55 },
  { id: "5", mbid: "mbid-5", title: "Sunset Drive", artist: "적재", rating: 4.4, coverUrl: null, genre: "발라드", year: 2026, likeCount: 41 },
  { id: "6", mbid: "mbid-6", title: "New Single", artist: "10CM", rating: 4.1, coverUrl: null, genre: "록", year: 2024, likeCount: 88 },
  { id: "7", mbid: "mbid-7", title: "First EP", artist: "볼빨간사춘기", rating: 3.8, coverUrl: null, genre: "발라드", year: 2024, likeCount: 33 },
  { id: "8", mbid: "mbid-8", title: "Reissue", artist: "자우림", rating: 4.5, coverUrl: null, genre: "록", year: 2023, likeCount: 70 },
  { id: "9", mbid: "mbid-9", title: "Late Night", artist: "실리카겔", rating: 4.3, coverUrl: null, genre: "일렉트로닉", year: 2025, likeCount: 59 },
  { id: "10", mbid: "mbid-10", title: "Home Recording", artist: "박재범", rating: 4.0, coverUrl: null, genre: "힙합", year: 2025, likeCount: 112 },
  { id: "11", mbid: "mbid-11", title: "Winter Story", artist: "아이유", rating: 4.7, coverUrl: null, genre: "발라드", year: 2026, likeCount: 201 },
  { id: "12", mbid: "mbid-12", title: "Debut", artist: "데이식스", rating: 4.2, coverUrl: null, genre: "록", year: 2024, likeCount: 77 },
  { id: "13", mbid: "mbid-13", title: "Flow State", artist: "지코", rating: 4.1, coverUrl: null, genre: "힙합", year: 2026, likeCount: 65 },
  { id: "14", mbid: "mbid-14", title: "Soul Talk", artist: "크러쉬", rating: 4.3, coverUrl: null, genre: "알앤비", year: 2025, likeCount: 84 },
  { id: "15", mbid: "mbid-15", title: "City Pop", artist: "선우정아", rating: 4.4, coverUrl: null, genre: "알앤비", year: 2023, likeCount: 47 },
  { id: "16", mbid: "mbid-16", title: "Rewind", artist: "넬", rating: 4.5, coverUrl: null, genre: "록", year: 2023, likeCount: 39 },
  { id: "17", mbid: "mbid-17", title: "Neon", artist: "새소년", rating: 3.7, coverUrl: null, genre: "일렉트로닉", year: 2024, likeCount: 28 },
  { id: "18", mbid: "mbid-18", title: "Analog", artist: "잔나비", rating: 4.0, coverUrl: null, genre: "록", year: 2023, likeCount: 52 },
];

export default async function ArchivePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return <ArchiveClient albums={DUMMY_ALBUMS} isLoggedIn={!!user} />;
}
