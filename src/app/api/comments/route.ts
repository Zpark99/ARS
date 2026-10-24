import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isValidComment, isValidCommentTargetType, MAX_COMMENT_LENGTH } from '@/lib/validation/comment'
import { isValidUUID } from '@/lib/validation/like'
import type { CommentRow, CommentWithAuthor } from '@/types/album'
import { fetchNicknameMap, authorName } from '@/lib/profiles'

// GET /api/comments?targetType=album&targetId=<uuid>
// 최신순 코멘트 목록 반환
export async function GET(req: NextRequest) {
  const targetType = req.nextUrl.searchParams.get('targetType')
  const targetId = req.nextUrl.searchParams.get('targetId')
  if (!isValidCommentTargetType(targetType) || !isValidUUID(targetId)) {
    return NextResponse.json({ error: 'targetType, targetId가 필요합니다' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('target_type', targetType)
    .eq('target_id', targetId)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: '코멘트 조회에 실패했습니다' }, { status: 500 })
  }

  const rows = (data ?? []) as CommentRow[]
  const names = await fetchNicknameMap(supabase, rows.map((c) => c.user_id))
  const comments: CommentWithAuthor[] = rows.map((c) => ({ ...c, author: authorName(names, c.user_id) }))
  return NextResponse.json({ comments })
}

// POST /api/comments
// body: { targetType: 'album' | 'post', targetId: string, content: string }
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

  let body: { targetType?: unknown; targetId?: unknown; content?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: '잘못된 요청 형식입니다' }, { status: 400 })
  }

  const { targetType, targetId, content } = body

  // ② 입력 검증
  if (!isValidCommentTargetType(targetType) || !isValidUUID(targetId)) {
    return NextResponse.json({ error: 'targetType, targetId가 필요합니다' }, { status: 400 })
  }
  // DB의 CHECK (char_length(content) <= 500) 전에 서버에서도 검증 — 클라이언트 우회 방어
  if (!isValidComment(content)) {
    return NextResponse.json(
      { error: `코멘트는 1자 이상 ${MAX_COMMENT_LENGTH}자 이하여야 합니다` },
      { status: 400 }
    )
  }

  // ③ 중복 코멘트 체크 — 같은 대상에 이미 작성한 코멘트가 있으면 거부
  const { data: existing, error: checkError } = await supabase
    .from('comments')
    .select('id')
    .eq('target_type', targetType)
    .eq('target_id', targetId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (checkError) {
    return NextResponse.json({ error: '코멘트 확인에 실패했습니다' }, { status: 500 })
  }

  if (existing) {
    return NextResponse.json(
      { error: '이미 이 대상에 코멘트를 작성했습니다' },
      { status: 409 }
    )
  }

  // ④ insert — RLS comments_insert_own 이 user_id = auth.uid() 를 강제
  const { error } = await supabase
    .from('comments')
    .insert({ user_id: user.id, target_type: targetType, target_id: targetId, content: content.trim() })

  if (error) {
    const isDuplicate = error.code === '23505'
    return NextResponse.json(
      { error: isDuplicate ? '이미 이 대상에 코멘트를 작성했습니다' : '코멘트 저장에 실패했습니다' },
      { status: isDuplicate ? 409 : 500 }
    )
  }

  return NextResponse.json({ ok: true })
}
