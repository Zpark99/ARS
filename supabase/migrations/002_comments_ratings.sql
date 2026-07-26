-- [소급] 이미 DB에 적용된 객체의 기록용. 재실행 금지 (already exists).
-- ratings 최초 생성 (score는 SMALLINT. 007_score_numeric.sql에서 numeric(2,1)로 전환됨)
-- comments 최초 생성 (album_id 기반 단일 대상.
--   008_comments_polymorphic.sql에서 target_type/target_id 다형성으로 전환되며
--   album_id 컬럼은 DROP됨)
--
-- ⚠️ 추정 표시된 부분: ratings.score 원본 CHECK 식은 007이 DROP한 제약(ratings_score_check)
-- 이라는 사실만 확인됐고 정확한 원본 범위 식은 기록이 남아있지 않아 1~5 정수로 추정함.

CREATE TABLE public.ratings (
  id          UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID         NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  album_id    UUID         NOT NULL REFERENCES public.albums(id) ON DELETE CASCADE,
  score       SMALLINT     NOT NULL CHECK (score >= 1 AND score <= 5),  -- 추정치, 원본 식 미확인
  created_at  TIMESTAMPTZ  DEFAULT now(),
  UNIQUE (user_id, album_id)
);

ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ratings_select_all" ON public.ratings
  FOR SELECT USING (true);
CREATE POLICY "ratings_insert_own" ON public.ratings
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
-- WITH CHECK는 이 시점엔 없음 → 011_ratings_update_with_check.sql에서 추가됨
CREATE POLICY "ratings_update_own" ON public.ratings
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "ratings_delete_own" ON public.ratings
  FOR DELETE TO authenticated USING (auth.uid() = user_id);


CREATE TABLE public.comments (
  id          UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID         NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  album_id    UUID         NOT NULL REFERENCES public.albums(id) ON DELETE CASCADE,
  content     TEXT         NOT NULL CHECK (char_length(content) <= 500),
  created_at  TIMESTAMPTZ  DEFAULT now()
);

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "comments_select_all" ON public.comments
  FOR SELECT USING (true);
CREATE POLICY "comments_insert_own" ON public.comments
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "comments_delete_own" ON public.comments
  FOR DELETE TO authenticated USING (auth.uid() = user_id);
