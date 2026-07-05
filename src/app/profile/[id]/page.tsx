import { notFound } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import FollowButton from '@/components/profile/FollowButton'
import UserAlbumList from '@/components/profile/UserAlbumList'
import type { AlbumRow } from '@/types/album'
import type { ProfileRow } from '@/types/profile'

type RatingWithAlbum = {
  score: number
  created_at: string
  albums: AlbumRow
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  // 1. 프로필 + 로그인 유저 병렬 조회
  const [profileResult, authResult] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, nickname, avatar_url, bio, created_at')
      .eq('id', id)
      .maybeSingle(),
    supabase.auth.getUser(),
  ])

  const profile = profileResult.data as ProfileRow | null
  if (!profile) notFound()

  const user = authResult.data.user
  const isOwn = user?.id === id

  // 2. 팔로워 수 / 팔로잉 수 / 내 팔로우 여부 병렬 조회
  const [followerResult, followingResult, myFollowResult] = await Promise.all([
    supabase
      .from('follows')
      .select('id', { count: 'exact', head: true })
      .eq('following_id', id),
    supabase
      .from('follows')
      .select('id', { count: 'exact', head: true })
      .eq('follower_id', id),
    user && !isOwn
      ? supabase
          .from('follows')
          .select('id')
          .eq('follower_id', user.id)
          .eq('following_id', id)
          .maybeSingle()
          .then((r) => r.data)
      : Promise.resolve(null),
  ])

  const followerCount = followerResult.count ?? 0
  const followingCount = followingResult.count ?? 0
  const isFollowing = !!myFollowResult

  // 3. 평가한 앨범 + 좋아요한 앨범 ID 병렬 조회
  const [ratingsResult, likedIdsResult] = await Promise.all([
    supabase
      .from('ratings')
      .select('score, created_at, albums!inner(id, mbid, title, artist_name, cover_url)')
      .eq('user_id', id)
      .order('created_at', { ascending: false }),
    supabase
      .from('likes')
      .select('target_id')
      .eq('user_id', id)
      .eq('target_type', 'album')
      .order('created_at', { ascending: false }),
  ])

  const ratings = (ratingsResult.data ?? []) as unknown as RatingWithAlbum[]

  // likes.target_id에 FK 없어 직접 조인
  const likedIds = (likedIdsResult.data ?? []).map((l) => l.target_id)
  const likedAlbumsRaw =
    likedIds.length > 0
      ? ((await supabase
          .from('albums')
          .select('id, mbid, title, artist_name, cover_url')
          .in('id', likedIds)).data ?? [])
      : []

  // 좋아요 시간순 정렬 복원
  const likedMap = new Map(likedAlbumsRaw.map((a) => [a.id, a as AlbumRow]))
  const likedAlbums = likedIds.map((lid) => likedMap.get(lid)).filter((a): a is AlbumRow => !!a)

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <main className="max-w-lg mx-auto pb-12">

        {/* 프로필 헤더 */}
        <div className="px-4 pt-6 pb-5 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-start gap-4">
            {/* 아바타 */}
            <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800 ring-1 ring-border">
              {profile.avatar_url ? (
                <Image
                  src={profile.avatar_url}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              ) : (
                <span className="flex h-full items-center justify-center text-2xl font-bold text-gray-300 dark:text-gray-600">
                  {profile.nickname?.[0]?.toUpperCase() ?? '?'}
                </span>
              )}
            </span>

            <div className="flex-1 min-w-0">
              <p className="text-base font-bold text-gray-900 dark:text-gray-100 truncate">
                {profile.nickname}
              </p>
              {profile.bio && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 break-words">
                  {profile.bio}
                </p>
              )}
              {!isOwn && (
                <div className="mt-2.5">
                  <FollowButton
                    targetUserId={id}
                    initialFollowing={isFollowing}
                    initialFollowerCount={followerCount}
                    isLoggedIn={!!user}
                  />
                </div>
              )}
            </div>
          </div>

          {/* 팔로워 / 팔로잉 / 평가 수 */}
          <div className="flex gap-5 mt-5">
            <div className="flex flex-col items-center">
              <span className="text-lg font-bold text-gray-900 dark:text-gray-100">{followerCount}</span>
              <span className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">팔로워</span>
            </div>
            <div className="w-px bg-gray-100 dark:bg-gray-800" />
            <div className="flex flex-col items-center">
              <span className="text-lg font-bold text-gray-900 dark:text-gray-100">{followingCount}</span>
              <span className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">팔로잉</span>
            </div>
            <div className="w-px bg-gray-100 dark:bg-gray-800" />
            <div className="flex flex-col items-center">
              <span className="text-lg font-bold text-gray-900 dark:text-gray-100">{ratings.length}</span>
              <span className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">평가</span>
            </div>
          </div>
        </div>

        {/* 평가한 앨범 */}
        <UserAlbumList
          title="평가한 앨범"
          emptyText="아직 평가한 앨범이 없어요"
          rightMark="score"
          items={ratings.map((r) => ({ album: r.albums, score: r.score }))}
        />

        {/* 좋아요한 앨범 */}
        <UserAlbumList
          title="좋아요한 앨범"
          emptyText="아직 좋아요한 앨범이 없어요"
          rightMark="heart"
          items={likedAlbums.map((album) => ({ album }))}
        />

      </main>
    </div>
  )
}
