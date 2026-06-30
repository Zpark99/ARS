-- follows: 사용자 간 팔로우 (follower가 following을 팔로우)
CREATE TABLE public.follows (
  id           UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id  UUID         NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id UUID         NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at   TIMESTAMPTZ  DEFAULT now(),
  UNIQUE (follower_id, following_id),              -- 중복 팔로우 방지
  CHECK (follower_id <> following_id)              -- 자기 자신 팔로우 차단
);

-- 조회 성능: 팔로워 수 / 팔로잉 수 집계용
CREATE INDEX idx_follows_following ON public.follows (following_id);  -- 팔로워 수
CREATE INDEX idx_follows_follower  ON public.follows (follower_id);   -- 팔로잉 수

ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "follows_select_all" ON public.follows
  FOR SELECT USING (true);
CREATE POLICY "follows_insert_own" ON public.follows
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "follows_delete_own" ON public.follows
  FOR DELETE TO authenticated USING (auth.uid() = follower_id);