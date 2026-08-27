// app/gallery/page.tsx
// 컴포넌트스펙_5_갤러리홍보 - 화면 1: 갤러리 홈 (#70).
// 디시 메인 구조: 개념글 → 인기 갤러리 → 전체보기. 레이아웃 우선(더미 데이터).
// Supabase 연결은 #88(전 화면 데이터 연결)에서 일괄 진행.

import Link from "next/link";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { GalleryRow, type GalleryRowData } from "@/components/cards/GalleryRow";
import { GalleryCard } from "@/components/cards/GalleryCard";
import { DUMMY_GALLERIES } from "@/lib/dummy/galleryData";

const DUMMY_CONCEPT_POSTS: GalleryRowData[] = [
  { id: "1", title: "이번 앨범 컨셉포토 모음", author: "fan1", likeCount: 88, time: "1시간 전", flag: "concept" },
  { id: "2", title: "무대 직캠 풀버전", author: "fan2", likeCount: 64, time: "2시간 전", flag: "concept" },
  { id: "3", title: "인터뷰 번역 정리", author: "fan3", likeCount: 52, time: "3시간 전", flag: "concept" },
  { id: "4", title: "팬사인회 후기", author: "fan4", likeCount: 41, time: "4시간 전", flag: "concept" },
  { id: "5", title: "커버곡 추천 모음", author: "fan5", likeCount: 37, time: "5시간 전", flag: "concept" },
  { id: "6", title: "이번 주 스포티파이 순위", author: "fan6", likeCount: 30, time: "6시간 전", flag: "concept" },
  { id: "7", title: "굿즈 개봉기", author: "fan7", likeCount: 24, time: "7시간 전", flag: "concept" },
  { id: "8", title: "합주 영상 리액션", author: "fan8", likeCount: 19, time: "8시간 전", flag: "concept" },
];

const INFO_LINKS = ["게시물 신고", "공지사항", "신설 갤러리 요청", "이용 규칙", "자주 묻는 질문"];

export default function GalleryHomePage() {
  const half = Math.ceil(DUMMY_CONCEPT_POSTS.length / 2);
  const conceptLeft = DUMMY_CONCEPT_POSTS.slice(0, half);
  const conceptRight = DUMMY_CONCEPT_POSTS.slice(half);

  const ranked = DUMMY_GALLERIES.map((gallery, i) => ({ ...gallery, rank: i + 1 }));
  const rankHalf = Math.ceil(ranked.length / 2);
  const rankLeft = ranked.slice(0, rankHalf);
  const rankRight = ranked.slice(rankHalf);

  const directoryPreview = DUMMY_GALLERIES.slice(0, 10);

  return (
    <div className="mx-auto flex max-w-[1364px] flex-col gap-5 px-4 py-6 md:px-6">
      <section className="flex flex-col gap-3">
        <SectionHeader title="개념글" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-md border border-border bg-surface px-3">
            {conceptLeft.map((post) => (
              <GalleryRow key={post.id} post={post} href="/gallery/all" />
            ))}
          </div>
          <div className="rounded-md border border-border bg-surface px-3">
            {conceptRight.map((post) => (
              <GalleryRow key={post.id} post={post} href="/gallery/all" />
            ))}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-5 md:grid-cols-[972fr_372fr]">
        <div className="flex flex-col gap-3">
          <SectionHeader title="인기 갤러리" href="/gallery/all" />
          <div className="grid grid-cols-1 gap-x-6 gap-y-1 rounded-md border border-border bg-surface p-3 sm:grid-cols-2">
            {[rankLeft, rankRight].map((column, colIdx) => (
              <ul key={colIdx} className="flex flex-col">
                {column.map((gallery) => (
                  <li key={gallery.artistId}>
                    <Link
                      href={`/gallery/${gallery.artistId}`}
                      className="flex items-center gap-3 border-b border-border py-2.5 last:border-b-0"
                    >
                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-caption ${
                          gallery.rank <= 3
                            ? "bg-accent text-accent-foreground"
                            : "bg-surface-raised text-text-muted"
                        }`}
                      >
                        {gallery.rank}
                      </span>
                      <span className="truncate text-body text-text">{gallery.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <SectionHeader title="게시판 안내" />
          <ul className="flex flex-col rounded-md border border-border bg-surface px-3">
            {INFO_LINKS.map((label) => (
              <li key={label} className="border-b border-border py-2.5 text-body text-text-muted last:border-b-0">
                {label}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <SectionHeader title="갤러리 전체보기" href="/gallery/all" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
          {directoryPreview.map((gallery) => (
            <GalleryCard key={gallery.artistId} gallery={gallery} href={`/gallery/${gallery.artistId}`} />
          ))}
        </div>
      </section>
    </div>
  );
}
