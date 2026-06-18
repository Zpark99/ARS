'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import StarRating from './StarRating'

interface RatingSectionProps {
  albumId: string
  initialAvg: number | null
  initialCount: number
  initialMyScore: number | null
  isLoggedIn: boolean
}

export default function RatingSection({
  albumId,
  initialAvg,
  initialCount,
  initialMyScore,
  isLoggedIn,
}: RatingSectionProps) {
  const router = useRouter()
  const [myScore, setMyScore] = useState(initialMyScore ?? 0)
  const [localAvg, setLocalAvg] = useState(initialAvg)
  const [localCount, setLocalCount] = useState(initialCount)
  const [submitting, setSubmitting] = useState(false)
  const [saved, setSaved] = useState(false)
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleRate = async (score: number) => {
    if (submitting) return

    // 낙관적 avg 재계산
    const prevScore = myScore  // 0이면 기존 별점 없음
    const prevSum = (localAvg ?? 0) * localCount
    let newAvg: number
    let newCount: number
    if (prevScore > 0) {
      newAvg = (prevSum - prevScore + score) / localCount
      newCount = localCount
    } else {
      newCount = localCount + 1
      newAvg = (prevSum + score) / newCount
    }

    setMyScore(score)
    setLocalAvg(newAvg)
    setLocalCount(newCount)
    setSubmitting(true)
    setSaved(false)

    try {
      const res = await fetch('/api/ratings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ album_id: albumId, score }),
      })
      if (!res.ok) throw new Error()

      // 저장 완료 피드백 2초
      setSaved(true)
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current)
      savedTimerRef.current = setTimeout(() => setSaved(false), 2000)

      router.refresh()
    } catch {
      // 실패 시 롤백
      setMyScore(prevScore)
      setLocalAvg(initialAvg)
      setLocalCount(initialCount)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="px-4 py-4 border-b border-gray-100 dark:border-gray-800">
      {/* 평균 별점 — 낙관적 업데이트 반영 */}
      <div className="flex items-center gap-2 mb-3">
        <StarRating value={Math.round(localAvg ?? 0)} size="sm" />
        <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
          {localAvg != null ? localAvg.toFixed(1) : '—'}
        </span>
        <span className="text-xs text-gray-400 dark:text-gray-500">({localCount}명)</span>
      </div>

      {/* 내 별점 — 로그인 유저만 표시 */}
      {isLoggedIn ? (
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 dark:text-gray-400 w-14 shrink-0">내 별점</span>
          <StarRating
            value={myScore}
            onChange={submitting ? undefined : handleRate}
            size="md"
          />
          {submitting && (
            <span className="text-xs text-gray-400 dark:text-gray-500">저장 중...</span>
          )}
          {!submitting && saved && (
            <span className="text-xs text-green-500">저장됨 ✓</span>
          )}
        </div>
      ) : (
        <p className="text-xs text-gray-400 dark:text-gray-500">
          <a
            href="/login"
            className="text-blue-500 underline-offset-2 hover:underline"
          >
            로그인
          </a>
          하면 별점을 남길 수 있어요
        </p>
      )}
    </section>
  )
}
