// components/home/AlbumCarousel.tsx
// 컴포넌트스펙_3_홈카드조립 - ①④ 앨범 캐러셀 공용. 웹: 화살표 스크롤 / 모바일: 가로 스와이프.

"use client";

import { useRef } from "react";
import { AlbumCard, type Album, type AlbumCardBadge } from "@/components/cards/AlbumCard";
import { CarouselArrow } from "@/components/ui/CarouselArrow";

const SCROLL_STEP = 200;

export type AlbumCarouselItem = Album & { badge?: AlbumCardBadge };

export function AlbumCarousel({ items }: { items: AlbumCarouselItem[] }) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  if (items.length === 0) {
    return <p className="py-8 text-center text-body text-text-muted">아직 표시할 앨범이 없어요.</p>;
  }

  const scrollBy = (direction: 1 | -1) => {
    scrollerRef.current?.scrollBy({ left: direction * SCROLL_STEP, behavior: "smooth" });
  };

  return (
    <div className="relative">
      <div
        ref={scrollerRef}
        className="flex gap-3 overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((item) => (
          <div key={item.id} className="w-[45vw] shrink-0 sm:w-[180px]">
            <AlbumCard {...item} showRating={false} />
          </div>
        ))}
      </div>
      {/* 카드 줄 위에 겹치는 오버레이 화살표 — 좌우 끝 세로 중앙 고정. 카드 흐름 너비에 영향 없어 헤더 우측 정렬이 카드 끝과 맞음 */}
      <CarouselArrow
        direction="prev"
        onClick={() => scrollBy(-1)}
        className="absolute left-0 top-1/2 z-10 -translate-y-1/2"
      />
      <CarouselArrow
        direction="next"
        onClick={() => scrollBy(1)}
        className="absolute right-0 top-1/2 z-10 -translate-y-1/2"
      />
    </div>
  );
}
