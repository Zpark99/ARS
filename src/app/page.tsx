import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import Header from '@/components/Header'
import LogoutButton from '@/components/auth/LogoutButton'

export default async function Home() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const userName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split('@')[0] ||
    '사용자'

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-1 px-6 py-8 flex flex-col gap-6">
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-semibold text-gray-900">
              환영합니다, {userName}님!
            </h2>
            <p className="text-sm text-gray-400">오늘은 어떤 음악을 들으셨나요?</p>
          </div>
          <LogoutButton />
        </div>

        <Link
          href="/search"
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-black text-white text-sm font-medium w-fit"
        >
          앨범 검색하기
        </Link>
      </main>
    </div>
  )
}
