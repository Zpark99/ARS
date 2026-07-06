import { redirect } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import MyRatingsSection, { type MyRating } from '@/components/mypage/MyRatingsSection'
import MyCommentsSection, { type MyComment } from '@/components/mypage/MyCommentsSection'
import MyGalleryPostsSection, { type MyGalleryPost } from '@/components/mypage/MyGalleryPostsSection'
import MyLikedAlbumsSection, { type MyLikedAlbum } from '@/components/mypage/MyLikedAlbumsSection'
import type { AlbumRow } from '@/types/album'
import type { ProfileRow } from '@/types/profile'

export default async function MyPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [
    { data: profileData },
    { data: ratings },
    { data: comments },
    { data: posts },
    { data: likedIdsData },
  ] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, nickname, avatar_url, bio, created_at')
      .eq('id', user.id)
      .maybeSingle(),

    supabase
      .from('ratings')
      .select('score, created_at, albums!inner(id, mbid, title, artist_name, cover_url)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),

    supabase
      .from('comments')
      .select('id, content, created_at, albums!inner(id, mbid, title, artist_name, cover_url)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),

    supabase
      .from('gallery_posts')
      .select('id, artist_name, title, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),

    supabase
      .from('likes')
      .select('target_id')
      .eq('user_id', user.id)
      .eq('target_type', 'album')
      .order('created_at', { ascending: false }),
  ])

  const profile = profileData as ProfileRow | null

  // likes.target_id에 FK 없어 직접 조인
  const likedIds = (likedIdsData ?? []).map((l) => l.target_id)
  const likedAlbumsRaw =
    likedIds.length > 0
      ? ((await supabase
          .from('albums')
          .select('id, mbid, title, artist_name, cover_url')
          .in('id', likedIds)).data ?? [])
      : []

  // 좋아요 시간순 정렬 복원
  const likedMap = new Map(likedAlbumsRaw.map((a) => [a.id, a as AlbumRow]))
  const likedAlbums: MyLikedAlbum[] = likedIds
    .map((lid) => likedMap.get(lid))
    .filter((a): a is AlbumRow => !!a)

  const displayName =
    (profile?.nickname && profile.nickname.trim()) ||
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split('@')[0] ||
    '사용자'

  const myRatings = (ratings ?? []) as unknown as MyRating[]
  const myComments = (comments ?? []) as unknown as MyComment[]
  const myPosts = (posts ?? []) as MyGalleryPost[]

  return (
    <div className="min-h-screen bg-white">
      <main className="max-w-lg mx-auto pb-12">

        {/* 내 정보 */}
        <div className="px-4 pt-6 pb-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-start gap-4">
            {/* 아바타 */}
            <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800 ring-1 ring-border">
              {profile?.avatar_url ? (
                <Image
                  src={profile.avatar_url}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              ) : (
                <span className="flex h-full items-center justify-center text-2xl font-bold text-gray-300 dark:text-gray-600">
                  {displayName[0]?.toUpperCase() ?? '?'}
                </span>
              )}
            </span>

            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">내 계정</p>
              <p className="text-base font-bold text-gray-900 dark:text-gray-100 truncate">{displayName}</p>
              {user.email && (
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{user.email}</p>
              )}
              {profile?.bio && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 break-words">{profile.bio}</p>
              )}
            </div>
          </div>

          {/* 활동 요약 */}
          <div className="flex gap-5 mt-4">
            <div className="flex flex-col items-center">
              <span className="text-lg font-bold text-gray-900 dark:text-gray-100">{myRatings.length}</span>
              <span className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">별점</span>
            </div>
            <div className="w-px bg-gray-100 dark:bg-gray-800" />
            <div className="flex flex-col items-center">
              <span className="text-lg font-bold text-gray-900 dark:text-gray-100">{likedAlbums.length}</span>
              <span className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">좋아요</span>
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
            <MyLikedAlbumsSection albums={likedAlbums} />
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
