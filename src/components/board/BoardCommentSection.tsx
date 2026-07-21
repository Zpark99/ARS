'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { MAX_COMMENT_LENGTH } from '@/lib/validation/comment'
import type { CommentRow } from '@/types/album'

type CommentLikeInfo = { count: number; liked: boolean }

interface BoardCommentSectionProps {
  postId: string
  currentUserId: string | null
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export default function BoardCommentSection({ postId, currentUserId }: BoardCommentSectionProps) {
  const router = useRouter()
  const [comments, setComments] = useState<CommentRow[]>([])
  const [likesState, setLikesState] = useState<Record<string, CommentLikeInfo>>({})
  const [loaded, setLoaded] = useState(false)
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [likingSet, setLikingSet] = useState<Set<string>>(new Set())
  const [reloadTick, setReloadTick] = useState(0)

  useEffect(() => {
    let cancelled = false

    async function loadComments() {
      const res = await fetch(`/api/comments?targetType=post&targetId=${postId}`)
      if (!res.ok) {
        if (!cancelled) setLoaded(true)
        return
      }
      const json: { comments: CommentRow[] } = await res.json()
      const ids = json.comments.map((c) => c.id)

      const next: Record<string, CommentLikeInfo> = {}
      if (ids.length > 0) {
        const supabase = createClient()
        const { data } = await supabase
          .from('likes')
          .select('target_id, user_id')
          .eq('target_type', 'comment')
          .in('target_id', ids)

        for (const id of ids) {
          const entries = (data ?? []).filter((l) => l.target_id === id)
          next[id] = {
            count: entries.length,
            liked: currentUserId ? entries.some((l) => l.user_id === currentUserId) : false,
          }
        }
      }

      if (cancelled) return
      setComments(json.comments)
      setLikesState(next)
      setLoaded(true)
    }

    loadComments()
    return () => {
      cancelled = true
    }
  }, [postId, currentUserId, reloadTick])

  const handleSubmit = async () => {
    if (!content.trim() || submitting) return
    setSubmitting(true)
    setSubmitError('')
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetType: 'post', targetId: postId, content }),
      })
      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error ?? '댓글 저장에 실패했습니다')
      }
      setContent('')
      setReloadTick((t) => t + 1)
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : '댓글 저장에 실패했습니다')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (deletingId) return
    setDeletingId(id)
    try {
      const res = await fetch(`/api/comments/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      setReloadTick((t) => t + 1)
    } catch {
      // 삭제 실패 시 재조회로 서버 원본 상태 복구
    } finally {
      setDeletingId(null)
    }
  }

  const handleCommentLike = async (commentId: string) => {
    if (likingSet.has(commentId)) return
    if (!currentUserId) {
      router.push('/login')
      return
    }

    const prev = likesState[commentId] ?? { count: 0, liked: false }
    const next = { count: prev.liked ? prev.count - 1 : prev.count + 1, liked: !prev.liked }
    setLikesState((s) => ({ ...s, [commentId]: next }))
    setLikingSet((prev) => new Set(prev).add(commentId))

    try {
      const res = await fetch('/api/likes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetType: 'comment', targetId: commentId }),
      })
      if (res.status === 401) {
        setLikesState((s) => ({ ...s, [commentId]: prev }))
        router.push('/login')
        return
      }
      if (!res.ok) throw new Error()
      const json: { liked: boolean; count: number } = await res.json()
      setLikesState((s) => ({ ...s, [commentId]: { count: json.count, liked: json.liked } }))
    } catch {
      setLikesState((s) => ({ ...s, [commentId]: prev }))
    } finally {
      setLikingSet((prev) => {
        const n = new Set(prev)
        n.delete(commentId)
        return n
      })
    }
  }

  if (!loaded) {
    return <p className="text-xs text-gray-400 dark:text-gray-500 py-3">댓글 불러오는 중...</p>
  }

  const hasMyComment = currentUserId ? comments.some((c) => c.user_id === currentUserId) : false

  const sortedComments = currentUserId
    ? [
        ...comments.filter((c) => c.user_id === currentUserId),
        ...comments.filter((c) => c.user_id !== currentUserId),
      ]
    : comments

  return (
    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
      <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-3">댓글</h3>

      {currentUserId && !hasMyComment ? (
        <div className="mb-4">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={MAX_COMMENT_LENGTH}
            placeholder="댓글을 남겨보세요..."
            rows={2}
            className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 resize-none focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-gray-500 placeholder:text-gray-300 dark:placeholder:text-gray-600"
          />
          <div className="flex items-center justify-between mt-1.5">
            <span
              className={`text-xs tabular-nums ${
                content.length >= MAX_COMMENT_LENGTH ? 'text-red-400' : 'text-gray-300 dark:text-gray-600'
              }`}
            >
              {content.length}/{MAX_COMMENT_LENGTH}
            </span>
            <button
              onClick={handleSubmit}
              disabled={!content.trim() || submitting}
              className="text-xs font-semibold bg-black text-white px-4 py-1.5 rounded-full disabled:opacity-40 active:scale-95 transition-transform"
            >
              {submitting ? '등록 중...' : '등록'}
            </button>
          </div>
          {submitError && <p className="text-xs text-red-500 mt-1">{submitError}</p>}
        </div>
      ) : currentUserId && hasMyComment ? (
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">
          댓글은 글당 하나만 작성할 수 있어요. 수정하려면 삭제 후 다시 작성해주세요.
        </p>
      ) : (
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">
          <a href="/login" className="text-blue-500 underline-offset-2 hover:underline">
            로그인
          </a>
          하면 댓글을 남길 수 있어요
        </p>
      )}

      {sortedComments.length === 0 ? (
        <p className="text-sm text-gray-300 dark:text-gray-600 text-center py-6">아직 댓글이 없어요</p>
      ) : (
        <ul className="space-y-3">
          {sortedComments.map((comment) => {
            const isOwn = comment.user_id === currentUserId
            return (
              <li
                key={comment.id}
                className={
                  isOwn
                    ? 'bg-gray-50 dark:bg-gray-800 rounded-xl px-3 py-3'
                    : 'border-b border-gray-50 dark:border-gray-800 pb-3 last:border-b-0 last:pb-0'
                }
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                        {isOwn ? '나' : `사용자 ${comment.user_id.slice(0, 8)}`}
                      </span>
                      {isOwn && (
                        <span className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-1.5 py-0.5 rounded-full leading-none">
                          내 댓글
                        </span>
                      )}
                      <span className="text-xs text-gray-300 dark:text-gray-600">{formatDate(comment.created_at)}</span>
                    </div>
                    <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed break-words">
                      {comment.content}
                    </p>
                    <div className="mt-2">
                      <button
                        onClick={() => handleCommentLike(comment.id)}
                        disabled={likingSet.has(comment.id)}
                        aria-label={likesState[comment.id]?.liked ? '좋아요 취소' : '좋아요'}
                        className={`flex items-center gap-1 text-xs transition-colors disabled:opacity-50 ${
                          likesState[comment.id]?.liked
                            ? 'text-accent'
                            : 'text-gray-300 hover:text-gray-500 dark:text-gray-600 dark:hover:text-gray-400'
                        }`}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill={likesState[comment.id]?.liked ? 'currentColor' : 'none'}
                          stroke="currentColor"
                          strokeWidth={2}
                          className="h-3.5 w-3.5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                          />
                        </svg>
                        <span>{likesState[comment.id]?.count ?? 0}</span>
                      </button>
                    </div>
                  </div>
                  {isOwn && (
                    <button
                      onClick={() => handleDelete(comment.id)}
                      disabled={deletingId === comment.id}
                      className="shrink-0 text-xs text-gray-300 dark:text-gray-600 hover:text-red-400 active:scale-95 transition-colors disabled:opacity-50"
                    >
                      {deletingId === comment.id ? '삭제 중' : '삭제'}
                    </button>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
