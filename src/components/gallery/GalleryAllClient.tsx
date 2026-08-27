// components/gallery/GalleryAllClient.tsx
// 컴포넌트스펙_5_갤러리홍보 - 화면 2: 전체 갤러리. 정렬 칩 + 검색 + GalleryCard 그리드.

"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/Input";
import { CategoryTab } from "@/components/ui/CategoryTab";
import { Button } from "@/components/ui/Button";
import { GalleryCard } from "@/components/cards/GalleryCard";
import type { DummyGallery } from "@/lib/dummy/galleryData";

const SORTS = [
  { key: "popular", label: "인기" },
  { key: "abc", label: "가나다" },
  { key: "new", label: "신설" },
] as const;

type SortKey = (typeof SORTS)[number]["key"];

export function GalleryAllClient({ galleries }: { galleries: DummyGallery[] }) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("popular");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const result = galleries.filter((g) => !q || g.name.toLowerCase().includes(q));
    const sorted = [...result];
    if (sort === "abc") sorted.sort((a, b) => a.name.localeCompare(b.name, "ko"));
    else if (sort === "popular") sorted.sort((a, b) => b.subCount - a.subCount);
    // "신설"은 등록일 기준 — 더미엔 등록일이 없어 원래 순서(#88에서 실제 정렬 연결)
    return sorted;
  }, [galleries, query, sort]);

  return (
    <div className="mx-auto flex max-w-[1364px] flex-col gap-5 px-4 py-6 md:px-6">
      <h1 className="text-title text-text">전체 갤러리</h1>

      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          {SORTS.map((s) => (
            <CategoryTab
              key={s.key}
              label={s.label}
              selected={sort === s.key}
              onClick={() => setSort(s.key)}
            />
          ))}
        </div>
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="갤러리 검색 (가수·팀 이름)"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="py-16 text-center text-body text-text-muted">검색 결과가 없어요.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
          {filtered.map((gallery) => (
            <GalleryCard key={gallery.artistId} gallery={gallery} href={`/gallery/${gallery.artistId}`} />
          ))}
        </div>
      )}

      {/* 키셋 커서 페이지네이션은 #88에서 실데이터와 함께 연결 */}
      <Button variant="ghost" disabled className="self-center">
        더 보기
      </Button>
    </div>
  );
}
