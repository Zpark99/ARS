'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface FollowButtonProps {
  targetUserId: string
  initialFollowing: boolean
  initialFollowerCount: number
  isLoggedIn: boolean
}

export default function FollowButton({
  targetUserId,
  initialFollowing,
  initialFollowerCount,
  isLoggedIn,
}: FollowButtonProps) {
  const router = useRouter()
  const [following, setFollowing] = useState(initialFollowing)
  const [followerCount, setFollowerCount] = useState(initialFollowerCount)
  const [loading, setLoading] = useState(false)

  const handleClick = async () => {
    if (!isLoggedIn) {
      router.push('/login')
      return
    }
    if (loading) return

    const prevFollowing = following
    const prevCount = followerCount
    setFollowing(!following)
    setFollowerCount((c) => (!following ? c + 1 : c - 1))
    setLoading(true)

    try {
      const res = await fetch('/api/follows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId }),
      })
      if (res.status === 401) {
        router.push('/login')
        return
      }
      if (!res.ok) throw new Error()
      const json: { following: boolean; followerCount: number } = await res.json()
      setFollowing(json.following)
      setFollowerCount(json.followerCount)
    } catch {
      setFollowing(prevFollowing)
      setFollowerCount(prevCount)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`rounded-full px-5 py-1.5 text-sm font-semibold transition-colors disabled:opacity-50 active:scale-95 ${
        following
          ? 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          : 'bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200'
      }`}
    >
      {loading ? '...' : following ? '팔로잉' : '팔로우'}
    </button>
  )
}
