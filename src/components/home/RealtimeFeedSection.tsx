// components/home/RealtimeFeedSection.tsx
// 컴포넌트스펙_3_홈카드조립 - ① 실시간 피드(우 372)

import { SectionHeader } from "@/components/ui/SectionHeader";
import { FeedItem, type FeedItemData } from "@/components/cards/FeedItem";

// md 이상: 목록을 absolute로 띄워 그리드 행 높이에 기여하지 않게 → 피드가 좌측 월간 앨범 컬럼보다
// 길어지지 않고 안쪽 스크롤(#192). min-h-48은 좌측이 빈 상태일 때도 몇 줄은 보이게 하는 하한
// (좌측 캐러셀 높이보다 작게 — 더 크면 피드가 다시 좌측보다 길어짐).
// 모바일(<768)은 세로 스택이라 일반 흐름 그대로.
export function RealtimeFeedSection({ items }: { items: FeedItemData[] }) {
  return (
    <div className="flex flex-col gap-3 md:min-h-0">
      {/* subtitle: 좌측 월간앨범 섹션(부제 있음)과 헤더 높이를 맞춰 캐러셀/피드 시작선을 정렬 */}
      <SectionHeader title="실시간 피드" subtitle=" " />
      {items.length === 0 ? (
        <p className="py-8 text-center text-body text-text-muted">아직 활동이 없어요.</p>
      ) : (
        <div className="md:relative md:min-h-48 md:flex-1">
          <div className="rounded-md border border-border bg-surface px-3 md:absolute md:inset-0 md:overflow-y-auto md:[scrollbar-width:thin]">
            {items.map((item, i) => (
              <FeedItem key={i} {...item} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
