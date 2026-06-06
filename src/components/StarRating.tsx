'use client'

import { useState } from 'react'

interface StarRatingProps {
  value: number                    // 현재 별점 (0이면 미선택)
  onChange?: (v: number) => void   // 없으면 읽기 전용 모드
  size?: 'sm' | 'md'
}

export default function StarRating({
  value,
  onChange,
  size = 'md',
}: StarRatingProps) {
  const [hovered, setHovered] = useState(0)
  const isReadOnly = !onChange

  // 입력 모드: hover 중이면 hover 값 우선, 아니면 선택 값
  // 읽기 전용: value 그대로 표시
  const displayValue = isReadOnly ? value : hovered || value
  const px = size === 'sm' ? 16 : 22

  return (
    <div
      className="flex gap-0.5"
      onMouseLeave={() => !isReadOnly && setHovered(0)}
    >
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = displayValue >= n
        return (
          <button
            key={n}
            type="button"
            disabled={isReadOnly}
            onClick={() => onChange?.(n)}
            onMouseEnter={() => !isReadOnly && setHovered(n)}
            aria-label={`${n}점`}
            className={
              isReadOnly
                ? 'cursor-default'
                : 'cursor-pointer transition-transform hover:scale-110 active:scale-95'
            }
          >
            <svg
              width={px}
              height={px}
              viewBox="0 0 24 24"
              fill={filled ? '#FACC15' : 'none'}
              stroke={filled ? '#FACC15' : '#D1D5DB'}
              strokeWidth="1.5"
              strokeLinejoin="round"
            >
              <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
            </svg>
          </button>
        )
      })}
    </div>
  )
}
