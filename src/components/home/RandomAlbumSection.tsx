'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import AlbumCard from '@/components/AlbumCard'
import type { RandomAlbum } from '@/types/album'

export default function RandomAlbumSection() {
  const [album, setAlbum] = useState<RandomAlbum | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let ignore = false

    async function fetchRandom() {
      try {
        const res = await fetch('/api/random-album')
        if (!res.ok) throw new Error()
        const data: RandomAlbum = await res.json()
        if (!ignore) setAlbum(data)
      } catch {
        if (!ignore) setAlbum(null)
      } finally {
        if (!ignore) setLoading(false)
      }
    }

    fetchRandom()
    return () => {
      ignore = true
    }
  }, [])

  return (
    <section className="px-4">
      <h2 className="text-lg font-bold mb-3 text-gray-900 dark:text-gray-100">오늘의 랜덤 앨범</h2>
      <div className="rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        {loading ? (
          <div className="h-[72px] bg-gray-100 dark:bg-gray-800 animate-pulse" />
        ) : album ? (
          <AlbumCard
            album={{
              mbid: album.mbid,
              title: album.title,
              artist_name: album.artist_name,
              cover_url: album.cover_url ?? '',
            }}
          />
        ) : (
          <p className="px-4 py-6 text-sm text-gray-400 dark:text-gray-500 text-center">앨범을 불러올 수 없어요.</p>
        )}
      </div>
      <Link
        href="/gallery/잔나비"
        className="mt-3 w-full py-2.5 rounded-full bg-black text-white text-sm text-center block active:bg-gray-800"
      >
        갤러리 바로가기
      </Link>
    </section>
  )
}
