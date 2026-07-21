'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface BoardPostLikeButtonProps {
  postId: string
  currentUserId: string | null
}

export default function BoardPostLikeButton({ postId, currentUserId }: BoardPostLikeButtonProps) {
  const router = useRouter()
  const [liked, setLiked] = useState(false)
  const [count, setCount] = useState(0)
  const [ready, setReady] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let cancelled = false
    const supabase = createClient()

    Promise.all([
      supabase.from('likes').select('id', { count: 'exact', head: true }).eq('target_type', 'post').eq('target_id', postId),
      currentUserId
        ? supabase.from('likes').select('id').eq('user_id', currentUserId).eq('target_type', 'post').eq('target_id', postId).maybeSingle()
        : Promise.resolve({ data: null }),
    ]).then(([countRes, ownRes]) => {
      if (cancelled) return
      setCount(countRes.count ?? 0)
      setLiked(!!ownRes.data)
      setReady(true)
    })

    return () => {
      cancelled = true
    }
  }, [postId, currentUserId])

  const handleClick = async () => {
    if (loading || !ready) return
    if (!currentUserId) {
      router.push('/login')
      return
    }

    const prevLiked = liked
    const prevCount = count
    setLiked(!liked)
    setCount(liked ? count - 1 : count + 1)
    setLoading(true)

    try {
      const res = await fetch('/api/likes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetType: 'post', targetId: postId }),
      })
      if (res.status === 401) {
        setLiked(prevLiked)
        setCount(prevCount)
        router.push('/login')
        return
      }
      if (!res.ok) throw new Error()
      const json: { liked: boolean; count: number } = await res.json()
      setLiked(json.liked)
      setCount(json.count)
    } catch {
      setLiked(prevLiked)
      setCount(prevCount)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading || !ready}
      aria-label={liked ? '좋아요 취소' : '좋아요'}
      className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50 ${
        liked
          ? 'border-accent bg-accent text-accent-foreground'
          : 'border-gray-200 text-gray-500 hover:border-gray-400 dark:border-gray-700 dark:text-gray-400 dark:hover:border-gray-500'
      }`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill={liked ? 'currentColor' : 'none'}
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
      <span>{count}</span>
    </button>
  )
}
