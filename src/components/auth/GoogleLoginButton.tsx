'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4" />
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853" />
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05" />
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335" />
    </svg>
  )
}

export default function GoogleLoginButton() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async () => {
    setIsLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setError('로그인에 실패했습니다. 다시 시도해주세요.')
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full flex flex-col gap-3">
      <button
        onClick={handleLogin}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-3 h-12 px-6 bg-surface border border-border rounded-full text-text font-medium text-sm hover:bg-surface-raised active:bg-surface-raised transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
      >
        {isLoading ? (
          <span className="text-text-muted">로그인 중...</span>
        ) : (
          <>
            <GoogleIcon />
            <span>Google로 계속하기</span>
          </>
        )}
      </button>
      {error && (
        <p className="text-center text-xs text-red-500">{error}</p>
      )}
    </div>
  )
}
