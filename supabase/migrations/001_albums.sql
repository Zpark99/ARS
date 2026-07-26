-- [소급] 이미 DB에 적용된 객체의 기록용. 재실행 금지 (already exists).
-- albums: 앨범 카탈로그 (MusicBrainz mbid 기준 unique).
-- like_count 컬럼은 이 시점엔 없음 → 010_like_count_columns.sql에서 추가됨.

CREATE TABLE public.albums (
  id          UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  mbid        TEXT         NOT NULL UNIQUE,
  title       TEXT         NOT NULL,
  artist_name TEXT         NOT NULL,
  cover_url   TEXT,
  created_at  TIMESTAMPTZ  DEFAULT now()
);

ALTER TABLE public.albums ENABLE ROW LEVEL SECURITY;

-- 앨범은 누구나 조회 가능, 등록은 로그인 유저 전체 허용 (개인 소유 개념 없음)
CREATE POLICY "albums_select_all" ON public.albums
  FOR SELECT USING (true);
CREATE POLICY "albums_insert_authenticated" ON public.albums
  FOR INSERT TO authenticated WITH CHECK (true);
