import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { RatingSummary } from '@/types/album'

// GET /api/ratings?album_id=<uuid>
// 앨범 평균 별점, 평가 수, 로그인 유저의 별점을 한 번의 SELECT로 반환
export async function GET(req: NextRequest) {
  const albumId = req.nextUrl.searchParams.get('album_id')
  if (!albumId) {
    return NextResponse.json({ error: 'album_id가 필요합니다' }, { status: 400 })
  }

  const supabase = await createClient()

  const { data: rows, error } = await supabase
    .from('ratings')
    .select('score, user_id')
    .eq('album_id', albumId)

  if (error) {
    return NextResponse.json({ error: '별점 조회에 실패했습니다' }, { status: 500 })
  }

  const count = rows?.length ?? 0
  const avg =
    count > 0 ? rows!.reduce((s, r) => s + r.score, 0) / count : null

  // 로그인 유저의 별점은 이미 가져온 rows에서 필터링 — 추가 쿼리 불필요
  let myScore: number | null = null
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (user) {
    myScore = rows?.find((r) => r.user_id === user.id)?.score ?? null
  }

  const summary: RatingSummary = { avg, count, myScore }
  return NextResponse.json(summary)
}

// POST /api/ratings
// body: { album_id: string, score: number (1~5 정수) }
// 로그인 유저만 허용. 기존 별점이 있으면 업데이트(upsert).
export async function POST(req: NextRequest) {
  const supabase = await createClient()

  // ① 인증 검사 — 클라이언트 토큰을 서버에서 항상 재검증
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 })
  }

  let body: { album_id?: unknown; score?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: '잘못된 요청 형식입니다' }, { status: 400 })
  }

  const { album_id, score } = body

  // ② 입력 검증 — DB의 CHECK 제약 전에 서버에서 먼저 걸러냄
  if (typeof album_id !== 'string' || !album_id.trim()) {
    return NextResponse.json({ error: 'album_id가 필요합니다' }, { status: 400 })
  }
  if (
    typeof score !== 'number' ||
    !Number.isInteger(score) ||
    score < 1 ||
    score > 5
  ) {
    return NextResponse.json(
      { error: 'score는 1~5 정수여야 합니다' },
      { status: 400 }
    )
  }

  // ③ upsert — UNIQUE(user_id, album_id) 충돌 시 score 업데이트
  //    RLS ratings_insert_own / ratings_update_own 이 user_id = auth.uid() 를 강제
  const { error } = await supabase
    .from('ratings')
    .upsert(
      { user_id: user.id, album_id, score },
      { onConflict: 'user_id,album_id' }
    )

  if (error) {
    return NextResponse.json({ error: '별점 저장에 실패했습니다' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
