-- likes: 다형성 좋아요 (앨범 + 코멘트, 추후 확장 가능)
CREATE TABLE public.likes (
  id          UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID         NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_type TEXT         NOT NULL CHECK (target_type IN ('album', 'comment')),
  target_id   UUID         NOT NULL,
  created_at  TIMESTAMPTZ  DEFAULT now(),
  UNIQUE (user_id, target_type, target_id)   -- 유저당 같은 대상 1회
);

-- 조회 성능: 대상별 좋아요 수 집계용
CREATE INDEX idx_likes_target ON public.likes (target_type, target_id);

ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "likes_select_all" ON public.likes
  FOR SELECT USING (true);
CREATE POLICY "likes_insert_own" ON public.likes
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "likes_delete_own" ON public.likes
  FOR DELETE TO authenticated USING (auth.uid() = user_id);