import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

// 프로필로 흡수됨(#71). 북마크·직접입력 호환을 위해 라우트는 유지하고 리다이렉트만 함.
export default async function MyPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  redirect(`/profile/${user.id}`)
}
