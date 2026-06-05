'use client'

import { useEffect, useState } from 'react'
import { useDebounce } from '@/hooks/useDebounce'
import AlbumCard from '@/components/AlbumCard'
import type { SearchResult } from '@/types/search'

// /api/search 응답 계약 타입
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

  useEffect(() => {
    const trimmed = debouncedQuery.trim()
    if (!trimmed) {
      setResults([])
      setStatus('idle')
      return
    }

    let cancelled = false

    async function doSearch() {
      setStatus('loading')
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`)
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
  }, [debouncedQuery])

  return (
    <div className="flex flex-col flex-1">
      {/* 검색창 — 헤더(h-14 = 56px) 바로 아래에 sticky */}
      <div className="sticky top-14 z-10 bg-white px-4 py-3 border-b border-gray-100">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="원하는 검색어를 입력하세요"
          className="w-full px-4 py-2.5 rounded-full border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-gray-400 transition-colors bg-white"
          autoComplete="off"
        />
      </div>

      {/* 결과 영역 */}
      <main className="flex-1">
        {status === 'idle' && (
          <p className="text-center text-sm text-gray-400 mt-16 px-4">
            검색어를 입력하면 앨범을 찾아드려요
          </p>
        )}

        {status === 'loading' && (
          <div className="flex justify-center mt-16">
            <div className="w-6 h-6 border-2 border-gray-200 border-t-black rounded-full animate-spin" />
          </div>
        )}

        {status === 'error' && (
          <p className="text-center text-sm text-red-500 mt-16 px-4">{errorMsg}</p>
        )}

        {status === 'done' && results.length === 0 && (
          <p className="text-center text-sm text-gray-400 mt-16 px-4">
            &ldquo;{debouncedQuery.trim()}&rdquo; 검색 결과가 없습니다
          </p>
        )}

        {status === 'done' && results.length > 0 && (
          <ul className="divide-y divide-gray-50">
            {results.map((album) => (
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
