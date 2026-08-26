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
  artistId?: string
  albumId?: string
}

interface BoardPostFormProps {
  initialTitle?: string
  initialContent?: string
  onSubmit: (title: string, content: string, promo?: PromoSelection) => Promise<void>
  onCancel: () => void
  submitLabel?: string
  // promo 게시판일 때만 전달 — 있으면 팀/앨범 검색 콤보박스가 (선택으로) 노출됨
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
  const [artistInput, setArtistInput] = useState('')
  const [albumInput, setAlbumInput] = useState('')
  const [albums, setAlbums] = useState<{ id: string; title: string }[]>([])

  // 타이핑한 텍스트가 목록의 이름과 정확히 일치할 때만 실제 선택으로 간주 (안 골라도 됨)
  const selectedArtist = artists?.find((a) => a.name === artistInput)
  const selectedAlbum = albums.find((al) => al.title === albumInput)

  useEffect(() => {
    if (!selectedArtist) return
    let cancelled = false
    createClient()
      .from('albums')
      .select('id, title')
      .eq('artist_name', selectedArtist.name)
      .order('title')
      .then(({ data }) => {
        if (!cancelled) setAlbums(data ?? [])
      })
    return () => {
      cancelled = true
    }
  }, [selectedArtist])

  const isValid = isValidBoardTitle(title) && isValidBoardContent(content)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid) return
    setLoading(true)
    try {
      await onSubmit(
        title.trim(),
        content.trim(),
        artists
          ? { artistId: selectedArtist?.id, albumId: selectedAlbum?.id }
          : undefined
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      {artists && (
        <div className="flex gap-2">
          <input
            type="text"
            list="promo-artist-options"
            value={artistInput}
            onChange={(e) => setArtistInput(e.target.value)}
            placeholder="팀 검색 (선택)"
            className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-gray-500 placeholder:text-gray-400 dark:placeholder:text-gray-600"
          />
          <datalist id="promo-artist-options">
            {artists.map((a) => (
              <option key={a.id} value={a.name} />
            ))}
          </datalist>
          {selectedArtist && (
            <>
              <input
                type="text"
                list="promo-album-options"
                value={albumInput}
                onChange={(e) => setAlbumInput(e.target.value)}
                placeholder="앨범 검색 (선택)"
                className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-gray-500 placeholder:text-gray-400 dark:placeholder:text-gray-600"
              />
              <datalist id="promo-album-options">
                {albums.map((al) => (
                  <option key={al.id} value={al.title} />
                ))}
              </datalist>
            </>
          )}
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
