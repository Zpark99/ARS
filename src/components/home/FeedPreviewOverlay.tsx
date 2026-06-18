// components/home/FeedPreviewOverlay.tsx
// 피드 아이템 1차 탭 시 노출되는 미리보기 오버레이. 2차 탭(상세보기)으로 앨범 상세 진입.

import Link from "next/link";
import { RatingStars } from "@/components/ui/RatingStars";

export type FeedPreview = {
  albumId: string;
  title: string;
  artist: string;
  rating: number;
  oneLiner: string;
};

type FeedPreviewOverlayProps = {
  item: FeedPreview;
  onClose: () => void;
};

export function FeedPreviewOverlay({ item, onClose }: FeedPreviewOverlayProps) {
  return (
    <div className="mt-2 rounded-md border border-border bg-surface p-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[15px] font-medium text-text">{item.title}</p>
          <p className="text-[13px] text-text-muted">{item.artist}</p>
        </div>
        <RatingStars value={item.rating} size={14} />
      </div>
      <p className="mt-2 text-[13px] text-text">{item.oneLiner}</p>
      <div className="mt-3 flex justify-end gap-3">
        <button
          onClick={onClose}
          className="text-[13px] text-text-muted transition-colors hover:text-text"
        >
          닫기
        </button>
        <Link
          href={`/album/${item.albumId}`}
          className="text-[13px] font-medium text-accent transition-colors hover:text-accent/90"
        >
          상세보기
        </Link>
      </div>
    </div>
  );
}
