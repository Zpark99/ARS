'use client'

import { useState } from 'react'
import AlbumCard from '@/components/AlbumCard'

interface AlbumInfo {
  id: string
  mbid: string
  title: string
  artist_name: string
  cover_url: string | null
}

export interface MyRating {
  score: number
  created_at: string
  albums: AlbumInfo | null
}

interface Props {
  ratings: MyRating[]
}

export default function MyRatingsSection({ ratings }: Props) {
  const [open, setOpen] = useState(true)

  return (
    <section>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="w-full flex items-center justify-between px-4 py-2 text-left"
      >
        <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400">내 별점</h2>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : 'rotate-0'}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && (
        ratings.length === 0 ? (
          <p className="px-4 py-6 text-sm text-gray-400 dark:text-gray-500 text-center">아직 별점을 남긴 앨범이 없어요.</p>
        ) : (
          <ul className="divide-y divide-gray-100 dark:divide-gray-800">
            {ratings.map((r) => {
              if (!r.albums) return null
              return (
                <li key={`${r.albums.mbid}-${r.created_at}`}>
                  <AlbumCard
                    album={{
                      mbid: r.albums.mbid,
                      title: r.albums.title,
                      artist_name: r.albums.artist_name,
                      cover_url: r.albums.cover_url ?? '',
                    }}
                    avgScore={r.score}
                  />
                </li>
              )
            })}
          </ul>
        )
      )}
    </section>
  )
}
