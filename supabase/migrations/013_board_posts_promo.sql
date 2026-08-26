-- board_posts: 홍보게시판(promo) 지원 추가. #77
-- 06 화면정의서 §2.5 홍보게시판 — 홍보글은 팀(artist) 선택 + 앨범 연결 필수.

ALTER TABLE public.board_posts
  DROP CONSTRAINT board_posts_board_type_check;

ALTER TABLE public.board_posts
  ADD CONSTRAINT board_posts_board_type_check
  CHECK (board_type IN ('qa', 'updates', 'promo'));

ALTER TABLE public.board_posts
  ADD COLUMN artist_id UUID REFERENCES public.artists(id),
  ADD COLUMN album_id  UUID REFERENCES public.albums(id);

-- promo 글은 artist_id/album_id 필수, qa/updates는 계속 NULL 허용
ALTER TABLE public.board_posts
  ADD CONSTRAINT board_posts_promo_requires_artist_album
  CHECK (board_type <> 'promo' OR (artist_id IS NOT NULL AND album_id IS NOT NULL));
