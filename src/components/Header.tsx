import Link from 'next/link'

export default function Header() {
  return (
    <header className="sticky top-0 z-20 h-14 bg-black flex items-center justify-between px-4">
      {/* ARS pill 로고 + 헤드폰 아이콘 */}
      <Link href="/" aria-label="홈으로" className="flex items-center gap-1.5 bg-white rounded-full px-3 py-1.5">
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-black"
        >
          <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
          <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3z" />
          <path d="M3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
        </svg>
        <span className="text-black font-bold text-sm tracking-wide">ARS</span>
      </Link>

      {/* 햄버거 메뉴 (기능은 추후 구현) */}
      <button className="text-white p-1" aria-label="메뉴 열기">
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>
    </header>
  )
}
