'use client'

import { useState } from 'react'
import Link from 'next/link'
import { formatDate } from '@/lib/date'

export interface MyGalleryPost {
  id: string
  artist_id: string | null
  artist_name: string
  title: string
  created_at: string
}

interface Props {
  posts: MyGalleryPost[]
  title?: string
}

export default function MyGalleryPostsSection({ posts, title = '내 갤러리 글' }: Props) {
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
        posts.length === 0 ? (
          <p className="px-4 py-6 text-sm text-text-muted text-center">아직 작성한 갤러리 글이 없어요.</p>
        ) : (
          <ul className="divide-y divide-border">
            {posts.map((p) => {
              const body = (
                <>
                  <p className="text-xs text-text-muted mb-0.5">
                    {p.artist_name} 갤러리 · {formatDate(p.created_at, 'dot')}
                  </p>
                  <p className="text-sm font-medium text-text truncate">{p.title}</p>
                </>
              )
              // 갤러리 라우트는 artist UUID 기준(#109 가드) — 이름으로 링크하면 404였음(#180).
              // artist_id 없는 옛 글은 갈 곳이 없으니 링크 없이 표시
              return (
                <li key={p.id}>
                  {p.artist_id ? (
                    <Link
                      href={`/gallery/${p.artist_id}/${p.id}`}
                      className="flex flex-col px-4 py-3 hover:bg-surface active:bg-surface"
                    >
                      {body}
                    </Link>
                  ) : (
                    <div className="flex flex-col px-4 py-3">{body}</div>
                  )}
                </li>
              )
            })}
          </ul>
        )
      )}
    </section>
  )
}
