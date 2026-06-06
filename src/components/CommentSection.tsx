'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { CommentRow } from '@/types/album'

const MAX_LENGTH = 500

interface CommentSectionProps {
  albumId: string
  initialComments: CommentRow[]
  currentUserId: string | null
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export default function CommentSection({
  albumId,
  initialComments,
  currentUserId,
}: CommentSectionProps) {
  const router = useRouter()
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleSubmit = async () => {
    if (!content.trim() || submitting) return
    setSubmitting(true)
    setSubmitError('')
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ album_id: albumId, content }),
      })
      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error ?? '코멘트 저장에 실패했습니다')
      }
      setContent('')
      router.refresh()
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : '코멘트 저장에 실패했습니다')
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
      router.refresh()
    } catch {
      // 삭제 실패 시 router.refresh()로 서버 원본 상태 복구
    } finally {
      setDeletingId(null)
    }
  }

  // 내 코멘트 맨 위 고정 (서버 정렬이 created_at desc이므로 filter만으로 순서 유지)
  const sortedComments = currentUserId
    ? [
        ...initialComments.filter((c) => c.user_id === currentUserId),
        ...initialComments.filter((c) => c.user_id !== currentUserId),
      ]
    : initialComments

  return (
    <section className="px-4 py-4">
      <h2 className="text-sm font-semibold text-gray-700 mb-3">코멘트</h2>

      {/* 작성 폼 — 로그인 유저만 */}
      {currentUserId ? (
        <div className="mb-5">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={MAX_LENGTH}
            placeholder="이 앨범에 대한 생각을 남겨보세요..."
            rows={3}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-black placeholder:text-gray-300"
          />
          <div className="flex items-center justify-between mt-1.5">
            <span
              className={`text-xs tabular-nums ${
                content.length >= MAX_LENGTH ? 'text-red-400' : 'text-gray-300'
              }`}
            >
              {content.length}/{MAX_LENGTH}
            </span>
            <button
              onClick={handleSubmit}
              disabled={!content.trim() || submitting}
              className="text-xs font-semibold bg-black text-white px-4 py-1.5 rounded-full disabled:opacity-40 active:scale-95 transition-transform"
            >
              {submitting ? '등록 중...' : '등록'}
            </button>
          </div>
          {submitError && (
            <p className="text-xs text-red-500 mt-1">{submitError}</p>
          )}
        </div>
      ) : (
        <p className="text-xs text-gray-400 mb-5">
          <a
            href="/login"
            className="text-blue-500 underline-offset-2 hover:underline"
          >
            로그인
          </a>
          하면 코멘트를 남길 수 있어요
        </p>
      )}

      {/* 코멘트 목록 */}
      {sortedComments.length === 0 ? (
        <p className="text-sm text-gray-300 text-center py-10">
          아직 코멘트가 없어요
        </p>
      ) : (
        <ul className="space-y-3">
          {sortedComments.map((comment) => {
            const isOwn = comment.user_id === currentUserId
            return (
              <li
                key={comment.id}
                className={
                  isOwn
                    ? 'bg-gray-50 rounded-xl px-3 py-3'
                    : 'border-b border-gray-50 pb-4 last:border-b-0 last:pb-0'
                }
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-gray-700">
                        {isOwn ? '나' : `사용자 ${comment.user_id.slice(0, 8)}`}
                      </span>
                      {isOwn && (
                        <span className="text-xs bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded-full leading-none">
                          내 코멘트
                        </span>
                      )}
                      <span className="text-xs text-gray-300">
                        {formatDate(comment.created_at)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-800 leading-relaxed break-words">
                      {comment.content}
                    </p>
                  </div>
                  {isOwn && (
                    <button
                      onClick={() => handleDelete(comment.id)}
                      disabled={deletingId === comment.id}
                      className="shrink-0 text-xs text-gray-300 hover:text-red-400 active:scale-95 transition-colors disabled:opacity-50"
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
    </section>
  )
}
