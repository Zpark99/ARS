import { notFound } from 'next/navigation'
import AlbumCover from '@/components/AlbumCover'
import RatingSection from '@/components/RatingSection'
import CommentSection from '@/components/CommentSection'
import AlbumLikeButton from '@/components/AlbumLikeButton'
import { createClient } from '@/lib/supabase/server'
import type { AlbumRow, CommentRow } from '@/types/album'

const MB_BASE = 'https://musicbrainz.org/ws/2'
const CAA_BASE = 'https://coverartarchive.org/release'
const USER_AGENT = 'ARS/1.0 (qkrwlswo96@gmail.com)'

interface MBArtistCredit {
  artist?: { name: string }
  name?: string
}
interface MBReleaseDetail {
  id: string
  title: string
  'artist-credit'?: MBArtistCredit[]
}

function toArtistName(credits?: MBArtistCredit[]): string {
  if (!credits?.length) return '알 수 없는 아티스트'
  const first = credits[0]
  return first.artist?.name ?? first.name ?? '알 수 없는 아티스트'
}

// mbid로 MusicBrainz 단건 조회 후 albums 테이블에 INSERT
// 이미 DB에 있으면 이 함수는 호출되지 않음 (SELECT 우선)
async function fetchAndInsertAlbum(
  mbid: string,
  supabase: Awaited<ReturnType<typeof createClient>>
): Promise<AlbumRow | null> {
  let res: Response
  try {
    res = await fetch(
      `${MB_BASE}/release/${mbid}?fmt=json&inc=artist-credits`,
      { headers: { 'User-Agent': USER_AGENT } }
    )
  } catch {
    return null
  }
  if (!res.ok) return null

  let release: MBReleaseDetail
  try {
    release = (await res.json()) as MBReleaseDetail
  } catch {
    return null
  }

  const { data, error } = await supabase
    .from('albums')
    .insert({
      mbid: release.id,
      title: release.title,
      artist_name: toArtistName(release['artist-credit']),
      cover_url: `${CAA_BASE}/${release.id}/front-250`,
    })
    .select()
    .single()

  if (error) return null
  return data as AlbumRow
}

export default async function AlbumPage({
  params,
}: {
  params: Promise<{ mbid: string }>
}) {
  const { mbid } = await params
  const supabase = await createClient()

  // 1. 검색 시 캐싱된 앨범 우선 조회
  const { data: cached } = await supabase
    .from('albums')
    .select('*')
    .eq('mbid', mbid)
    .maybeSingle()

  // 2. 캐시 미스 → MusicBrainz API 폴백 + INSERT
  //    직접 URL 입력이나 북마크로 접근할 때 대비
  const album: AlbumRow | null =
    cached ?? (await fetchAndInsertAlbum(mbid, supabase))

  if (!album) notFound()

  // 3. 로그인 유저 확인 — 클라이언트 토큰 대신 서버에서 항상 재검증
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // 4. 별점, 코멘트, 앨범 좋아요 수 병렬 조회
  const [ratingsResult, commentsResult, albumLikeCountResult] = await Promise.all([
    supabase.from('ratings').select('score, user_id').eq('album_id', album.id),
    supabase.from('comments').select('*').eq('album_id', album.id).order('created_at', { ascending: false }),
    supabase.from('likes').select('id', { count: 'exact', head: true }).eq('target_type', 'album').eq('target_id', album.id),
  ])

  const ratings = ratingsResult.data
  const comments = commentsResult.data
  const commentIds = (comments ?? []).map((c) => c.id)

  const ratingCount = ratings?.length ?? 0
  const ratingAvg =
    ratingCount > 0
      ? ratings!.reduce((s, r) => s + r.score, 0) / ratingCount
      : null
  const myScore = user
    ? (ratings?.find((r) => r.user_id === user.id)?.score ?? null)
    : null

  // 5. 유저별 좋아요 여부 + 코멘트 좋아요 목록 병렬 조회
  const [myAlbumLikeData, commentLikesData] = await Promise.all([
    user
      ? supabase.from('likes').select('id').eq('user_id', user.id).eq('target_type', 'album').eq('target_id', album.id).maybeSingle().then((r) => r.data)
      : Promise.resolve(null),
    commentIds.length > 0
      ? supabase.from('likes').select('target_id, user_id').eq('target_type', 'comment').in('target_id', commentIds).then((r) => r.data ?? [])
      : Promise.resolve([] as Array<{ target_id: string; user_id: string }>),
  ])

  const albumLiked = !!myAlbumLikeData
  const albumLikeCount = albumLikeCountResult.count ?? 0

  // 코멘트 ID별 좋아요 수 + 내 좋아요 여부 맵
  const commentLikes: Record<string, { count: number; liked: boolean }> = {}
  for (const id of commentIds) {
    const entries = commentLikesData.filter((l) => l.target_id === id)
    commentLikes[id] = {
      count: entries.length,
      liked: user ? entries.some((l) => l.user_id === user.id) : false,
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <main className="max-w-lg mx-auto">
        {/* 앨범 커버 — 모바일: 전체 너비, md 이상: 중앙 정렬 + 최대 너비 제한 */}
        <div className="md:max-w-xs md:mx-auto md:mt-6">
          <AlbumCover
            src={album.cover_url}
            alt={`${album.title} 앨범 커버`}
          />
        </div>

        {/* 앨범 정보 */}
        <div className="px-4 pt-4 pb-3">
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 leading-snug">
            {album.title}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{album.artist_name}</p>
          <div className="mt-3">
            <AlbumLikeButton
              albumId={album.id}
              initialLiked={albumLiked}
              initialCount={albumLikeCount}
              isLoggedIn={!!user}
            />
          </div>
        </div>

        {/* 별점 영역 */}
        <RatingSection
          albumId={album.id}
          initialAvg={ratingAvg}
          initialCount={ratingCount}
          initialMyScore={myScore}
          isLoggedIn={!!user}
        />

        {/* 코멘트 영역 */}
        <CommentSection
          albumId={album.id}
          initialComments={(comments ?? []) as CommentRow[]}
          currentUserId={user?.id ?? null}
          commentLikes={commentLikes}
        />
      </main>
    </div>
  )
}
