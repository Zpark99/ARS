'use client'

import { useState } from 'react'
import AlbumCard from '@/components/AlbumCard'

export interface MyLikedAlbum {
  id: string
  mbid: string
  title: string
  artist_name: string
  cover_url: string | null
}

interface Props {
  albums: MyLikedAlbum[]
}

export default function MyLikedAlbumsSection({ albums }: Props) {
  const [open, setOpen] = useState(true)

  return (
    <section>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="w-full flex items-center justify-between px-4 py-2 text-left"
      >
        <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400">좋아요한 앨범</h2>
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
        albums.length === 0 ? (
          <p className="px-4 py-6 text-sm text-gray-400 dark:text-gray-500 text-center">아직 좋아요한 앨범이 없어요.</p>
        ) : (
          <ul className="divide-y divide-gray-100 dark:divide-gray-800">
            {albums.map((album) => (
              <li key={album.id}>
                <AlbumCard
                  album={{
                    mbid: album.mbid,
                    title: album.title,
                    artist_name: album.artist_name,
                    cover_url: album.cover_url ?? '',
                  }}
                />
              </li>
            ))}
          </ul>
        )
      )}
    </section>
  )
}
