-- [소급] 이미 DB에 적용된 객체의 기록용. 재실행 금지 (already exists).
-- gallery_posts: 갤러리 게시판 (board_posts와 별도 유지, 갤러리 전용 글).
-- 다른 테이블에 대한 의존이 없어 번호 000으로 가장 앞에 배치.

CREATE TABLE public.gallery_posts (
  id          UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID         NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  artist_name TEXT         NOT NULL,
  title       TEXT         NOT NULL CHECK (char_length(title) <= 100),
  content     TEXT         NOT NULL CHECK (char_length(content) <= 2000),
  created_at  TIMESTAMPTZ  DEFAULT now(),
  updated_at  TIMESTAMPTZ  DEFAULT now()
);

-- 아티스트별 최신순 목록 조회용
CREATE INDEX idx_gallery_artist_created ON public.gallery_posts (artist_name, created_at DESC);

ALTER TABLE public.gallery_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "gallery_select_all" ON public.gallery_posts
  FOR SELECT USING (true);
CREATE POLICY "gallery_insert_own" ON public.gallery_posts
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "gallery_update_own" ON public.gallery_posts
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "gallery_delete_own" ON public.gallery_posts
  FOR DELETE TO authenticated USING (auth.uid() = user_id);
