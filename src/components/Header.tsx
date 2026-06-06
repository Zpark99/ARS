'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function Header() {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const supabase = createClient()

    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setMenuOpen(false)
    router.push('/')
  }

  return (
    <header className="sticky top-0 z-20 h-14 bg-black flex items-center justify-between px-4">
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

      {/* 햄버거 버튼 + 드롭다운 */}
      <div className="relative">
        <button
          onClick={() => setMenuOpen((prev) => !prev)}
          className="text-white p-1"
          aria-label="메뉴 열기"
        >
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

        {menuOpen && (
          <>
            {/* 외부 클릭 닫기용 오버레이 */}
            <div
              className="fixed inset-0 z-10"
              onClick={() => setMenuOpen(false)}
            />
            {/* 드롭다운 메뉴 */}
            <div className="absolute right-0 top-10 z-20 w-32 bg-white rounded-xl shadow-lg overflow-hidden">
              {isLoggedIn ? (
                <button
                  onClick={handleSignOut}
                  className="w-full text-left text-sm text-gray-800 px-4 py-3 hover:bg-gray-50 active:bg-gray-100 transition-colors"
                >
                  로그아웃
                </button>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                  className="block text-sm text-gray-800 px-4 py-3 hover:bg-gray-50 active:bg-gray-100 transition-colors"
                >
                  로그인
                </Link>
              )}
            </div>
          </>
        )}
      </div>
    </header>
  )
}
