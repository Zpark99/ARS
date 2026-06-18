import Header from '@/components/Header'
import GalleryClient from '@/components/gallery/GalleryClient'
import { createClient } from '@/lib/supabase/server'
import type { GalleryPost } from '@/components/gallery/PostCard'

export default async function GalleryPage({
  params,
}: {
  params: Promise<{ artist: string }>
}) {
  const { artist } = await params
  // App Router는 params를 자동 decode하지만, 외부 링크 등 encode된 채로 올 경우도 방어
  const artistName = decodeURIComponent(artist)

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: posts } = await supabase
    .from('gallery_posts')
    .select('*')
    .eq('artist_name', artistName)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Header />
      <main>
        <GalleryClient
          artistName={artistName}
          initialPosts={(posts ?? []) as GalleryPost[]}
          currentUserId={user?.id ?? null}
        />
      </main>
    </div>
  )
}
