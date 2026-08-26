'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import BoardPostCard, { type BoardPost } from './BoardPostCard'
import BoardPostForm, { type PromoSelection } from './BoardPostForm'
import {
  isValidBoardTitle,
  isValidBoardContent,
  requiresArtistAlbum,
  type BoardType,
} from '@/lib/validation/board'

interface BoardClientProps {
  boardType: BoardType
  boardLabel: string
  initialPosts: BoardPost[]
  currentUserId: string | null
  // promo 게시판일 때만 전달 — 글쓰기 폼의 artist 선택 목록
  artists?: { id: string; name: string }[]
}

export default function BoardClient({
  boardType,
  boardLabel,
  initialPosts,
  currentUserId,
  artists,
}: BoardClientProps) {
  const [posts, setPosts] = useState<BoardPost[]>(initialPosts)
  const [isWriting, setIsWriting] = useState(false)

  const supabase = useMemo(() => createClient(), [])

  const handleCreate = async (title: string, content: string, promo?: PromoSelection) => {
    if (!currentUserId || !isValidBoardTitle(title) || !isValidBoardContent(content)) return
    if (requiresArtistAlbum(boardType) && (!promo?.artistId || !promo?.albumId)) return
    const { data, error } = await supabase
      .from('board_posts')
      .insert({
        board_type: boardType,
        user_id: currentUserId,
        title,
        content,
        ...(requiresArtistAlbum(boardType)
          ? { artist_id: promo!.artistId, album_id: promo!.albumId }
          : {}),
      })
      .select()
      .single()
    if (error || !data) return
    setPosts((prev) => [data as BoardPost, ...prev])
    setIsWriting(false)
  }

  const handleUpdate = async (id: string, title: string, content: string): Promise<boolean> => {
    if (!currentUserId || !isValidBoardTitle(title) || !isValidBoardContent(content)) return false
    const { data, error } = await supabase
      .from('board_posts')
      .update({ title, content, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', currentUserId)
      .select()
      .single()
    if (error || !data) return false
    setPosts((prev) => prev.map((p) => (p.id === id ? (data as BoardPost) : p)))
    return true
  }

  const handleDelete = async (id: string) => {
    // 관련 comments/likes 정리는 DB 트리거(cleanup_board_post_related)가 처리 —
    // 클라이언트에서 직접 지우면 RLS(comments_delete_own/likes_delete_own) 때문에
    // 삭제 요청자 소유가 아닌 행은 지워지지 않아 고아 데이터가 남는다.
    const { error } = await supabase.from('board_posts').delete().eq('id', id)
    if (error) return
    setPosts((prev) => prev.filter((p) => p.id !== id))
  }

  return (
    <div className="max-w-lg mx-auto">
      {/* 헤더 영역 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-base font-bold text-gray-900 dark:text-gray-100">{boardLabel}</h1>
        {currentUserId ? (
          <button
            onClick={() => setIsWriting((prev) => !prev)}
            className="text-xs bg-black text-white px-3 py-1.5 rounded-full active:bg-gray-800"
          >
            {isWriting ? '취소' : '글쓰기'}
          </button>
        ) : (
          <Link
            href="/login"
            className="text-xs text-gray-400 dark:text-gray-500 underline underline-offset-2"
          >
            로그인하고 글쓰기
          </Link>
        )}
      </div>

      {/* 글쓰기 폼 */}
      {isWriting && (
        <div className="px-4 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <BoardPostForm
            onSubmit={handleCreate}
            onCancel={() => setIsWriting(false)}
            submitLabel="작성"
            artists={artists}
          />
        </div>
      )}

      {/* 게시글 목록 */}
      {posts.length === 0 ? (
        <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-16">
          아직 게시글이 없어요.
        </p>
      ) : (
        <ul>
          {posts.map((post) => (
            <li key={post.id}>
              <BoardPostCard
                post={post}
                currentUserId={currentUserId}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
