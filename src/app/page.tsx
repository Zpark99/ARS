// app/page.tsx
// 화면정의서 01_홈. 월간 아티스트 배너 + 최신 리뷰 피드(2단계 인터랙션).
// 데이터는 P1에서 Supabase reviews/monthly_artists 뷰로 교체. 지금은 목 데이터.

import { HomeFeed } from "@/components/home/HomeFeed";
import type { FeedPreview } from "@/components/home/FeedPreviewOverlay";

const mockFeed: FeedPreview[] = [
  {
    albumId: "1",
    title: "양양",
    artist: "검정치마",
    rating: 5,
    oneLiner: "밤 운전할 때 듣기 좋은 앨범. 사운드 질감이 특히 좋다.",
  },
  {
    albumId: "2",
    title: "Happier Than Ever",
    artist: "Billie Eilish",
    rating: 4,
    oneLiner: "전작보다 차분해진 무드. 후반부 트랙이 백미.",
  },
  {
    albumId: "3",
    title: "Blonde",
    artist: "Frank Ocean",
    rating: 5,
    oneLiner: "들을 때마다 새로운 디테일이 들리는 앨범.",
  },
];

export default function HomePage() {
  return (
    <main className="mx-auto max-w-screen-sm px-4 py-6">
      {/* 월간 아티스트 배너 (P1은 단순 배너) */}
      <section className="mb-6 rounded-lg border border-border bg-surface p-4">
        <p className="text-[13px] text-text-muted">이달의 아티스트</p>
        <p className="mt-1 text-[18px] font-semibold text-text">검정치마</p>
      </section>

      {/* 최신 리뷰 피드 */}
      <h1 className="mb-3 text-[15px] font-semibold text-text">최신 평가</h1>
      <HomeFeed items={mockFeed} />
    </main>
  );
}
