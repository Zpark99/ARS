'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LogoutButton() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogout = async () => {
    setIsLoading(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
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
