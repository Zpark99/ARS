import BoardClient from '@/components/board/BoardClient'
import { createClient } from '@/lib/supabase/server'
import type { BoardPost } from '@/components/board/BoardPostCard'

export default async function PromoPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const [{ data: posts }, { data: artists }] = await Promise.all([
    supabase
      .from('board_posts')
      .select('*, artist:artists(name), album:albums(title)')
      .eq('board_type', 'promo')
      .order('created_at', { ascending: false }),
    supabase.from('artists').select('id, name').order('name'),
  ])

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <main>
        <BoardClient
          boardType="promo"
          boardLabel="홍보"
          initialPosts={(posts ?? []) as BoardPost[]}
          currentUserId={user?.id ?? null}
          artists={artists ?? []}
        />
      </main>
    </div>
  )
}
