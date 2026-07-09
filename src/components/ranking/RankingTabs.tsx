'use client'

import { useRouter } from 'next/navigation'

const SORT_TABS = [
  { key: 'rating', label: '평점', disabled: false },
  { key: 'likes', label: '좋아요', disabled: false },
  { key: 'comments', label: '코멘트수', disabled: false },
] as const

const PERIOD_TABS = [
  { key: 'monthly', label: '월간', disabled: true },
  { key: 'all', label: '전체' },
] as const

interface RankingTabsProps {
  activeSort: string
}

export function RankingTabs({ activeSort }: RankingTabsProps) {
  const router = useRouter()

  return (
    <div className="mb-4 flex flex-col gap-2">
      <div className="flex gap-2">
        {SORT_TABS.map((tab) => {
          const isDisabled = 'disabled' in tab && tab.disabled
          const isActive = !isDisabled && tab.key === activeSort
          return (
            <button
              key={tab.key}
              type="button"
              disabled={isDisabled}
              onClick={isDisabled ? undefined : () => router.push(`/ranking?sort=${tab.key}`)}
              className={
                isDisabled
                  ? 'cursor-not-allowed rounded-sm px-3 py-1.5 text-[13px] text-text-muted/40'
                  : isActive
                  ? 'rounded-sm bg-accent px-3 py-1.5 text-[13px] font-medium text-accent-foreground'
                  : 'rounded-sm px-3 py-1.5 text-[13px] text-text-muted transition-colors hover:text-text'
              }
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      <div className="flex gap-2">
        {PERIOD_TABS.map((tab) => {
          const isDisabled = 'disabled' in tab && tab.disabled
          return (
            <button
              key={tab.key}
              type="button"
              disabled={isDisabled}
              className={
                isDisabled
                  ? 'cursor-not-allowed rounded-sm border border-border px-3 py-1 text-[12px] text-text-muted/40'
                  : 'rounded-sm border border-accent px-3 py-1 text-[12px] text-accent'
              }
            >
              {tab.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
