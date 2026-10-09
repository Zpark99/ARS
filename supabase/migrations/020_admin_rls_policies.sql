-- 020_admin_rls_policies.sql
-- #125 role 체계 도입 (2단계: RLS 정책 교체)
--
-- 파트 0 실증(비관리자 JWT로 실제 시도, 전부 롤백)에서 확인된 뚫림 3개를 막는다:
--   ① board_posts board_type='updates' 직접 INSERT     -> INSERT 정책에 조건 추가
--   ② 본인 qa/promo 글을 board_type='updates'로 UPDATE  -> UPDATE WITH CHECK 신설
--   ③ gallery_posts post_flag='notice' 직접 INSERT/전환  -> INSERT/UPDATE 양쪽
--
-- "정책 추가"로는 못 막는다: 같은 cmd의 PERMISSIVE 정책은 OR로 합쳐지므로
-- 느슨한 기존 정책이 남아 있으면 엄격한 정책을 더해도 통과한다. 그래서 교체(DROP+CREATE).
-- 원본 정의는 000_gallery_posts.sql:20-27 / 006_board_posts.sql:18-25 (롤백 시 그대로 복원).
--
-- ②의 뿌리는 UPDATE 정책에 WITH CHECK가 없어서 USING이 신규 행 검사까지 겸한 것.
-- 아래는 WITH CHECK를 명시해 같은 실수가 다시 안 생기게 한다.

BEGIN;

-- board_posts: 'updates'는 관리자만
DROP POLICY IF EXISTS "board_posts_insert_own" ON public.board_posts;
CREATE POLICY "board_posts_insert_own" ON public.board_posts
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND (board_type <> 'updates' OR public.is_admin())
  );

DROP POLICY IF EXISTS "board_posts_update_own" ON public.board_posts;
CREATE POLICY "board_posts_update_own" ON public.board_posts
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND (board_type <> 'updates' OR public.is_admin())
  );

-- gallery_posts: post_flag='notice'는 관리자만 ('concept'/'normal'은 누구나)
DROP POLICY IF EXISTS "gallery_insert_own" ON public.gallery_posts;
CREATE POLICY "gallery_insert_own" ON public.gallery_posts
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND (post_flag <> 'notice' OR public.is_admin())
  );

DROP POLICY IF EXISTS "gallery_update_own" ON public.gallery_posts;
CREATE POLICY "gallery_update_own" ON public.gallery_posts
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND (post_flag <> 'notice' OR public.is_admin())
  );

COMMIT;
