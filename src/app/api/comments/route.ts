import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { CommentRow } from '@/types/album'

const MAX_CONTENT_LENGTH = 500

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
  if (typeof content !== 'string' || !content.trim()) {
    return NextResponse.json({ error: '코멘트 내용을 입력해주세요' }, { status: 400 })
  }
  // DB의 CHECK (char_length(content) <= 500) 전에 서버에서도 검증 — 클라이언트 우회 방어
  if (content.length > MAX_CONTENT_LENGTH) {
    return NextResponse.json(
      { error: `코멘트는 ${MAX_CONTENT_LENGTH}자 이하여야 합니다` },
      { status: 400 }
    )
  }

  // ③ insert — RLS comments_insert_own 이 user_id = auth.uid() 를 강제
  const { error } = await supabase
    .from('comments')
    .insert({ user_id: user.id, album_id, content: content.trim() })

  if (error) {
    return NextResponse.json({ error: '코멘트 저장에 실패했습니다' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
