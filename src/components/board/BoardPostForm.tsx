'use client'

import { useState } from 'react'
import {
  isValidBoardTitle,
  isValidBoardContent,
  MAX_BOARD_TITLE_LENGTH,
  MAX_BOARD_CONTENT_LENGTH,
} from '@/lib/validation/board'

interface BoardPostFormProps {
  initialTitle?: string
  initialContent?: string
  onSubmit: (title: string, content: string) => Promise<void>
  onCancel: () => void
  submitLabel?: string
}

export default function BoardPostForm({
  initialTitle = '',
  initialContent = '',
  onSubmit,
  onCancel,
  submitLabel = '작성',
}: BoardPostFormProps) {
  const [title, setTitle] = useState(initialTitle)
  const [content, setContent] = useState(initialContent)
  const [loading, setLoading] = useState(false)

  const isValid = isValidBoardTitle(title) && isValidBoardContent(content)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid) return
    setLoading(true)
    try {
      await onSubmit(title.trim(), content.trim())
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
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
