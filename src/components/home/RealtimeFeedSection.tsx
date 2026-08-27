// components/home/RealtimeFeedSection.tsx
// 컴포넌트스펙_3_홈카드조립 - ① 실시간 피드(우 372)

import { SectionHeader } from "@/components/ui/SectionHeader";
import { FeedItem, type FeedItemData } from "@/components/cards/FeedItem";

export function RealtimeFeedSection({ items }: { items: FeedItemData[] }) {
  return (
    <div className="flex flex-col gap-3">
      {/* subtitle: 좌측 월간앨범 섹션(부제 있음)과 헤더 높이를 맞춰 캐러셀/피드 시작선을 정렬 */}
      <SectionHeader title="실시간 피드" subtitle=" " />
      {items.length === 0 ? (
        <p className="py-8 text-center text-body text-text-muted">아직 활동이 없어요.</p>
      ) : (
        <div className="rounded-md border border-border bg-surface px-3">
          {items.map((item, i) => (
            <FeedItem key={i} {...item} />
          ))}
        </div>
      )}
    </div>
  );
}
