import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SearchInterface from '@/components/SearchInterface'

export default async function SearchPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900">
      <SearchInterface />
    </div>
  )
}
