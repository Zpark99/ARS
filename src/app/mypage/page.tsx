import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import MyRatingsSection, { type MyRating } from '@/components/mypage/MyRatingsSection'
import MyCommentsSection, { type MyComment } from '@/components/mypage/MyCommentsSection'
import MyGalleryPostsSection, { type MyGalleryPost } from '@/components/mypage/MyGalleryPostsSection'

export default async function MyPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const displayName =
    user.user_metadata?.full_name ??
    user.user_metadata?.name ??
    user.email?.split('@')[0] ??
    '사용자'

  const [{ data: ratings }, { data: comments }, { data: posts }] = await Promise.all([
    supabase
      .from('ratings')
      .select('score, created_at, albums(mbid, title, artist_name, cover_url)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),

    supabase
      .from('comments')
      .select('id, content, created_at, albums(mbid, title, artist_name, cover_url)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),

    supabase
      .from('gallery_posts')
      .select('id, artist_name, title, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
  ])

  const myRatings = (ratings ?? []) as unknown as MyRating[]
  const myComments = (comments ?? []) as unknown as MyComment[]
  const myPosts = (posts ?? []) as MyGalleryPost[]

  return (
    <div className="min-h-screen bg-white">
      <main className="max-w-lg mx-auto pb-12">

        {/* 내 정보 */}
        <div className="px-4 pt-6 pb-4 border-b border-gray-100 dark:border-gray-800">
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">내 계정</p>
          <p className="text-base font-bold text-gray-900 dark:text-gray-100">{displayName}</p>
          {user.email && (
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{user.email}</p>
          )}

          {/* 활동 요약 */}
          <div className="flex gap-5 mt-4">
            <div className="flex flex-col items-center">
              <span className="text-lg font-bold text-gray-900 dark:text-gray-100">{myRatings.length}</span>
              <span className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">별점</span>
            </div>
            <div className="w-px bg-gray-100 dark:bg-gray-800" />
            <div className="flex flex-col items-center">
              <span className="text-lg font-bold text-gray-900 dark:text-gray-100">{myComments.length}</span>
              <span className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">코멘트</span>
            </div>
            <div className="w-px bg-gray-100 dark:bg-gray-800" />
            <div className="flex flex-col items-center">
              <span className="text-lg font-bold text-gray-900 dark:text-gray-100">{myPosts.length}</span>
              <span className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">갤러리 글</span>
            </div>
          </div>
        </div>

        {/* 섹션별 목록 */}
        <div className="flex flex-col divide-y divide-gray-100 dark:divide-gray-800">
          <div className="pt-5 pb-2">
            <MyRatingsSection ratings={myRatings} />
          </div>
          <div className="pt-5 pb-2">
            <MyCommentsSection comments={myComments} />
          </div>
          <div className="pt-5 pb-2">
            <MyGalleryPostsSection posts={myPosts} />
          </div>
        </div>

      </main>
    </div>
  )
}
