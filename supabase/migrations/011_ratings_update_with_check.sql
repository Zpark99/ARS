-- [소급] 이미 DB에 적용된 객체의 기록용. 재실행 금지 (already exists).
-- DB 마이그레이션 히스토리(supabase_migrations.schema_migrations)에
-- "fix_ratings_update_with_check"라는 이름으로만 남아있고 대응 파일이 없던 변경.
-- ratings_update_own 정책에 WITH CHECK를 추가해, UPDATE로 소유권을 다른 유저에게
-- 넘기는 시도(user_id를 남의 것으로 바꾸는 것)를 막는다.
-- 002_comments_ratings.sql의 원본 정책은 USING만 있었고, 이 변경으로 WITH CHECK가 추가됨.

ALTER POLICY "ratings_update_own" ON public.ratings
  WITH CHECK (auth.uid() = user_id);
