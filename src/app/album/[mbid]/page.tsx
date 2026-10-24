import type { Metadata } from 'next'
import { albumMetadata } from '@/lib/seo'
import { notFound } from 'next/navigation'
import { AlbumHubClient } from '@/components/album/AlbumHubClient'
import { createClient } from '@/lib/supabase/server'
import { fetchNicknameMap, authorName } from '@/lib/profiles'
import { isValidUUID } from '@/lib/validation/like'
import type { AlbumRow, CommentRow, CommentWithAuthor } from '@/types/album'
import type { PromoCardData } from '@/components/cards/PromoCard'
import type { GalleryRowData, GalleryPostFlag } from '@/components/cards/GalleryRow'
import { formatDate } from '@/lib/date'

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

// <title> "{앨범명} - {아티스트}" (#196). 못 찾으면 기본 제목, 404 판정은 아래 page가 담당
export async function generateMetadata({ params }: { params: Promise<{ mbid: string }> }): Promise<Metadata> {
  return albumMetadata((await params).mbid)
}

export default async function AlbumPage({
  params,
}: {
  params: Promise<{ mbid: string }>
}) {
  const { mbid } = await params

  // 더미/가짜 라우팅 식별자가 라이브까지 새는 걸 막는 가드 (#109, mbid-1류 재발 3회 방지)
  // MusicBrainz mbid도 UUID 형식이라 이 검증으로 커버됨.
  // ponytail: CI/pre-commit lint 스크립트는 생략 — 전수 점검 결과 위반 0건이라 지금은
  // 과설계. 이 런타임 가드로 재발은 이미 막히고, 실제로 또 새면 그때 스크립트 추가.
  if (!isValidUUID(mbid)) {
    console.error(`invalid album mbid format: ${mbid} (path: /album/${mbid})`)
    notFound()
  }

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
    supabase.from('comments').select('*').eq('target_type', 'album').eq('target_id', album.id).order('created_at', { ascending: false }),
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

  // 7. 홍보 탭: board_posts WHERE board_type='promo' AND album_id=album.id (#100 인덱스 사용)
  //    갤러리 탭: album_id 컬럼 없음 → artists.name = album.artist_name으로 artist_id를 찾아
  //    gallery_posts를 필터 (#100 결정). 매칭 실패 시 빈 배열 = 빈 상태(에러 아님, #101은 별도 이슈).
  const [promoResult, artistResult] = await Promise.all([
    supabase
      .from('board_posts')
      .select('id, title, like_count, created_at, artists(name), artist_name_text')
      .eq('board_type', 'promo')
      .eq('album_id', album.id)
      .order('created_at', { ascending: false })
      .limit(20),
    supabase.from('artists').select('id').eq('name', album.artist_name).maybeSingle(),
  ])

  // PostgREST는 FK 방향(board_posts.artist_id → artists.id, to-one)에서 배열이 아니라
  // 단일 객체로 embed를 반환한다 (실제 REST 응답으로 확인, supabase-js 기본 타입 추론은
  // Database 제네릭이 없어 부정확하게 배열로 잡음 → unknown 경유로 실제 런타임 형태에 맞춤).
  type PromoPostRow = {
    id: string
    title: string
    like_count: number
    created_at: string
    artists: { name: string } | null
    artist_name_text: string | null
  }
  const promoRows = (promoResult.data ?? []) as unknown as PromoPostRow[]
  const promoIds = promoRows.map((p) => p.id)

  const commentCounts: Record<string, number> = {}
  if (promoIds.length > 0) {
    const { data: promoComments, error: promoCommentsErr } = await supabase
      .from('comments')
      .select('target_id')
      .eq('target_type', 'post')
      .in('target_id', promoIds)
    if (promoCommentsErr) {
      console.error('promo comments fetch failed:', promoCommentsErr)
    }
    for (const c of promoComments ?? []) {
      commentCounts[c.target_id] = (commentCounts[c.target_id] ?? 0) + 1
    }
  }

  const promos: PromoCardData[] = promoRows.map((p) => ({
    id: p.id,
    title: p.title,
    team: p.artists?.name ?? p.artist_name_text ?? null,
    thumbnailUrl: null,
    likeCount: p.like_count,
    commentCount: commentCounts[p.id] ?? 0,
    time: formatDate(p.created_at),
  }))

  let galleryPosts: GalleryRowData[] = []
  if (artistResult.data) {
    type GalleryPostRow = {
      id: string
      title: string
      user_id: string
      created_at: string
      post_flag: GalleryPostFlag
      like_count: number
    }
    const { data: galleryRows, error: galleryErr } = await supabase
      .from('gallery_posts')
      .select('id, title, user_id, created_at, post_flag, like_count')
      .eq('artist_id', artistResult.data.id)
      .order('created_at', { ascending: false })
      .limit(20)
    if (galleryErr) {
      console.error('gallery posts fetch failed:', galleryErr)
    }

    const rows = (galleryRows ?? []) as GalleryPostRow[]
    const names = await fetchNicknameMap(supabase, rows.map((g) => g.user_id))
    galleryPosts = rows.map((g) => ({
      id: g.id,
      title: g.title,
      author: authorName(names, g.user_id),
      likeCount: g.like_count,
      time: formatDate(g.created_at),
      flag: g.post_flag,
    }))
  }

  const commentRows = (comments ?? []) as CommentRow[]
  const commentNames = await fetchNicknameMap(supabase, commentRows.map((c) => c.user_id))
  const commentsWithAuthor: CommentWithAuthor[] = commentRows.map((c) => ({ ...c, author: authorName(commentNames, c.user_id) }))

  return (
    <AlbumHubClient
      albumId={album.id}
      title={album.title}
      artistName={album.artist_name}
      coverUrl={album.cover_url}
      isLoggedIn={!!user}
      currentUserId={user?.id ?? null}
      albumLiked={albumLiked}
      albumLikeCount={albumLikeCount}
      ratingAvg={ratingAvg}
      ratingCount={ratingCount}
      myScore={myScore}
      comments={commentsWithAuthor}
      commentLikes={commentLikes}
      promos={promos}
      galleryPosts={galleryPosts}
      galleryArtistId={artistResult.data?.id ?? null}
    />
  )
}
