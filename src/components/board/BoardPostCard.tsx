'use client'

import { useState } from 'react'
import BoardPostForm from './BoardPostForm'
import BoardCommentSection from './BoardCommentSection'
import BoardPostLikeButton from './BoardPostLikeButton'
import type { BoardType } from '@/lib/validation/board'

export interface BoardPost {
  id: string
  user_id: string
  board_type: BoardType
  title: string
  content: string
  created_at: string
  updated_at: string
  artist?: { name: string } | null
  album?: { title: string } | null
}

interface BoardPostCardProps {
  post: BoardPost
  currentUserId: string | null
  onUpdate: (id: string, title: string, content: string) => Promise<boolean>
  onDelete: (id: string) => Promise<void>
}

function formatDate(iso: string) {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export default function BoardPostCard({ post, currentUserId, onUpdate, onDelete }: BoardPostCardProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  const isOwner = currentUserId === post.user_id
  const isModified = post.updated_at !== post.created_at

  const handleDelete = async () => {
    if (!window.confirm('게시글을 삭제할까요?')) return
    await onDelete(post.id)
  }

  const handleUpdate = async (title: string, content: string) => {
    const ok = await onUpdate(post.id, title, content)
    if (ok) setIsEditing(false)
  }

  return (
    <div className="border-b border-border">
      {/* 목록 행 */}
      <button
        onClick={() => { setIsOpen((prev) => !prev); setIsEditing(false) }}
        className="w-full text-left px-4 py-3 flex items-start justify-between gap-2 active:bg-surface"
      >
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-text truncate">{post.title}</p>
          {(post.artist || post.album) && (
            <p className="text-xs text-text-muted mt-0.5 truncate">
              {post.artist?.name}
              {post.artist && post.album ? ' · ' : ''}
              {post.album?.title}
            </p>
          )}
          <p className="text-xs text-text-muted mt-0.5">
            {currentUserId === post.user_id ? '나' : `사용자 ${post.user_id.slice(0, 8)}`} · {formatDate(post.created_at)}
            {isModified && (
              <span className="ml-1.5 text-text-muted">(수정됨)</span>
            )}
          </p>
        </div>
        <svg
          className={`shrink-0 mt-0.5 text-text-muted transition-transform ${isOpen ? 'rotate-180' : ''}`}
          width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* 펼침 영역 */}
      {isOpen && (
        <div className="px-4 pb-4">
          {isEditing ? (
            <BoardPostForm
              initialTitle={post.title}
              initialContent={post.content}
              onSubmit={handleUpdate}
              onCancel={() => setIsEditing(false)}
              submitLabel="수정 완료"
            />
          ) : (
            <>
              <p className="text-sm text-text whitespace-pre-wrap leading-relaxed">
                {post.content}
              </p>
              <div className="flex items-center justify-between mt-3">
                <BoardPostLikeButton postId={post.id} currentUserId={currentUserId} />
                {isOwner && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => setIsEditing(true)}
                      className="text-xs text-text-muted underline underline-offset-2 active:text-text"
                    >
                      수정
                    </button>
                    <button
                      onClick={handleDelete}
                      className="text-xs text-red-500 underline underline-offset-2 active:text-red-700"
                    >
                      삭제
                    </button>
                  </div>
                )}
              </div>
              <BoardCommentSection postId={post.id} currentUserId={currentUserId} />
            </>
          )}
        </div>
      )}
    </div>
  )
}
