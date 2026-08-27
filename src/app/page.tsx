// app/page.tsx
// 컴포넌트스펙_3_홈카드조립. 홈 4섹션 콘텐츠 허브 (#68).
// 1단계: 레이아웃 확정 (더미 데이터). 2단계: Supabase 실데이터 연결 예정 — 아래 DUMMY_* 전부 교체 대상.

import { MonthlyAlbumsSection, type MonthlyAlbum } from "@/components/home/MonthlyAlbumsSection";
import { RealtimeFeedSection } from "@/components/home/RealtimeFeedSection";
import { GalleryHotSection } from "@/components/home/GalleryHotSection";
import { PromoSection } from "@/components/home/PromoSection";
import { AlbumHubReviewSection, type ReviewedAlbum } from "@/components/home/AlbumHubReviewSection";
import { RecentReleasesSection } from "@/components/home/RecentReleasesSection";
import type { FeedItemData } from "@/components/cards/FeedItem";
import type { GalleryRowData } from "@/components/cards/GalleryRow";
import type { PromoCardData } from "@/components/cards/PromoCard";
import type { AlbumCarouselItem } from "@/components/home/AlbumCarousel";

const DUMMY_MONTHLY_ALBUMS: MonthlyAlbum[] = [
  { id: "1", mbid: "mbid-1", title: "Ballad Pop", artist: "검정치마", rating: 4.2, coverUrl: null, likeCount: 128 },
  { id: "2", mbid: "mbid-2", title: "Beautiful Future", artist: "잔나비", rating: 4.6, coverUrl: null, likeCount: 96 },
  { id: "3", mbid: "mbid-3", title: "New Wave", artist: "혁오", rating: 3.9, coverUrl: null, likeCount: 64 },
  { id: "4", mbid: "mbid-4", title: "Midnight", artist: "정승환", rating: 4.0, coverUrl: null, likeCount: 55 },
  { id: "5", mbid: "mbid-5", title: "Sunset Drive", artist: "적재", rating: 4.4, coverUrl: null, likeCount: 41 },
];

const DUMMY_FEED: FeedItemData[] = [
  { actorName: "hong", action: "검정치마 앨범에 평가를 남겼어요", time: "5분 전", href: "#" },
  { actorName: "jane", action: "잔나비 갤러리에 글을 남겼어요", time: "12분 전", href: "#" },
  { actorName: "min", action: "혁오 앨범을 좋아요했어요", time: "30분 전", href: "#" },
];

const DUMMY_GALLERY_POSTS: GalleryRowData[] = [
  { id: "1", title: "공지 - 갤러리 이용 안내", author: "운영자", likeCount: 12, time: "1시간 전", flag: "notice" },
  { id: "2", title: "컨셉포토 떴다", author: "fan1", likeCount: 34, time: "2시간 전", flag: "concept" },
  { id: "3", title: "오늘 무대 인생 직캠", author: "fan2", likeCount: 21, time: "3시간 전" },
  { id: "4", title: "이번 주 스포티파이 순위", author: "fan3", likeCount: 15, time: "4시간 전" },
  { id: "5", title: "굿즈 공동구매 정리", author: "fan4", likeCount: 9, time: "6시간 전", visited: true },
];

const DUMMY_PROMOS: PromoCardData[] = [
  { id: "1", title: "신곡 홍보 부탁드립니다", team: "잔나비", thumbnailUrl: null, likeCount: 8, commentCount: 2, time: "10분 전" },
  { id: "2", title: "팀 연결 없는 홍보글", team: null, thumbnailUrl: null, likeCount: 1, commentCount: 0, time: "1일 전" },
];

const DUMMY_REVIEWED_ALBUMS: ReviewedAlbum[] = [
  { id: "1", mbid: "mbid-1", title: "Ballad Pop", artist: "검정치마", rating: 4.2, coverUrl: null, reviewText: "가사가 좋고 프로듀싱이 안정적이에요." },
  { id: "2", mbid: "mbid-2", title: "Beautiful Future", artist: "잔나비", rating: 4.6, coverUrl: null, reviewText: "밴드 사운드가 이번에 특히 좋았어요." },
  { id: "3", mbid: "mbid-3", title: "New Wave", artist: "혁오", rating: 3.9, coverUrl: null, reviewText: "실험적인 트랙이 많아 호불호가 갈릴 듯." },
  { id: "4", mbid: "mbid-4", title: "Midnight", artist: "정승환", rating: 4.0, coverUrl: null, reviewText: "발라드 팬이라면 놓치면 아쉬운 앨범." },
];

const DUMMY_RECENT_RELEASES: AlbumCarouselItem[] = [
  { id: "5", mbid: "mbid-5", title: "Sunset Drive", artist: "적재", rating: 4.4, coverUrl: null },
  { id: "6", mbid: "mbid-6", title: "New Single", artist: "10CM", rating: 4.1, coverUrl: null },
  { id: "7", mbid: "mbid-7", title: "First EP", artist: "볼빨간사춘기", rating: 3.8, coverUrl: null },
  { id: "8", mbid: "mbid-8", title: "Reissue", artist: "자우림", rating: 4.5, coverUrl: null },
  { id: "9", mbid: "mbid-9", title: "Late Night", artist: "실리카겔", rating: 4.3, coverUrl: null },
  { id: "10", mbid: "mbid-10", title: "Home Recording", artist: "박재범", rating: 4.0, coverUrl: null },
  { id: "11", mbid: "mbid-11", title: "Winter Story", artist: "아이유", rating: 4.7, coverUrl: null },
  { id: "12", mbid: "mbid-12", title: "Debut", artist: "데이식스", rating: 4.2, coverUrl: null },
];

export default function HomePage() {
  return (
    <div className="mx-auto flex max-w-[1364px] flex-col gap-5 px-4 py-6 md:px-6">
      <section className="grid grid-cols-1 gap-5 md:grid-cols-[972fr_372fr]">
        <MonthlyAlbumsSection albums={DUMMY_MONTHLY_ALBUMS} />
        <RealtimeFeedSection items={DUMMY_FEED} />
      </section>

      <section className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <GalleryHotSection posts={DUMMY_GALLERY_POSTS} />
        <PromoSection promos={DUMMY_PROMOS} />
      </section>

      <AlbumHubReviewSection albums={DUMMY_REVIEWED_ALBUMS} />

      <RecentReleasesSection albums={DUMMY_RECENT_RELEASES} />
    </div>
  );
}
