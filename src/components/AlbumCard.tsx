'use client'

import Link from 'next/link'
import AlbumCover from '@/components/AlbumCover'
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
      className="flex items-center gap-3 px-4 py-3 hover:bg-surface active:bg-surface transition-colors"
    >
      {/* 정사각 앨범 커버 */}
      <div className="relative w-16 h-16 flex-shrink-0 rounded overflow-hidden">
        <AlbumCover src={cover_url ?? null} alt={`${title} 앨범 커버`} />
      </div>

      {/* 텍스트 정보 */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-text truncate">{title}</p>
        <p className="text-xs text-text-muted mt-0.5 truncate">{artist_name}</p>
        {avgScore !== undefined && (
          <p className="text-xs text-yellow-500 mt-1">
            ★ {avgScore.toFixed(1)}
            {ratingCount !== undefined && (
              <span className="text-text-muted ml-1">({ratingCount}명)</span>
            )}
          </p>
        )}
      </div>
    </Link>
  )
}
