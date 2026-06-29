import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isValidTargetType, isValidUUID, type LikeTargetType } from '@/lib/validation/like'

const TARGET_TABLE: Record<LikeTargetType, string> = {
  album: 'albums',
  comment: 'comments',
}

// POST /api/likes
// body: { targetType: 'album' | 'comment', targetId: string }
// 좋아요 토글 — 이미 누른 상태면 취소(DELETE), 아니면 등록(INSERT)
// 로그인 유저만 허용
export async function POST(req: NextRequest) {
  const supabase = await createClient()

  // ① 인증 검사
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 })
  }

  let body: { targetType?: unknown; targetId?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: '잘못된 요청 형식입니다' }, { status: 400 })
  }

  const { targetType, targetId } = body

  // ② 입력 검증
  if (!isValidTargetType(targetType)) {
    return NextResponse.json(
      { error: "targetType은 'album' 또는 'comment'여야 합니다" },
      { status: 400 }
    )
  }
  if (!isValidUUID(targetId)) {
    return NextResponse.json({ error: 'targetId는 UUID 형식이어야 합니다' }, { status: 400 })
  }

  // ③ 대상 존재 확인 — target_id에 FK가 없어 앱에서 직접 검증해야 함
  const { data: target, error: targetError } = await supabase
    .from(TARGET_TABLE[targetType])
    .select('id')
    .eq('id', targetId)
    .maybeSingle()

  if (targetError) {
    return NextResponse.json({ error: '대상 확인에 실패했습니다' }, { status: 500 })
  }
  if (!target) {
    return NextResponse.json({ error: '대상을 찾을 수 없습니다' }, { status: 404 })
  }

  // ④ 기존 좋아요 존재 여부 확인
  const { data: existing, error: checkError } = await supabase
    .from('likes')
    .select('id')
    .eq('user_id', user.id)
    .eq('target_type', targetType)
    .eq('target_id', targetId)
    .maybeSingle()

  if (checkError) {
    return NextResponse.json({ error: '좋아요 확인에 실패했습니다' }, { status: 500 })
  }

  let liked: boolean
  if (existing) {
    // 취소 — RLS likes_delete_own 이 user_id = auth.uid() 를 강제
    const { error } = await supabase.from('likes').delete().eq('id', existing.id)
    if (error) {
      return NextResponse.json({ error: '좋아요 취소에 실패했습니다' }, { status: 500 })
    }
    liked = false
  } else {
    // 등록 — RLS likes_insert_own 이 user_id = auth.uid() 를 강제
    // DB UNIQUE(user_id, target_type, target_id) 제약이 race condition 시 23505로 방어
    const { error } = await supabase
      .from('likes')
      .insert({ user_id: user.id, target_type: targetType, target_id: targetId })
    if (error && error.code !== '23505') {
      return NextResponse.json({ error: '좋아요 등록에 실패했습니다' }, { status: 500 })
    }
    liked = true
  }

  // ⑤ 현재 좋아요 수 COUNT — like_count 컬럼 없이 즉시 집계
  const { count, error: countError } = await supabase
    .from('likes')
    .select('id', { count: 'exact', head: true })
    .eq('target_type', targetType)
    .eq('target_id', targetId)

  if (countError) {
    return NextResponse.json({ error: '좋아요 수 조회에 실패했습니다' }, { status: 500 })
  }

  return NextResponse.json({ liked, count: count ?? 0 })
}
