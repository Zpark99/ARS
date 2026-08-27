// components/home/MonthlyAlbumsSection.tsx
// 컴포넌트스펙_3_홈카드조립 - ① 월간 앨범(좌 972). TOP(★평점)/HOT(♥좋아요) 토글.

"use client";

import { useState } from "react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { CategoryTab } from "@/components/ui/CategoryTab";
import { AlbumCarousel, type AlbumCarouselItem } from "./AlbumCarousel";
import type { Album } from "@/components/cards/AlbumCard";

export type MonthlyAlbum = Album & { likeCount: number };

type Tab = "top" | "hot";

export function MonthlyAlbumsSection({ albums }: { albums: MonthlyAlbum[] }) {
  const [tab, setTab] = useState<Tab>("top");

  const items: AlbumCarouselItem[] = albums.map((album) => ({
    ...album,
    badge:
      tab === "top"
        ? { type: "top", value: album.rating }
        : { type: "hot", value: album.likeCount },
  }));

  return (
    <div className="flex flex-col gap-3">
      <SectionHeader
        title="월간 앨범"
        subtitle="최근 30일"
        action={
          <div className="flex gap-2">
            <CategoryTab label="TOP" selected={tab === "top"} onClick={() => setTab("top")} />
            <CategoryTab label="HOT" selected={tab === "hot"} onClick={() => setTab("hot")} />
          </div>
        }
      />
      <AlbumCarousel items={items} />
    </div>
  );
}
