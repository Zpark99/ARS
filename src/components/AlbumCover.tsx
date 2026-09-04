'use client'

import { useState } from 'react'

// onError 이벤트 핸들러가 필요하므로 클라이언트 컴포넌트로 분리
// (서버 컴포넌트에서는 이벤트 핸들러 사용 불가)
interface AlbumCoverProps {
  src: string | null
  alt: string
  /** 부모가 크기를 정하므로 기본은 h-full w-full. 필요 시 hover 트랜지션 등 img에 추가할 클래스 */
  imgClassName?: string
}

export default function AlbumCover({ src, alt, imgClassName = '' }: AlbumCoverProps) {
  const [failed, setFailed] = useState(false)

  return (
    <div className="relative h-full w-full bg-surface overflow-hidden">
      {/* 이미지 로드 실패 또는 cover_url 없을 때 보이는 placeholder */}
      <div className="absolute inset-0 flex items-center justify-center">
        <svg
          width="64"
          height="64"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="text-text-muted"
        >
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="3" />
          <line x1="12" y1="2" x2="12" y2="9" />
        </svg>
      </div>
      {src && !failed && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          // 서버 렌더된 <img>는 리액트 하이드레이션 전에 이미 요청이 끝나있을 수 있어
          // onError가 못 잡을 수 있음. ref 콜백으로 마운트 시점 상태를 한 번 더 확인.
          ref={(node) => {
            if (node?.complete && node.naturalWidth === 0) setFailed(true)
          }}
          src={src}
          alt={alt}
          className={`absolute inset-0 w-full h-full object-cover ${imgClassName}`}
          onError={() => setFailed(true)}
        />
      )}
    </div>
  )
}
