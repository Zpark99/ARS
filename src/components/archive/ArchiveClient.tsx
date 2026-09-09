// components/archive/ArchiveClient.tsx
// 컴포넌트스펙_4_아카이브 - 1. 필터바(검색+칩) + AlbumGrid 조립, 2. 검색 0 빈 상태.
// 재사용: Input(search) · CategoryTab(정렬) · Button. 장르/발매연도는 native select(드롭다운).

"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { CategoryTab } from "@/components/ui/CategoryTab";
import { Button } from "@/components/ui/Button";
import { AlbumGrid } from "@/components/album/AlbumGrid";
import { AlbumRequestModal } from "./AlbumRequestModal";
import type { Album } from "@/components/cards/AlbumCard";

export type ArchiveAlbum = Album & { genre: string; year: number; likeCount: number };

const GENRES = ["전체", "발라드", "록", "힙합", "알앤비", "일렉트로닉"];
const YEARS = ["전체", "2026", "2025", "2024", "2023"];
const SORTS = [
  { key: "latest", label: "최신순" },
  { key: "rating", label: "평점순" },
  { key: "popular", label: "인기순" },
] as const;

type SortKey = (typeof SORTS)[number]["key"];

export function ArchiveClient({
  albums,
  isLoggedIn,
}: {
  albums: ArchiveAlbum[];
  isLoggedIn: boolean;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [genre, setGenre] = useState("전체");
  const [year, setYear] = useState("전체");
  const [sort, setSort] = useState<SortKey>("latest");
  const [requestOpen, setRequestOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const result = albums.filter((album) => {
      const matchesQuery =
        !q || album.title.toLowerCase().includes(q) || album.artist.toLowerCase().includes(q);
      const matchesGenre = genre === "전체" || album.genre === genre;
      const matchesYear = year === "전체" || String(album.year) === year;
      return matchesQuery && matchesGenre && matchesYear;
    });

    const sorted = [...result];
    if (sort === "rating") sorted.sort((a, b) => b.rating - a.rating);
    else if (sort === "popular") sorted.sort((a, b) => b.likeCount - a.likeCount);
    else sorted.sort((a, b) => b.year - a.year);

    return sorted;
  }, [albums, query, genre, year, sort]);

  const handleRequestClick = () => {
    if (isLoggedIn) setRequestOpen(true);
    else router.push("/login");
  };

  return (
    <div className="mx-auto flex max-w-[1364px] flex-col gap-5 px-4 py-6 md:px-6">
      <h1 className="text-title text-text">아카이브</h1>

      <div className="flex flex-col gap-3">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="앨범·가수 검색"
        />
        <div className="flex items-center gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <select
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            className="h-9 shrink-0 rounded-md border border-border bg-surface px-2 text-body text-text"
          >
            {GENRES.map((g) => (
              <option key={g} value={g}>
                {g === "전체" ? "장르 전체" : g}
              </option>
            ))}
          </select>
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="h-9 shrink-0 rounded-md border border-border bg-surface px-2 text-body text-text"
          >
            {YEARS.map((y) => (
              <option key={y} value={y}>
                {y === "전체" ? "발매연도 전체" : y}
              </option>
            ))}
          </select>
          <span className="mx-1 h-5 w-px shrink-0 bg-border" aria-hidden="true" />
          {SORTS.map((s) => (
            <CategoryTab
              key={s.key}
              label={s.label}
              selected={sort === s.key}
              onClick={() => setSort(s.key)}
            />
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <p className="text-body text-text-muted">그런 앨범이 없어요</p>
          <Button onClick={handleRequestClick}>등록 요청하기 🔒</Button>
        </div>
      ) : (
        <AlbumGrid albums={filtered} />
      )}

      {requestOpen ? <AlbumRequestModal onClose={() => setRequestOpen(false)} /> : null}
    </div>
  );
}
