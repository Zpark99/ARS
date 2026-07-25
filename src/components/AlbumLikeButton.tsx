'use client'

import { useRouter } from 'next/navigation'
import { useLikeToggle } from '@/hooks/useLikeToggle'

interface AlbumLikeButtonProps {
  albumId: string
  initialLiked: boolean
  initialCount: number
  isLoggedIn: boolean
}

export default function AlbumLikeButton({
  albumId,
  initialLiked,
  initialCount,
  isLoggedIn,
}: AlbumLikeButtonProps) {
  const router = useRouter()
  const { liked, count, loading, toggle } = useLikeToggle({
    targetType: 'album',
    targetId: albumId,
    initialLiked,
    initialCount,
  })

  const handleClick = () => {
    if (!isLoggedIn) {
      router.push('/login')
      return
    }
    toggle()
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      aria-label={liked ? '좋아요 취소' : '좋아요'}
      className={`flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 ${
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
        className="h-4 w-4"
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
