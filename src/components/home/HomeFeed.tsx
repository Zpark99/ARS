// components/home/HomeFeed.tsx
// 화면정의서 01_홈 최신 리뷰 피드. 1차 탭: 같은 줄에 미리보기 오버레이 노출. 2차 탭(상세보기): /album/[id] 이동.
"use client";

import { useState } from "react";
import { FeedPreviewOverlay, type FeedPreview } from "@/components/home/FeedPreviewOverlay";

export function HomeFeed({ items }: { items: FeedPreview[] }) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <ul className="flex flex-col gap-2">
      {items.map((item) => {
        const isOpen = openId === item.albumId;
        return (
          <li key={item.albumId}>
            <button
              onClick={() => setOpenId(isOpen ? null : item.albumId)}
              className="flex w-full items-center justify-between rounded-md border border-border bg-surface px-3 py-2 text-left transition-colors hover:border-text-muted/40"
              aria-expanded={isOpen}
            >
              <span className="text-[14px] text-text">
                {item.artist} · {item.title}
              </span>
              <span className="text-[13px] text-text-muted">{item.rating.toFixed(1)}</span>
            </button>
            {isOpen ? (
              <FeedPreviewOverlay item={item} onClose={() => setOpenId(null)} />
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
