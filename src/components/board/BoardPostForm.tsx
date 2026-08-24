'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  isValidBoardTitle,
  isValidBoardContent,
  MAX_BOARD_TITLE_LENGTH,
  MAX_BOARD_CONTENT_LENGTH,
} from '@/lib/validation/board'

export interface PromoSelection {
  artistId: string
  albumId: string
}

interface BoardPostFormProps {
  initialTitle?: string
  initialContent?: string
  onSubmit: (title: string, content: string, promo?: PromoSelection) => Promise<void>
  onCancel: () => void
  submitLabel?: string
  // promo 게시판일 때만 전달 — 있으면 artist/album 선택이 필수로 렌더링됨
  artists?: { id: string; name: string }[]
}

export default function BoardPostForm({
  initialTitle = '',
  initialContent = '',
  onSubmit,
  onCancel,
  submitLabel = '작성',
  artists,
}: BoardPostFormProps) {
  const [title, setTitle] = useState(initialTitle)
  const [content, setContent] = useState(initialContent)
  const [loading, setLoading] = useState(false)
  const [artistId, setArtistId] = useState('')
  const [albumId, setAlbumId] = useState('')
  const [albums, setAlbums] = useState<{ id: string; title: string }[]>([])

  useEffect(() => {
    if (!artists || !artistId) return
    const artistName = artists.find((a) => a.id === artistId)?.name
    if (!artistName) return
    let cancelled = false
    createClient()
      .from('albums')
      .select('id, title')
      .eq('artist_name', artistName)
      .order('title')
      .then(({ data }) => {
        if (!cancelled) setAlbums(data ?? [])
      })
    return () => {
      cancelled = true
    }
  }, [artistId, artists])

  const isValid =
    isValidBoardTitle(title) &&
    isValidBoardContent(content) &&
    (!artists || (artistId !== '' && albumId !== ''))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid) return
    setLoading(true)
    try {
      await onSubmit(title.trim(), content.trim(), artists ? { artistId, albumId } : undefined)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      {artists && (
        <div className="flex gap-2">
          <select
            value={artistId}
            onChange={(e) => {
              setArtistId(e.target.value)
              setAlbumId('')
              setAlbums([])
            }}
            className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-gray-500"
          >
            <option value="">팀 선택</option>
            {artists.map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
          <select
            value={albumId}
            onChange={(e) => setAlbumId(e.target.value)}
            disabled={!artistId}
            className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-gray-500 disabled:opacity-40"
          >
            <option value="">앨범 선택</option>
            {albums.map((al) => (
              <option key={al.id} value={al.id}>{al.title}</option>
            ))}
          </select>
        </div>
      )}
      <div>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="제목"
          maxLength={MAX_BOARD_TITLE_LENGTH}
          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-gray-500 placeholder:text-gray-400 dark:placeholder:text-gray-600"
        />
        <p className="text-right text-xs text-gray-400 dark:text-gray-500 mt-0.5">
          {title.length}/{MAX_BOARD_TITLE_LENGTH}
        </p>
      </div>

      <div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="내용"
          maxLength={MAX_BOARD_CONTENT_LENGTH}
          rows={6}
          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-gray-500 resize-none placeholder:text-gray-400 dark:placeholder:text-gray-600"
        />
        <p className="text-right text-xs text-gray-400 dark:text-gray-500 mt-0.5">
          {content.length}/{MAX_BOARD_CONTENT_LENGTH}
        </p>
      </div>

      <div className="flex gap-2 justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 active:bg-gray-100 dark:active:bg-gray-700"
        >
          취소
        </button>
        <button
          type="submit"
          disabled={!isValid || loading}
          className="px-4 py-2 text-sm rounded-lg bg-black text-white disabled:opacity-40 active:bg-gray-800"
        >
          {loading ? '처리 중...' : submitLabel}
        </button>
      </div>
    </form>
  )
}
