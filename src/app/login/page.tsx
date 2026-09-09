import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import GoogleLoginButton from '@/components/auth/GoogleLoginButton'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect('/')
  }

  const { error } = await searchParams

  return (
    <div className="min-h-screen flex flex-col bg-bg">
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        {/* 로고 영역 */}
        <div className="flex flex-col items-center gap-4 mb-14">
          <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center">
            <span className="text-white text-2xl font-bold tracking-tight">A</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <h1 className="text-2xl font-bold text-text tracking-tight">ARS</h1>
            <p className="text-sm text-text-muted tracking-wide">Album Review Service</p>
          </div>
        </div>

        {/* 설명 텍스트 */}
        <div className="text-center mb-12">
          <p className="text-text-muted text-base leading-relaxed">
            좋아하는 음악을 기록하고
            <br />
            나만의 리뷰를 남겨보세요
          </p>
        </div>

        {/* 로그인 버튼 영역 */}
        <div className="w-full max-w-xs flex flex-col gap-4">
          {error && (
            <p className="text-center text-xs text-red-500">
              로그인에 실패했습니다. 다시 시도해주세요.
            </p>
          )}
          <GoogleLoginButton />
        </div>
      </main>

      <footer className="pb-8 text-center">
        <p className="text-xs text-text-muted">
          © 2025 ARS. All rights reserved.
        </p>
      </footer>
    </div>
  )
}
