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
  const supabase = createClient()

  const handleLogout = async () => {
    try {
      setIsLoading(true)
      await supabase.auth.signOut()
      router.push('/')
      router.refresh()
    } catch (e) {
      console.error('로그아웃 실패:', e)
      setIsLoading(false)
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