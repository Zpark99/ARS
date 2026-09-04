import BoardClient from '@/components/board/BoardClient'
import { createClient } from '@/lib/supabase/server'
import type { BoardPost } from '@/components/board/BoardPostCard'

export default async function UpdatesPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: posts } = await supabase
    .from('board_posts')
    .select('*')
    .eq('board_type', 'updates')
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-bg">
      <main>
        <BoardClient
          boardType="updates"
          boardLabel="업데이트"
          initialPosts={(posts ?? []) as BoardPost[]}
          currentUserId={user?.id ?? null}
        />
      </main>
    </div>
  )
}
