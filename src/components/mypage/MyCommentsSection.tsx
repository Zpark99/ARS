'use client'

import { useState } from 'react'
import Link from 'next/link'
import AlbumCover from '@/components/AlbumCover'

interface AlbumInfo {
  id: string
  mbid: string
  title: string
  artist_name: string
  cover_url: string | null
}

export interface MyComment {
  id: string
  content: string
  created_at: string
  albums: AlbumInfo | null
}

interface Props {
  comments: MyComment[]
  title?: string
}

export default function MyCommentsSection({ comments, title = '내 코멘트' }: Props) {
  const [open, setOpen] = useState(true)

  return (
    <section>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="w-full flex items-center justify-between px-4 py-2 text-left"
      >
        <h2 className="text-sm font-semibold text-text-muted">{title}</h2>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`text-text-muted transition-transform duration-200 ${open ? 'rotate-180' : 'rotate-0'}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && (
        comments.length === 0 ? (
          <p className="px-4 py-6 text-sm text-text-muted text-center">아직 남긴 코멘트가 없어요.</p>
        ) : (
          <ul className="divide-y divide-border">
            {comments.map((c) => {
              if (!c.albums) return null
              return (
                <li key={c.id}>
                  <Link
                    href={`/album/${c.albums.mbid}`}
                    className="flex items-start gap-3 px-4 py-3 hover:bg-surface active:bg-surface"
                  >
                    <div className="w-12 h-12 flex-shrink-0 rounded overflow-hidden bg-surface">
                      <AlbumCover src={c.albums.cover_url} alt={c.albums.title} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-text truncate">{c.albums.title}</p>
                      <p className="text-xs text-text-muted truncate">{c.albums.artist_name}</p>
                      <p className="text-xs text-text-muted mt-1 line-clamp-2 leading-relaxed">{c.content}</p>
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
        )
      )}
    </section>
  )
}
