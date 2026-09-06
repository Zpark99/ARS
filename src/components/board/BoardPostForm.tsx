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
  artistNameText?: string
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
  const [artistMode, setArtistMode] = useState<'search' | 'manual'>('search')
  const [artistInput, setArtistInput] = useState('')
  const [artistManualText, setArtistManualText] = useState('')
  const [albumInput, setAlbumInput] = useState('')
  const [albums, setAlbums] = useState<{ id: string; title: string }[]>([])

  // 타이핑한 텍스트가 목록의 이름과 정확히 일치할 때만 실제 선택으로 간주 (안 골라도 됨)
  const selectedArtist = artists?.find((a) => a.name === artistInput)
  const selectedAlbum = albums.find((al) => al.title === albumInput)
  // artists 목록에 없는 팀은 수기 입력, 앨범은 검색형에서만(연결 안 해도 됨) 선택
  const hasArtist = artistMode === 'search' ? !!selectedArtist : artistManualText.trim().length > 0

  const switchArtistMode = (mode: 'search' | 'manual') => {
    setArtistMode(mode)
    setArtistInput('')
    setArtistManualText('')
    setAlbumInput('')
    setAlbums([])
  }

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

  const isValid =
    isValidBoardTitle(title) && isValidBoardContent(content) && (!artists || hasArtist)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid) return
    setLoading(true)
    try {
      await onSubmit(
        title.trim(),
        content.trim(),
        artists
          ? artistMode === 'search'
            ? { artistId: selectedArtist?.id, albumId: selectedAlbum?.id }
            : { artistNameText: artistManualText.trim() }
          : undefined
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      {artists && (
        <div className="flex flex-col gap-2">
          <div className="flex gap-1 text-xs">
            <button
              type="button"
              onClick={() => switchArtistMode('search')}
              className={`rounded-full px-2 py-1 ${artistMode === 'search' ? 'bg-accent text-accent-foreground' : 'text-text-muted border border-border'}`}
            >
              팀 검색
            </button>
            <button
              type="button"
              onClick={() => switchArtistMode('manual')}
              className={`rounded-full px-2 py-1 ${artistMode === 'manual' ? 'bg-accent text-accent-foreground' : 'text-text-muted border border-border'}`}
            >
              목록에 없는 팀 (직접 입력)
            </button>
          </div>

          {artistMode === 'search' ? (
            <div className="flex gap-2">
              <input
                type="text"
                list="promo-artist-options"
                value={artistInput}
                onChange={(e) => setArtistInput(e.target.value)}
                placeholder="팀 검색 (필수)"
                className="flex-1 border border-border rounded-lg px-3 py-2 text-sm text-text bg-bg focus:outline-none focus:ring-1 focus:ring-accent placeholder:text-text-muted"
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
                    className="flex-1 border border-border rounded-lg px-3 py-2 text-sm text-text bg-bg focus:outline-none focus:ring-1 focus:ring-accent placeholder:text-text-muted"
                  />
                  <datalist id="promo-album-options">
                    {albums.map((al) => (
                      <option key={al.id} value={al.title} />
                    ))}
                  </datalist>
                </>
              )}
            </div>
          ) : (
            <input
              type="text"
              value={artistManualText}
              onChange={(e) => setArtistManualText(e.target.value)}
              placeholder="팀 이름 직접 입력 (필수)"
              className="w-full border border-border rounded-lg px-3 py-2 text-sm text-text bg-bg focus:outline-none focus:ring-1 focus:ring-accent placeholder:text-text-muted"
            />
          )}

          {!hasArtist && (
            <p className="text-xs text-text-muted">
              {artistMode === 'search'
                ? '목록에 있는 팀을 정확히 검색해서 선택하거나, 없는 팀은 직접 입력을 눌러주세요.'
                : '팀 이름을 입력해야 등록할 수 있어요.'}
            </p>
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
          className="w-full border border-border rounded-lg px-3 py-2 text-sm text-text bg-bg focus:outline-none focus:ring-1 focus:ring-accent placeholder:text-text-muted"
        />
        <p className="text-right text-xs text-text-muted mt-0.5">
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
          className="w-full border border-border rounded-lg px-3 py-2 text-sm text-text bg-bg focus:outline-none focus:ring-1 focus:ring-accent resize-none placeholder:text-text-muted"
        />
        <p className="text-right text-xs text-text-muted mt-0.5">
          {content.length}/{MAX_BOARD_CONTENT_LENGTH}
        </p>
      </div>

      <div className="flex gap-2 justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm rounded-lg border border-border text-text-muted active:bg-surface"
        >
          취소
        </button>
        <button
          type="submit"
          disabled={!isValid || loading}
          className="px-4 py-2 text-sm rounded-lg bg-accent text-accent-foreground disabled:opacity-40 active:opacity-80"
        >
          {loading ? '처리 중...' : submitLabel}
        </button>
      </div>
    </form>
  )
}
