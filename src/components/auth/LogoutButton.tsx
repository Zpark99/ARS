'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LogoutButton() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogout = async () => {
    setIsLoading(true)
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      // refresh()로 RSC 캐시를 무효화해야 뒤로가기 시 보호된 페이지가 노출되지 않음
      router.refresh()
      router.push('/login')
    } catch {
      // signOut 실패 시 버튼이 영구 비활성화되지 않도록 상태 복구
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleLogout}
      disabled={isLoading}
      className="text-sm text-gray-500 hover:text-gray-700 active:text-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isLoading ? '로그아웃 중...' : '로그아웃'}
    </button>
  )
}
