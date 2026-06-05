import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { SearchResult } from '@/types/search'

const MB_BASE = 'https://musicbrainz.org/ws/2'
const CAA_BASE = 'https://coverartarchive.org/release'
const USER_AGENT = 'ARS/1.0 (qkrwlswo96@gmail.com)'

interface MBArtistCredit {
  artist?: { name: string }
  name?: string
}

interface MBRelease {
  id: string
  title: string
  'artist-credit': MBArtistCredit[]
}

// MB API 검색 응답의 최상위 구조 (fmt=json)
interface MBSearchResponse {
  releases?: MBRelease[]
}

function toArtistName(credits: MBArtistCredit[]): string {
  if (!credits?.length) return '알 수 없는 아티스트'
  const first = credits[0]
  return first.artist?.name ?? first.name ?? '알 수 없는 아티스트'
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim()
  if (!q) {
    return NextResponse.json({ error: '검색어를 입력하세요' }, { status: 400 })
  }

  let mbRes: Response
  try {
    mbRes = await fetch(
      `${MB_BASE}/release?query=${encodeURIComponent(q)}&fmt=json&limit=20`,
      { headers: { 'User-Agent': USER_AGENT } }
    )
  } catch {
    return NextResponse.json(
      { error: '네트워크 에러가 발생했습니다. 연결을 확인해주세요' },
      { status: 503 }
    )
  }

  // MB는 rate limit 초과 시 503 반환 (429가 아님)
  if (mbRes.status === 503) {
    return NextResponse.json(
      { error: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요' },
      { status: 503 }
    )
  }

  if (!mbRes.ok) {
    return NextResponse.json(
      { error: `MusicBrainz API 오류 (${mbRes.status})` },
      { status: mbRes.status }
    )
  }

  let data: MBSearchResponse
  try {
    data = (await mbRes.json()) as MBSearchResponse
  } catch {
    return NextResponse.json(
      { error: 'MusicBrainz 응답을 파싱할 수 없습니다' },
      { status: 502 }
    )
  }

  const releases: MBRelease[] = data.releases ?? []

  const results: SearchResult[] = releases.map((r) => ({
    mbid: r.id,
    title: r.title,
    artist_name: toArtistName(r['artist-credit']),
    cover_url: `${CAA_BASE}/${r.id}/front-250`,
  }))

  // 인증된 유저일 경우에만 Supabase에 upsert 캐싱 — 실패해도 응답은 정상 반환
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user && results.length > 0) {
      await supabase.from('albums').upsert(
        results.map(({ mbid, title, artist_name, cover_url }) => ({
          mbid,
          title,
          artist_name,
          cover_url,
        })),
        { onConflict: 'mbid' }
      )
    }
  } catch {
    // 캐싱 실패는 응답에 영향 없음
  }

  return NextResponse.json({ results })
}
