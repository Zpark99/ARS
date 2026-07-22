'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'

const SORT_TABS = [
  { key: 'latest', label: '최신순' },
  { key: 'rating', label: '평점순' },
] as const

interface ArchiveFiltersProps {
  activeSort: string
  query: string
}

export function ArchiveFilters({ activeSort, query }: ArchiveFiltersProps) {
  const router = useRouter()
  const [q, setQ] = useState(query)

  const navigate = (nextSort: string, nextQ: string) => {
    const params = new URLSearchParams()
    if (nextSort !== 'latest') params.set('sort', nextSort)
    if (nextQ.trim()) params.set('q', nextQ.trim())
    const qs = params.toString()
    router.push(qs ? `/archive?${qs}` : '/archive')
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    navigate(activeSort, q)
  }

  return (
    <div className="mb-4 flex flex-col gap-2">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="아티스트 검색"
          className="flex-1 rounded-sm border border-border px-3 py-1.5 text-[13px] text-text placeholder:text-text-muted/60 focus:outline-none focus:ring-1 focus:ring-accent"
        />
        <button
          type="submit"
          className="rounded-sm bg-accent px-3 py-1.5 text-[13px] font-medium text-accent-foreground"
        >
          검색
        </button>
      </form>

      <div className="flex gap-2">
        {SORT_TABS.map((tab) => {
          const isActive = tab.key === activeSort
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => navigate(tab.key, q)}
              className={
                isActive
                  ? 'rounded-sm bg-accent px-3 py-1.5 text-[13px] font-medium text-accent-foreground'
                  : 'rounded-sm px-3 py-1.5 text-[13px] text-text-muted transition-colors hover:text-text'
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
