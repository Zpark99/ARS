'use client'

import { useEffect, useState } from 'react'
import { useDebounce } from '@/hooks/useDebounce'
import AlbumCard from '@/components/AlbumCard'
import type { SearchResult } from '@/types/search'

interface SearchApiResponse {
  results?: SearchResult[]
  error?: string
}

type Status = 'idle' | 'loading' | 'done' | 'error'

export default function SearchInterface() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const debouncedQuery = useDebounce(query, 400)

  const trimmedQuery = debouncedQuery.trim()
  const effectiveStatus = trimmedQuery ? status : 'idle'
  const effectiveResults = trimmedQuery ? results : []

  useEffect(() => {
    if (!trimmedQuery) {
      return
    }

    let cancelled = false

    async function doSearch() {
      setStatus('loading')
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(trimmedQuery)}`)
        const data = (await res.json()) as SearchApiResponse
        if (cancelled) return

        if (!res.ok) {
          setErrorMsg(data.error ?? '검색 중 오류가 발생했습니다')
          setStatus('error')
          return
        }

        setErrorMsg('')
        setResults(data.results ?? [])
        setStatus('done')
      } catch {
        if (cancelled) return
        setErrorMsg('네트워크 연결을 확인해주세요')
        setStatus('error')
      }
    }

    doSearch()
    return () => {
      cancelled = true
    }
  }, [trimmedQuery])

  return (
    <div className="flex flex-col flex-1">
      <div className="sticky top-14 z-10 bg-white dark:bg-gray-900 px-4 py-3 border-b border-gray-100 dark:border-gray-800">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="원하는 검색어를 입력하세요"
          className="w-full px-4 py-2.5 rounded-full border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none focus:border-gray-400 dark:focus:border-gray-500 transition-colors bg-white dark:bg-gray-800"
          autoComplete="off"
        />
      </div>

      <main className="flex-1">
        {effectiveStatus === 'idle' && (
          <p className="text-center text-sm text-gray-400 dark:text-gray-500 mt-16 px-4">
            검색어를 입력하면 앨범을 찾아드려요
          </p>
        )}

        {effectiveStatus === 'loading' && (
          <div className="flex justify-center mt-16">
            <div className="w-6 h-6 border-2 border-gray-200 dark:border-gray-700 border-t-black dark:border-t-white rounded-full animate-spin" />
          </div>
        )}

        {effectiveStatus === 'error' && (
          <p className="text-center text-sm text-red-500 mt-16 px-4">{errorMsg}</p>
        )}

        {effectiveStatus === 'done' && effectiveResults.length === 0 && (
          <p className="text-center text-sm text-gray-400 dark:text-gray-500 mt-16 px-4">
            &ldquo;{trimmedQuery}&rdquo; 검색 결과가 없습니다
          </p>
        )}

        {effectiveStatus === 'done' && effectiveResults.length > 0 && (
          <ul className="divide-y divide-gray-50 dark:divide-gray-800">
            {effectiveResults.map((album) => (
              <li key={album.mbid}>
                <AlbumCard album={album} />
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  )
}
