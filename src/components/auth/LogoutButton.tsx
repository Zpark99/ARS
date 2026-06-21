'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type LogoutButtonProps = {
  className?: string
}

export default function LogoutButton({ className }: LogoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()           // ★ 빠져있던 것

  const handleLogout = async () => {
    try {
      setIsLoading(true)
      await supabase.auth.signOut()
      router.refresh()                       // RSC 캐시 무효화 (순서 유지: refresh → push)
      router.push('/')
    } catch (e) {
      console.error('로그아웃 실패:', e)      // ★ 에러 삼키지 말 것
      setIsLoading(false)                    // 실패 시 버튼 원복
    }
  }

  return (
    <button
      onClick={handleLogout}
      disabled={isLoading}
      className={
        className ??
        'text-sm text-gray-500 hover:text-gray-700 active:text-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
      }
    >
      {isLoading ? '로그아웃 중...' : '로그아웃'}
    </button>
  )
}