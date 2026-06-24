import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isValidComment, MAX_COMMENT_LENGTH } from '@/lib/validation/comment'
import type { CommentRow } from '@/types/album'

// GET /api/comments?album_id=<uuid>
// 최신순 코멘트 목록 반환
export async function GET(req: NextRequest) {
  const albumId = req.nextUrl.searchParams.get('album_id')
  if (!albumId) {
    return NextResponse.json({ error: 'album_id가 필요합니다' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('album_id', albumId)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: '코멘트 조회에 실패했습니다' }, { status: 500 })
  }

  return NextResponse.json({ comments: (data ?? []) as CommentRow[] })
}

// POST /api/comments
// body: { album_id: string, content: string }
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

  let body: { album_id?: unknown; content?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: '잘못된 요청 형식입니다' }, { status: 400 })
  }

  const { album_id, content } = body

  // ② 입력 검증
  if (typeof album_id !== 'string' || !album_id.trim()) {
    return NextResponse.json({ error: 'album_id가 필요합니다' }, { status: 400 })
  }
  // DB의 CHECK (char_length(content) <= 500) 전에 서버에서도 검증 — 클라이언트 우회 방어
  if (!isValidComment(content)) {
    return NextResponse.json(
      { error: `코멘트는 1자 이상 ${MAX_COMMENT_LENGTH}자 이하여야 합니다` },
      { status: 400 }
    )
  }

  // ③ 중복 코멘트 체크 — 같은 앨범에 이미 작성한 코멘트가 있으면 거부
  const { data: existing, error: checkError } = await supabase
    .from('comments')
    .select('id')
    .eq('album_id', album_id)
    .eq('user_id', user.id)
    .maybeSingle()

  if (checkError) {
    return NextResponse.json({ error: '코멘트 확인에 실패했습니다' }, { status: 500 })
  }

  if (existing) {
    return NextResponse.json(
      { error: '이미 이 앨범에 코멘트를 작성했습니다' },
      { status: 409 }
    )
  }

  // ④ insert — RLS comments_insert_own 이 user_id = auth.uid() 를 강제
  // DB에 UNIQUE(user_id, album_id) 제약이 있으면 race condition 시 23505 에러로 방어됨
  const { error } = await supabase
    .from('comments')
    .insert({ user_id: user.id, album_id, content: content.trim() })

  if (error) {
    const isDuplicate = error.code === '23505'
    return NextResponse.json(
      { error: isDuplicate ? '이미 이 앨범에 코멘트를 작성했습니다' : '코멘트 저장에 실패했습니다' },
      { status: isDuplicate ? 409 : 500 }
    )
  }

  return NextResponse.json({ ok: true })
}
