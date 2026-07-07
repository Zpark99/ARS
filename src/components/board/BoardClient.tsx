'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import BoardPostCard, { type BoardPost } from './BoardPostCard'
import BoardPostForm from './BoardPostForm'
import { isValidBoardTitle, isValidBoardContent, type BoardType } from '@/lib/validation/board'

interface BoardClientProps {
  boardType: BoardType
  boardLabel: string
  initialPosts: BoardPost[]
  currentUserId: string | null
}

export default function BoardClient({
  boardType,
  boardLabel,
  initialPosts,
  currentUserId,
}: BoardClientProps) {
  const [posts, setPosts] = useState<BoardPost[]>(initialPosts)
  const [isWriting, setIsWriting] = useState(false)

  const supabase = useMemo(() => createClient(), [])

  const handleCreate = async (title: string, content: string) => {
    if (!currentUserId || !isValidBoardTitle(title) || !isValidBoardContent(content)) return
    const { data, error } = await supabase
      .from('board_posts')
      .insert({ board_type: boardType, user_id: currentUserId, title, content })
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
