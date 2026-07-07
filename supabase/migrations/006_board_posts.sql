-- board_posts: QA·업데이트 통합 게시판 (board_type 구분)
-- 갤러리(gallery_posts)는 별도 유지
CREATE TABLE public.board_posts (
  id          UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID         NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  board_type  TEXT         NOT NULL CHECK (board_type IN ('qa', 'updates')),
  title       TEXT         NOT NULL CHECK (char_length(title) BETWEEN 1 AND 100),
  content     TEXT         NOT NULL CHECK (char_length(content) BETWEEN 1 AND 2000),
  created_at  TIMESTAMPTZ  DEFAULT now(),
  updated_at  TIMESTAMPTZ  DEFAULT now()
);

-- 게시판별 목록 조회용
CREATE INDEX idx_board_posts_type ON public.board_posts (board_type, created_at DESC);

ALTER TABLE public.board_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "board_posts_select_all" ON public.board_posts
  FOR SELECT USING (true);
CREATE POLICY "board_posts_insert_own" ON public.board_posts
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "board_posts_update_own" ON public.board_posts
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "board_posts_delete_own" ON public.board_posts
  FOR DELETE TO authenticated USING (auth.uid() = user_id);