import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// DELETE /api/comments/[id]
// 본인 코멘트만 삭제 가능
//
// 보안 이중 방어:
//   1. RLS comments_delete_own — DB 레벨에서 auth.uid() = user_id 강제
//   2. .eq('user_id', user.id) — 서버 코드 레벨에서도 소유권 명시적 검증
//      → RLS 정책이 우회되거나 비활성화되더라도 타인 코멘트 삭제 원천 차단
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const supabase = await createClient()

  // ① 인증 검사
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 })
  }

  // ② 삭제 — user_id 조건 명시로 소유권 이중 검증
  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return NextResponse.json({ error: '코멘트 삭제에 실패했습니다' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
