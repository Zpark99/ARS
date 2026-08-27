// components/gallery/TeamGalleryClient.tsx
// 컴포넌트스펙_5_갤러리홍보 - 화면 3: 팀별 갤러리. 필터 칩 + 검색 + GalleryRow 목록.
// 글쓰기는 레이아웃만(폼은 #88에서 연결) — 지금은 비활성 버튼.

"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/Input";
import { CategoryTab } from "@/components/ui/CategoryTab";
import { Button } from "@/components/ui/Button";
import { SubscribeButton } from "@/components/cards/SubscribeButton";
import { GalleryRow, type GalleryRowData } from "@/components/cards/GalleryRow";

const FILTERS = [
  { key: "all", label: "전체" },
  { key: "concept", label: "개념글" },
  { key: "notice", label: "공지" },
] as const;

type FilterKey = (typeof FILTERS)[number]["key"];

export function TeamGalleryClient({
  teamName,
  posts,
  isLoggedIn,
}: {
  teamName: string;
  posts: GalleryRowData[];
  isLoggedIn: boolean;
}) {
  const [filter, setFilter] = useState<FilterKey>("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return posts.filter((post) => {
      const matchesFilter = filter === "all" || post.flag === filter;
      const matchesQuery = !q || post.title.toLowerCase().includes(q);
      return matchesFilter && matchesQuery;
    });
  }, [posts, filter, query]);

  return (
    <div className="mx-auto flex max-w-[1364px] flex-col gap-5 px-4 py-6 md:px-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-title text-text">{teamName} 갤러리</h1>
        <div className="flex items-center gap-2">
          <SubscribeButton isLoggedIn={isLoggedIn} />
          <Button variant="ghost" size="sm">
            글쓰기 🔒
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {FILTERS.map((f) => (
            <CategoryTab
              key={f.key}
              label={f.label}
              selected={filter === f.key}
              onClick={() => setFilter(f.key)}
            />
          ))}
        </div>
        <div className="sm:w-64">
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="글 검색" />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <p className="text-body text-text-muted">첫 글의 주인공이 되세요</p>
          <Button variant="ghost">글쓰기 🔒</Button>
        </div>
      ) : (
        <div className="rounded-md border border-border bg-surface px-3">
          {filtered.map((post) => (
            <GalleryRow key={post.id} post={post} href="#" />
          ))}
        </div>
      )}

      {/* 키셋 커서 페이지네이션은 #88에서 실데이터와 함께 연결 */}
      {filtered.length > 0 ? (
        <Button variant="ghost" disabled className="self-center">
          더 보기
        </Button>
      ) : null}
    </div>
  );
}
