'use client'

import Link from 'next/link'
import type { SearchResult } from '@/types/search'

interface AlbumCardProps {
  album: SearchResult
  avgScore?: number
  ratingCount?: number
}

export default function AlbumCard({ album, avgScore, ratingCount }: AlbumCardProps) {
  const { mbid, title, artist_name, cover_url } = album

  return (
    <Link
      href={`/album/${mbid}`}
      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 active:bg-gray-100 transition-colors"
    >
      {/* 정사각 앨범 커버 */}
      <div className="relative w-16 h-16 flex-shrink-0 rounded bg-gray-100 overflow-hidden">
        {/* 이미지 로드 실패 시 보이는 placeholder (항상 아래에 렌더링) */}
        <div className="absolute inset-0 flex items-center justify-center">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="text-gray-300"
          >
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="3" />
            <line x1="12" y1="2" x2="12" y2="9" />
          </svg>
        </div>
        {/* 커버 이미지 — 로드 성공 시 placeholder 위를 덮음, 실패 시 숨겨져 placeholder 노출 */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={cover_url}
          alt={`${title} 앨범 커버`}
          className="absolute inset-0 w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.style.display = 'none'
          }}
        />
      </div>

      {/* 텍스트 정보 */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate">{title}</p>
        <p className="text-xs text-gray-500 mt-0.5 truncate">{artist_name}</p>
        {avgScore !== undefined && (
          <p className="text-xs text-yellow-500 mt-1">
            ★ {avgScore.toFixed(1)}
            {ratingCount !== undefined && (
              <span className="text-gray-400 ml-1">({ratingCount}명)</span>
            )}
          </p>
        )}
      </div>
    </Link>
  )
}
