'use client'

import { useState } from 'react'

interface StarRatingProps {
  value: number                    // 현재 별점 0~5, 0.5 단위 (0이면 미선택)
  onChange?: (v: number) => void   // 없으면 읽기 전용 모드
  size?: 'sm' | 'md'
}

function Star({ px, filled }: { px: number; filled: boolean }) {
  return (
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
  )
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
        // 별 1개에서 채워지는 비율 — 0(빈 별), 0.5(반쪽), 1(가득)
        const fillRatio = Math.max(0, Math.min(1, displayValue - (n - 1)))
        return (
          <div key={n} className="group relative" style={{ width: px, height: px }}>
            <div className="transition-transform group-active:scale-95">
              <Star px={px} filled={false} />
              <div
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${fillRatio * 100}%` }}
              >
                <Star px={px} filled={true} />
              </div>
            </div>
            {!isReadOnly && (
              <div className="absolute inset-0 flex">
                {/* 왼쪽 반 = X.5점, 오른쪽 반 = X점 */}
                <button
                  type="button"
                  aria-label={`${n - 0.5}점`}
                  className="w-1/2 h-full cursor-pointer"
                  onClick={() => onChange?.(n - 0.5)}
                  onMouseEnter={() => setHovered(n - 0.5)}
                />
                <button
                  type="button"
                  aria-label={`${n}점`}
                  className="w-1/2 h-full cursor-pointer"
                  onClick={() => onChange?.(n)}
                  onMouseEnter={() => setHovered(n)}
                />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
