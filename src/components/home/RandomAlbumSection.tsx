'use client'

import { useState, useEffect, useCallback } from 'react'
import AlbumCard from '@/components/AlbumCard'
import type { RandomAlbum } from '@/types/album'

export default function RandomAlbumSection() {
  const [album, setAlbum] = useState<RandomAlbum | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchRandom = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/random-album')
      if (!res.ok) throw new Error()
      const data: RandomAlbum = await res.json()
      setAlbum(data)
    } catch {
      setAlbum(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRandom()
  }, [fetchRandom])

  return (
    <section className="px-4">
      <h2 className="text-lg font-bold mb-3">오늘의 랜덤 앨범</h2>
      <div className="rounded-xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="h-[72px] bg-gray-100 animate-pulse" />
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
          <p className="px-4 py-6 text-sm text-gray-400 text-center">앨범을 불러올 수 없어요.</p>
        )}
      </div>
      <button
        onClick={fetchRandom}
        disabled={loading}
        className="mt-3 w-full py-2.5 rounded-full border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 active:bg-gray-100 transition-colors disabled:opacity-50"
      >
        다른 앨범 보기
      </button>
    </section>
  )
}
