'use client'

import { useState } from 'react'
import Link from 'next/link'

export interface MyGalleryPost {
  id: string
  artist_name: string
  title: string
  created_at: string
}

interface Props {
  posts: MyGalleryPost[]
}

function formatDate(iso: string) {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}`
}

export default function MyGalleryPostsSection({ posts }: Props) {
  const [open, setOpen] = useState(true)

  return (
    <section>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="w-full flex items-center justify-between px-4 py-2 text-left"
      >
        <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400">내 갤러리 글</h2>
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
        posts.length === 0 ? (
          <p className="px-4 py-6 text-sm text-gray-400 dark:text-gray-500 text-center">아직 작성한 갤러리 글이 없어요.</p>
        ) : (
          <ul className="divide-y divide-gray-100 dark:divide-gray-800">
            {posts.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/gallery/${encodeURIComponent(p.artist_name)}`}
                  className="flex flex-col px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 active:bg-gray-100 dark:active:bg-gray-800"
                >
                  <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">
                    {p.artist_name} 갤러리 · {formatDate(p.created_at)}
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{p.title}</p>
                </Link>
              </li>
            ))}
          </ul>
        )
      )}
    </section>
  )
}
