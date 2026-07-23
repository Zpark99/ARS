'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toggleLike, UnauthorizedLikeError } from '@/lib/likes/toggleLike'
import type { LikeTargetType } from '@/lib/validation/like'

interface UseLikeToggleOptions {
  targetType: LikeTargetType
  targetId: string
  initialLiked?: boolean
  initialCount?: number
  // 서버에서 초기값을 미리 못 받는 경우(클라이언트 전용 컴포넌트) 마운트 시 호출
  loadInitial?: () => Promise<{ liked: boolean; count: number }>
}

export function useLikeToggle({
  targetType,
  targetId,
  initialLiked = false,
  initialCount = 0,
  loadInitial,
}: UseLikeToggleOptions) {
  const router = useRouter()
  const [liked, setLiked] = useState(initialLiked)
  const [count, setCount] = useState(initialCount)
  const [ready, setReady] = useState(!loadInitial)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!loadInitial) return
    let cancelled = false
    loadInitial().then((res) => {
      if (cancelled) return
      setLiked(res.liked)
      setCount(res.count)
      setReady(true)
    })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetId])

  const toggle = async () => {
    if (loading || !ready) return

    const prevLiked = liked
    const prevCount = count
    setLiked(!liked)
    setCount(liked ? count - 1 : count + 1)
    setLoading(true)

    try {
      const result = await toggleLike(targetType, targetId)
      setLiked(result.liked)
      setCount(result.count)
    } catch (err) {
      setLiked(prevLiked)
      setCount(prevCount)
      if (err instanceof UnauthorizedLikeError) {
        router.push('/login')
      }
    } finally {
      setLoading(false)
    }
  }

  return { liked, count, loading, ready, toggle }
}
