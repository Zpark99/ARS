// app/gallery/[artistId]/page.tsx
// 컴포넌트스펙_5_갤러리홍보 - 화면 3: 팀별 갤러리 (#70). 레이아웃 우선(더미 데이터).
// 기존 artist_name 기반 /gallery/[artist] 라우트는 artists 테이블(#74) 스키마에 맞춰
// artistId 기반으로 대체 — 실 게시글 CRUD는 #88에서 연결.

import { notFound } from "next/navigation";
import { TeamGalleryClient } from "@/components/gallery/TeamGalleryClient";
import type { GalleryRowData } from "@/components/cards/GalleryRow";
import { DUMMY_GALLERIES } from "@/lib/dummy/galleryData";
import { createClient } from "@/lib/supabase/server";

function buildDummyPosts(teamName: string): GalleryRowData[] {
  return [
    { id: "1", title: `${teamName} 갤러리 이용 안내`, author: "운영자", likeCount: 12, time: "1일 전", flag: "notice" },
    { id: "2", title: "이번 앨범 컨셉포토 모음", author: "fan1", likeCount: 88, time: "1시간 전", flag: "concept" },
    { id: "3", title: "오늘 무대 직캠", author: "fan2", likeCount: 34, time: "2시간 전" },
    { id: "4", title: "새 인터뷰 번역", author: "fan3", likeCount: 21, time: "3시간 전" },
    { id: "5", title: "잡담 - 컴백 언제쯤", author: "fan4", likeCount: 9, time: "5시간 전", visited: true },
    { id: "6", title: "굿즈 공동구매 정리", author: "fan5", likeCount: 17, time: "8시간 전" },
  ];
}

export default async function TeamGalleryPage({
  params,
}: {
  params: Promise<{ artistId: string }>;
}) {
  const { artistId } = await params;
  const gallery = DUMMY_GALLERIES.find((g) => g.artistId === artistId);
  if (!gallery) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <TeamGalleryClient
      teamName={gallery.name}
      posts={buildDummyPosts(gallery.name)}
      isLoggedIn={!!user}
    />
  );
}
