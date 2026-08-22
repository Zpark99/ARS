-- artists: 갤러리 소유 단위(팀/아티스트) 정규화 테이블.
-- 기존에는 albums/gallery_posts의 artist_name(TEXT) 자유 문자열만 존재했음
-- (galleries 테이블은 애초에 없었음). #66.

CREATE TABLE public.artists (
  id                  UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  name                TEXT         NOT NULL UNIQUE,
  gallery_description TEXT,
  post_count          INTEGER      NOT NULL DEFAULT 0,
  subscriber_count    INTEGER      NOT NULL DEFAULT 0,
  is_gallery_open     BOOLEAN      NOT NULL DEFAULT true,
  created_at          TIMESTAMPTZ  DEFAULT now()
);

ALTER TABLE public.artists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "artists_select_all" ON public.artists
  FOR SELECT USING (true);

-- albums / gallery_posts의 distinct artist_name으로 백필.
-- 오탈자·공백 차이 정규화는 하지 않음 (exact match) — 범위 밖, 필요 시 별도 정리.
INSERT INTO public.artists (name)
SELECT DISTINCT artist_name FROM (
  SELECT artist_name FROM public.albums
  UNION
  SELECT artist_name FROM public.gallery_posts
) AS names
ON CONFLICT (name) DO NOTHING;

-- gallery_posts: artist_id 병행 추가. artist_name은 그대로 유지한다
-- (프론트에서 아직 artist_name 문자열 라우팅/조회에 의존 중 — 검증 후 별도 이슈로 폐기).
ALTER TABLE public.gallery_posts
  ADD COLUMN artist_id UUID REFERENCES public.artists(id),
  ADD COLUMN post_flag TEXT NOT NULL DEFAULT 'normal' CHECK (post_flag IN ('notice', 'concept', 'normal'));

UPDATE public.gallery_posts gp
SET artist_id = a.id
FROM public.artists a
WHERE a.name = gp.artist_name AND gp.artist_id IS NULL;

CREATE INDEX idx_gallery_posts_artist_created ON public.gallery_posts (artist_id, created_at DESC);
CREATE INDEX idx_gallery_posts_artist_flag    ON public.gallery_posts (artist_id, post_flag);

-- gallery_subscriptions: 갤러리(아티스트) 구독
CREATE TABLE public.gallery_subscriptions (
  user_id    UUID         NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  artist_id  UUID         NOT NULL REFERENCES public.artists(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ  DEFAULT now(),
  PRIMARY KEY (user_id, artist_id)
);

CREATE INDEX idx_gallery_subscriptions_artist ON public.gallery_subscriptions (artist_id);

ALTER TABLE public.gallery_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "gallery_subscriptions_select_own" ON public.gallery_subscriptions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "gallery_subscriptions_insert_own" ON public.gallery_subscriptions
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "gallery_subscriptions_delete_own" ON public.gallery_subscriptions
  FOR DELETE TO authenticated USING (auth.uid() = user_id);
