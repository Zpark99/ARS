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
  // artists 목록에 없는 팀은 수기 입력
  const hasArtist = artistMode === 'search' ? !!selectedArtist : artistManualText.trim().length > 0
  // 앨범 검색은 팀 이름(검색형은 선택된 artist, 수기형은 입력한 텍스트)만 있으면 두 모드 다 가능.
  // artists 테이블에 없는 팀(#101 매칭 갭)도 albums.artist_name이 일치하면 앨범을 연결할 수 있어야
  // 홍보 탭 연동이 된다 — artist_id가 없다고 앨범 연결까지 막으면 안 됨(#116 후속).
  const albumSearchName = artistMode === 'search' ? selectedArtist?.name : (hasArtist ? artistManualText.trim() : undefined)

  const switchArtistMode = (mode: 'search' | 'manual') => {
    setArtistMode(mode)
    setArtistInput('')
    setArtistManualText('')
    setAlbumInput('')
    setAlbums([])
  }

  useEffect(() => {
    if (!albumSearchName) {
      setAlbums([])
      setAlbumInput('')
      return
    }
    let cancelled = false
    // 수기 입력은 타이핑마다 바뀌니 살짝 디바운스, 검색형은 선택 즉시 확정된 값이라 바로 조회.
    const delay = artistMode === 'manual' ? 400 : 0
    const timer = setTimeout(() => {
      createClient()
        .from('albums')
        .select('id, title')
        .eq('artist_name', albumSearchName)
        .order('title')
        .then(({ data }) => {
          if (!cancelled) setAlbums(data ?? [])
        })
    }, delay)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [albumSearchName, artistMode])

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
            : { artistNameText: artistManualText.trim(), albumId: selectedAlbum?.id }
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
            <div className="flex gap-2">
              <input
                type="text"
                value={artistManualText}
                onChange={(e) => setArtistManualText(e.target.value)}
                placeholder="팀 이름 직접 입력 (필수)"
                className="flex-1 border border-border rounded-lg px-3 py-2 text-sm text-text bg-bg focus:outline-none focus:ring-1 focus:ring-accent placeholder:text-text-muted"
              />
              {hasArtist && (
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
