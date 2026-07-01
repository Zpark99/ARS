import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isValidUUID } from '@/lib/validation/follow'

// POST /api/follows
// body: { targetUserId: string }
// 팔로우 토글 — 이미 팔로우 중이면 취소(DELETE), 아니면 등록(INSERT)
// 로그인 유저만 허용
export async function POST(req: NextRequest) {
  const supabase = await createClient()

  // ① 인증 검사
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    const status = authError ? 500 : 401
    return NextResponse.json(
      { error: authError ? '인증 확인에 실패했습니다' : '로그인이 필요합니다' },
      { status }
    )
  }

  let body: { targetUserId?: unknown }
  try {
    const raw = await req.json()
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
      return NextResponse.json({ error: '잘못된 요청 형식입니다' }, { status: 400 })
    }
    body = raw
  } catch {
    return NextResponse.json({ error: '잘못된 요청 형식입니다' }, { status: 400 })
  }

  const { targetUserId } = body

  // ② UUID 형식 검증
  if (!isValidUUID(targetUserId)) {
    return NextResponse.json({ error: 'targetUserId는 UUID 형식이어야 합니다' }, { status: 400 })
  }

  // ③ 자기 자신 팔로우 차단
  if (targetUserId === user.id) {
    return NextResponse.json({ error: '자기 자신을 팔로우할 수 없습니다' }, { status: 400 })
  }

  // ④ 기존 팔로우 존재 여부 확인
  const { data: existing, error: checkError } = await supabase
    .from('follows')
    .select('id')
    .eq('follower_id', user.id)
    .eq('following_id', targetUserId)
    .maybeSingle()

  if (checkError) {
    return NextResponse.json({ error: '팔로우 확인에 실패했습니다' }, { status: 500 })
  }

  let following: boolean
  if (existing) {
    // 취소 — RLS follows_delete_own 이 follower_id = auth.uid() 를 강제
    const { error } = await supabase.from('follows').delete().eq('id', existing.id)
    if (error) {
      return NextResponse.json({ error: '팔로우 취소에 실패했습니다' }, { status: 500 })
    }
    following = false
  } else {
    // 등록 — RLS follows_insert_own 이 follower_id = auth.uid() 를 강제
    // FK(following_id → auth.users) 위반(23503)이면 상대 유저 없음 → 404
    // UNIQUE 충돌(23505)은 race condition → 등록 처리로 간주
    const { error } = await supabase
      .from('follows')
      .insert({ follower_id: user.id, following_id: targetUserId })
    if (error) {
      if (error.code === '23503') {
        return NextResponse.json({ error: '존재하지 않는 유저입니다' }, { status: 404 })
      }
      if (error.code !== '23505') {
        return NextResponse.json({ error: '팔로우 등록에 실패했습니다' }, { status: 500 })
      }
    }
    following = true
  }

  // ⑤ 팔로워 수 COUNT — follower_count 컬럼 없이 즉시 집계
  const { count, error: countError } = await supabase
    .from('follows')
    .select('id', { count: 'exact', head: true })
    .eq('following_id', targetUserId)

  if (countError) {
    return NextResponse.json({ error: '팔로워 수 조회에 실패했습니다' }, { status: 500 })
  }

  return NextResponse.json({ following, followerCount: count ?? 0 })
}
