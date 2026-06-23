// components/ranking/RankingTabs.tsx
// 정렬 탭(평점/좋아요/코멘트수) + 기간 필터(월간/전체).
// P1은 "평점순 + 전체"만 동작. 나머지는 disabled로 표시만 하고 전환 로직은 없음.

const SORT_TABS = [
  { key: "rating", label: "평점", disabled: false },
  { key: "likes", label: "좋아요", disabled: true },
  { key: "comments", label: "코멘트수", disabled: true },
] as const;

const PERIOD_TABS = [
  { key: "monthly", label: "월간", disabled: true },
  { key: "all", label: "전체", disabled: false },
] as const;

export function RankingTabs() {
  return (
    <div className="mb-4 flex flex-col gap-2">
      <div className="flex gap-2">
        {SORT_TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            disabled={tab.disabled}
            aria-current={tab.disabled ? undefined : "true"}
            className={
              tab.disabled
                ? "cursor-not-allowed rounded-sm px-3 py-1.5 text-[13px] text-text-muted/40"
                : "rounded-sm bg-accent px-3 py-1.5 text-[13px] font-medium text-accent-foreground"
            }
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        {PERIOD_TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            disabled={tab.disabled}
            aria-current={tab.disabled ? undefined : "true"}
            className={
              tab.disabled
                ? "cursor-not-allowed rounded-sm border border-border px-3 py-1 text-[12px] text-text-muted/40"
                : "rounded-sm border border-accent px-3 py-1 text-[12px] text-accent"
            }
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
