'use client'

// onError 이벤트 핸들러가 필요하므로 클라이언트 컴포넌트로 분리
// (서버 컴포넌트에서는 이벤트 핸들러 사용 불가)
interface AlbumCoverProps {
  src: string | null
  alt: string
}

export default function AlbumCover({ src, alt }: AlbumCoverProps) {
  return (
    <div className="relative w-full aspect-square bg-gray-100 overflow-hidden">
      {/* 이미지 로드 실패 또는 cover_url 없을 때 보이는 placeholder */}
      <div className="absolute inset-0 flex items-center justify-center">
        <svg
          width="64"
          height="64"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="text-gray-300"
        >
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="3" />
          <line x1="12" y1="2" x2="12" y2="9" />
        </svg>
      </div>
      {src && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          className="absolute inset-0 w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.style.display = 'none'
          }}
        />
      )}
    </div>
  )
}
