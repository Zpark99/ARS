import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import LogoutButton from '@/components/auth/LogoutButton'

export default async function Home() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const userName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split('@')[0] ||
    '사용자'

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <h1 className="text-lg font-bold text-gray-900 tracking-tight">ARS</h1>
        <LogoutButton />
      </header>

      <main className="flex-1 px-6 py-8">
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-semibold text-gray-900">
            환영합니다, {userName}님!
          </h2>
          <p className="text-sm text-gray-400">
            오늘은 어떤 음악을 들으셨나요?
          </p>
        </div>
      </main>
    </div>
  )
}
